import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Test endpoint to verify Resend configuration
export async function GET(req: NextRequest) {
  try {
    // Check if API key exists
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'RESEND_API_KEY not configured',
        message: 'Ajoutez RESEND_API_KEY dans votre fichier .env.local',
      }, { status: 500 });
    }

    // Check if API key format is valid
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey.startsWith('re_')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid API key format',
        message: 'La clé API Resend doit commencer par "re_"',
      }, { status: 500 });
    }

    // Initialize Resend
    const resend = new Resend(apiKey);

    // Try to send a test email
    console.log('🧪 Testing Resend with API key:', apiKey.substring(0, 10) + '...');
    
    const result = await resend.emails.send({
      from: 'Test FAKTU <test@mail.faktu.com>',
      to: 'mirakiramal@gmail.com', // Votre email de test
      subject: 'Test Email from FAKTU',
      html: '<p>Ceci est un email de test pour vérifier la configuration Resend.</p>',
    });

    console.log('✅ Test email result:', JSON.stringify(result, null, 2));

    if (result.data) {
      return NextResponse.json({
        success: true,
        message: 'Resend est correctement configuré!',
        emailId: result.data.id,
        details: result,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'No data in response',
        message: 'Resend a répondu mais sans données',
        details: result,
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ Test Resend error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.toString(),
      stack: error.stack,
    }, { status: 500 });
  }
}
