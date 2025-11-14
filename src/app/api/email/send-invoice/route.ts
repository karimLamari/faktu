import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import Invoice from '@/models/Invoice';
import InvoiceTemplate from '@/models/InvoiceTemplate';
import Client from '@/models/Client';
import User from '@/models/User';
import { getInvoiceEmailHtml, getInvoiceEmailText } from '@/lib/templates/invoice-email';
import { generateInvoicePdf } from '@/lib/services/pdf-generator';
import { sendEmailWithRetry } from '@/lib/services/email-service';
import { DEFAULT_TEMPLATE } from '@/lib/invoice-templates';
import { PLANS } from '@/lib/subscription/plans';
import { isProfileComplete, getMissingProfileFields } from '@/lib/utils/profile';

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

    // Fetch user first to check subscription plan
    const user: any = await User.findById(session.user.id).lean();
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    // Check if email automation is allowed for this plan
    const userPlan = user.subscription?.plan || 'free';
    const planFeatures = PLANS[userPlan];
    
    if (!planFeatures.emailAutomation) {
      return NextResponse.json(
        {
          error: 'Fonctionnalité non disponible',
          message: 'L\'envoi automatique d\'emails est disponible uniquement pour les plans Pro et Business.',
          featureBlocked: true,
          plan: userPlan,
          requiredPlan: 'pro',
          upgradeUrl: '/dashboard/pricing'
        },
        {
          status: 403,
          headers: {
            'X-Feature-Required': 'emailAutomation',
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
        message: `Veuillez compléter votre profil pour envoyer des factures par email. Champs manquants : ${missingFields.join(', ')}`,
        missingFields
      }, { status: 400 });
    }

    // Determine recipient email (use provided or client's email)
    const toEmail = recipientEmail || client.email;

    // Prepare email data
    const emailData = {
      clientName: client.name || 'Client',
      invoiceNumber: invoice.invoiceNumber,
      total: invoice.total,
      dueDate: invoice.dueDate.toString(),
      companyName: user.companyName || `${user.firstName} ${user.lastName}`,
      pdfUrl: invoice.pdfUrl,
    };

    // Generate email HTML and text
    const htmlContent = getInvoiceEmailHtml(emailData);
    const textContent = getInvoiceEmailText(emailData);

    // Get user template for PDF generation
    const userTemplate = await InvoiceTemplate.findOne({
      userId: user._id,
      isDefault: true
    });
    const template = userTemplate || DEFAULT_TEMPLATE;

    // Generate PDF attachment with @react-pdf/renderer
    const pdfBuffer = await generateInvoicePdf({
      invoice,
      client,
      user,
      template
    });

    // Send email via Resend with retry logic
    const senderName = user.companyName || `${user.firstName} ${user.lastName}`;
    const emailResponse = await sendEmailWithRetry({
      from: `${senderName} <contact@quxly.fr>`,
      to: toEmail,
      subject: `Facture ${invoice.invoiceNumber} - ${senderName}`,
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

    // 🔒 FINALISER LA FACTURE APRÈS ENVOI RÉUSSI
    // Appeler l'endpoint de finalisation interne
    if (!invoice.isFinalized) {
      try {
        // Utiliser fetch interne pour appeler /finalize
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const finalizeResponse = await fetch(`${baseUrl}/api/invoices/${invoiceId}/finalize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Passer le token de session pour l'authentification
            'Cookie': req.headers.get('cookie') || '',
          },
        });

        if (!finalizeResponse.ok) {
          console.warn('⚠️ Échec finalisation automatique:', await finalizeResponse.text());
          // Ne pas bloquer l'envoi email si finalisation échoue
          // Juste mettre à jour sentAt comme avant
          await Invoice.findByIdAndUpdate(invoiceId, {
            sentAt: new Date(),
            status: invoice.status === 'draft' ? 'sent' : invoice.status,
          });
        } else {
          console.log('✅ Facture finalisée automatiquement après envoi email');
        }
      } catch (finalizeError) {
        console.error('❌ Erreur finalisation automatique:', finalizeError);
        // Fallback: juste mettre à jour sentAt
        await Invoice.findByIdAndUpdate(invoiceId, {
          sentAt: new Date(),
          status: invoice.status === 'draft' ? 'sent' : invoice.status,
        });
      }
    } else {
      // Déjà finalisée, juste mettre à jour sentAt
      await Invoice.findByIdAndUpdate(invoiceId, {
        sentAt: new Date(),
        status: invoice.status === 'draft' ? 'sent' : invoice.status,
      });
    }

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
