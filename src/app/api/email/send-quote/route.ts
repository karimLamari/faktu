import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import Quote from '@/models/Quote';
import Client from '@/models/Client';
import User from '@/models/User';
import { getQuoteEmailHtml, getQuoteEmailText } from '@/lib/templates/quote-email';
import { generateQuotePdf } from '@/lib/services/pdf-generator';
import { isProfileComplete, getMissingProfileFields } from '@/lib/utils/profile';
import { PLANS } from '@/lib/subscription/plans';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Validation schema
const sendQuoteSchema = z.object({
  quoteId: z.string().min(1, 'Quote ID required'),
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
    const validation = sendQuoteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { quoteId, recipientEmail, customMessage } = validation.data;

    // Connect to database
    await dbConnect();

    // Fetch quote with user verification
    const quote: any = await Quote.findOne({
      _id: quoteId,
      userId: session.user.id,
    }).lean();

    if (!quote) {
      return NextResponse.json(
        { error: 'Devis introuvable' },
        { status: 404 }
      );
    }

    // Fetch client
    const client: any = await Client.findById(quote.clientId).lean();
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

    // Vérifier que le profil est complet
    if (!isProfileComplete(user)) {
      const missingFields = getMissingProfileFields(user);
      return NextResponse.json({
        error: 'Profil incomplet',
        message: `Veuillez compléter votre profil pour envoyer des devis par email. Champs manquants : ${missingFields.join(', ')}`,
        missingFields
      }, { status: 400 });
    }

    // Vérifier que l'utilisateur a accès à l'envoi d'emails
    const userPlan = user.subscription?.plan || 'free';
    const planFeatures = PLANS[userPlan];

    if (!planFeatures.emailAutomation) {
      return NextResponse.json({
        error: 'Fonctionnalité non disponible',
        message: 'L\'envoi automatique d\'emails est disponible uniquement pour les plans Pro et Business.',
        featureBlocked: true,
        plan: userPlan,
        requiredPlan: 'pro',
        upgradeUrl: '/dashboard/pricing'
      }, {
        status: 403,
        headers: {
          'X-Feature-Required': 'emailAutomation',
          'X-Upgrade-Plan': 'pro'
        }
      });
    }

    // Determine recipient email (use provided or client's email)
    const toEmail = recipientEmail || client.email;

    // Prepare email data
    const emailData = {
      clientName: client.name || 'Client',
      quoteNumber: quote.quoteNumber,
      total: quote.total,
      validUntil: quote.validUntil.toString(),
      companyName: user.companyName || `${user.firstName} ${user.lastName}`,
      subtotal: quote.subtotal,
      taxAmount: quote.total - quote.subtotal,
    };

    // Generate email HTML and text
    const htmlContent = getQuoteEmailHtml(emailData);
    const textContent = getQuoteEmailText(emailData);

    // Generate PDF attachment with @react-pdf/renderer (faster and lighter than Puppeteer)
    const pdfBuffer = await generateQuotePdf({
      quote,
      client,
      user
    });

    console.log('📄 Taille du PDF:', (pdfBuffer.length / 1024 / 1024).toFixed(2), 'MB');

    // Resend limite : 40MB par email
    if (pdfBuffer.length > 40 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Le PDF est trop volumineux (>40MB). Réduisez la taille de votre logo.' },
        { status: 400 }
      );
    }

    // Send email via Resend
    const senderName = user.companyName || `${user.firstName} ${user.lastName}`;

    console.log('📧 Envoi email devis:', {
      from: `${senderName} <contact@quxly.fr>`,
      to: toEmail,
      subject: `Devis ${quote.quoteNumber} - ${senderName}`,
      pdfSize: `${(pdfBuffer.length / 1024).toFixed(2)} KB`,
    });

    let emailResponse;
    try {
      emailResponse = await resend.emails.send({
        from: `${senderName} <contact@quxly.fr>`,
        to: toEmail,
        subject: `Devis ${quote.quoteNumber} - ${senderName}`,
        html: htmlContent,
        text: textContent,
        attachments: [
          {
            filename: `Devis-${quote.quoteNumber}.pdf`,
            content: Buffer.from(pdfBuffer),
          },
        ],
      });
    } catch (resendError: any) {
      console.error('❌ Erreur lors de l\'appel à Resend:', resendError);
      throw new Error(`Erreur Resend: ${resendError.message || 'Impossible d\'envoyer l\'email'}`);
    }

    console.log('📧 Réponse Resend:', JSON.stringify(emailResponse, null, 2));

    if (!emailResponse.data) {
      console.error('❌ Erreur Resend - Pas de data:', JSON.stringify(emailResponse, null, 2));
      throw new Error(emailResponse.error?.message || 'Erreur lors de l\'envoi de l\'email');
    }

    // Update quote with sentAt timestamp and change status from draft to sent
    await Quote.findByIdAndUpdate(quoteId, {
      sentAt: new Date(),
      status: quote.status === 'draft' ? 'sent' : quote.status,
    });

    return NextResponse.json({
      success: true,
      message: 'Devis envoyé par email avec succès',
      emailId: emailResponse.data.id,
      sentTo: toEmail,
    });

  } catch (error: any) {
    console.error('Error sending quote email:', error);

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
