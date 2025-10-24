import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import Invoice from '@/models/Invoice';
import Client from '@/models/Client';
import User from '@/models/User';
import { getInvoiceEmailHtml, getInvoiceEmailText } from '@/lib/templates/invoice-email';
import { generatePdfBuffer } from '@/lib/services/pdf-generator';
import { InvoiceHtml } from '@/lib/templates/invoice-pdf-template';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Validation schema
const sendInvoiceSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID required'),
  recipientEmail: z.string().email('Invalid email').optional(),
  customMessage: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = sendInvoiceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { invoiceId, recipientEmail, customMessage } = validation.data;

    // Connect to database
    await dbConnect();

    // Fetch invoice with user verification
    const invoice: any = await Invoice.findOne({
      _id: invoiceId,
      userId: session.user.id,
    }).lean();

    if (!invoice) {
      return NextResponse.json(
        { error: 'Facture introuvable' },
        { status: 404 }
      );
    }

    // Fetch client
    const client: any = await Client.findById(invoice.clientId).lean();
    if (!client || !client.email) {
      return NextResponse.json(
        { error: 'Client ou email client introuvable' },
        { status: 400 }
      );
    }

    // Fetch user (sender) information
    const user: any = await User.findById(session.user.id).lean();
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    // Determine recipient email (use provided or client's email)
    const toEmail = recipientEmail || client.email;

    // Prepare email data
    const emailData = {
      clientName: client.name || 'Client',
      invoiceNumber: invoice.invoiceNumber,
      total: invoice.total,
      dueDate: invoice.dueDate.toString(),
      companyName: user.companyName,
      pdfUrl: invoice.pdfUrl,
    };

    // Generate email HTML and text
    const htmlContent = getInvoiceEmailHtml(emailData);
    const textContent = getInvoiceEmailText(emailData);

    // Generate PDF attachment
    const invoiceHtml = InvoiceHtml({ invoice, client, user });
    const pdfBuffer = await generatePdfBuffer(invoiceHtml);

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: `${user.companyName} <contact@quxly.fr>`,
      to: toEmail,
      subject: `Facture ${invoice.invoiceNumber} - ${user.companyName}`,
      html: htmlContent,
      text: textContent,
      attachments: [
        {
          filename: `Facture-${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (!emailResponse.data) {
      throw new Error('Erreur lors de l\'envoi de l\'email');
    }

    // Update invoice with sentAt timestamp
    await Invoice.findByIdAndUpdate(invoiceId, {
      sentAt: new Date(),
      status: invoice.status === 'draft' ? 'sent' : invoice.status,
    });

    return NextResponse.json({
      success: true,
      message: 'Facture envoyée par email avec succès',
      emailId: emailResponse.data.id,
      sentTo: toEmail,
    });

  } catch (error: any) {
    console.error('Error sending invoice email:', error);
    
    // Handle Resend specific errors
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'Configuration email invalide. Vérifiez la clé API Resend.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'email', details: error.message },
      { status: 500 }
    );
  }
}
