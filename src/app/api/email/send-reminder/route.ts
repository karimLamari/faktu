import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import Invoice from '@/models/Invoice';
import Client from '@/models/Client';
import User from '@/models/User';
import { getReminderEmailHtml, getReminderEmailText } from '@/lib/templates/reminder-email';
import { generatePdfBuffer } from '@/lib/services/pdf-generator';
import { InvoiceHtml } from '@/lib/templates/invoice-pdf-template';
import { PLANS } from '@/lib/subscription/plans';
import { isProfileComplete, getMissingProfileFields } from '@/lib/utils/profile';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Validation schema
const sendReminderSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID required'),
  reminderType: z.enum(['friendly', 'firm', 'final']).default('friendly'),
  customMessage: z.string().optional(),
  recipientEmail: z.string().email('Invalid email').optional(),
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
    const validation = sendReminderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { invoiceId, reminderType, customMessage, recipientEmail } = validation.data;

    // Connect to database
    await dbConnect();

    // Fetch user first to check subscription plan
    const user: any = await User.findById(session.user.id).lean();
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    // Check if payment reminders are allowed for this plan
    const userPlan = user.subscription?.plan || 'free';
    const planFeatures = PLANS[userPlan];
    
    if (!planFeatures.paymentReminders) {
      return NextResponse.json(
        {
          error: 'Fonctionnalité non disponible',
          message: 'Les rappels de paiement automatiques sont disponibles uniquement pour les plans Pro et Business.',
          featureBlocked: true,
          plan: userPlan,
          requiredPlan: 'pro',
          upgradeUrl: '/dashboard/pricing'
        },
        {
          status: 403,
          headers: {
            'X-Feature-Required': 'paymentReminders',
            'X-Upgrade-Plan': 'pro'
          }
        }
      );
    }

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

    // Check invoice status (should be sent, overdue, or partially_paid)
    if (!['sent', 'overdue', 'partially_paid'].includes(invoice.status)) {
      return NextResponse.json(
        { error: 'Impossible de relancer cette facture. Statut invalide.' },
        { status: 400 }
      );
    }

    // Check if already paid
    if (invoice.paymentStatus === 'paid') {
      return NextResponse.json(
        { error: 'Cette facture est déjà payée' },
        { status: 400 }
      );
    }

    // Rate limiting: check last reminder (prevent spam)
    const reminders = invoice.reminders || [];
    const lastReminder = reminders[reminders.length - 1];
    if (lastReminder) {
      const daysSinceLastReminder = Math.floor(
        (Date.now() - new Date(lastReminder.sentAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastReminder < 7) {
        return NextResponse.json(
          { 
            error: 'Vous devez attendre au moins 7 jours entre deux relances',
            daysSinceLastReminder,
          },
          { status: 429 }
        );
      }
    }

    // Fetch client
    const client: any = await Client.findById(invoice.clientId).lean();
    if (!client || !client.email) {
      return NextResponse.json(
        { error: 'Client ou email client introuvable' },
        { status: 400 }
      );
    }

    // Vérifier que le profil est complet
    if (!isProfileComplete(user)) {
      const missingFields = getMissingProfileFields(user);
      return NextResponse.json({ 
        error: 'Profil incomplet',
        message: `Veuillez compléter votre profil pour envoyer des rappels. Champs manquants : ${missingFields.join(', ')}`,
        missingFields
      }, { status: 400 });
    }

    // Calculate days past due
    const dueDate = new Date(invoice.dueDate);
    const now = new Date();
    const daysPastDue = Math.max(0, Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Determine recipient email
    const toEmail = recipientEmail || client.email;

    // Prepare email data
    const emailData = {
      clientName: client.name || 'Client',
      invoiceNumber: invoice.invoiceNumber,
      total: invoice.balanceDue || invoice.total,
      dueDate: invoice.dueDate.toString(),
      daysPastDue,
      companyName: user.companyName || `${user.firstName} ${user.lastName}`,
      customMessage,
      pdfUrl: invoice.pdfUrl,
    };

    // Generate email HTML and text
    const htmlContent = getReminderEmailHtml(emailData, reminderType);
    const textContent = getReminderEmailText(emailData, reminderType);

    // Generate PDF attachment
    const invoiceHtml = InvoiceHtml({ invoice, client, user });
    const pdfBuffer = await generatePdfBuffer(invoiceHtml);

    // Determine email subject based on reminder type
    const subjects = {
      friendly: `Rappel - Facture ${invoice.invoiceNumber}`,
      firm: `Relance de paiement - Facture ${invoice.invoiceNumber}`,
      final: `Dernière relance - Facture ${invoice.invoiceNumber}`,
    };

    // Send email via Resend
    const senderName = user.companyName || `${user.firstName} ${user.lastName}`;
    const emailResponse = await resend.emails.send({
      from: `${senderName} <contact@quxly.fr>`,
      to: toEmail,
      subject: subjects[reminderType],
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
      throw new Error('Erreur lors de l\'envoi de la relance');
    }

    // Add reminder to invoice
    await Invoice.findByIdAndUpdate(invoiceId, {
      $push: {
        reminders: {
          sentAt: new Date(),
          sentBy: session.user.email || session.user.id,
          type: reminderType,
          customMessage,
        },
      },
      // Update status to overdue if past due date
      ...(daysPastDue > 0 && invoice.status !== 'overdue' ? { status: 'overdue' } : {}),
    });

    return NextResponse.json({
      success: true,
      message: 'Relance envoyée avec succès',
      emailId: emailResponse.data.id,
      sentTo: toEmail,
      reminderType,
      totalReminders: reminders.length + 1,
    });

  } catch (error: any) {
    console.error('Error sending reminder email:', error);
    
    // Handle Resend specific errors
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'Configuration email invalide. Vérifiez la clé API Resend.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de la relance', details: error.message },
      { status: 500 }
      );
  }
}
