import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import crypto from 'crypto';
import { getPasswordResetEmailHtml, getPasswordResetEmailText } from '@/lib/templates/password-reset-email';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    await dbConnect();

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    // Ne pas révéler si l'email existe ou non (sécurité)
    if (!user) {
      // Retourner succès même si user n'existe pas
      return NextResponse.json({ 
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé' 
      });
    }

    // Générer token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 heure

    // Sauvegarder le token dans la DB
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();

    // Construire l'URL de réinitialisation
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    // Envoyer l'email de réinitialisation via Resend
    try {
      const emailHtml = getPasswordResetEmailHtml({
        firstName: user.firstName,
        resetUrl,
      });
      
      const emailText = getPasswordResetEmailText({
        firstName: user.firstName,
        resetUrl,
      });

      const emailResponse = await resend.emails.send({
        from: 'BLINK <noreply@quxly.fr>',
        to: user.email,
        subject: 'Réinitialisation de votre mot de passe BLINK',
        html: emailHtml,
        text: emailText,
      });

      if (!emailResponse.data) {
        console.error('❌ Erreur Resend - Pas de data:', emailResponse);
        throw new Error('Impossible d\'envoyer l\'email de réinitialisation');
      }

      console.log('✅ Email de réinitialisation envoyé:', emailResponse.data.id);

    } catch (emailError: any) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', emailError);
      // On ne retourne pas d'erreur au client pour des raisons de sécurité
      // (ne pas révéler si l'email existe ou non)
    }

    return NextResponse.json({ 
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
      // En dev, on retourne l'URL pour faciliter les tests
      dev_resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined
    });

  } catch (error) {
    console.error('Erreur forgot password:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'envoi de l\'email' 
    }, { status: 500 });
  }
}
