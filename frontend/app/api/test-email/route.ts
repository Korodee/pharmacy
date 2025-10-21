import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { to } = await request.json();
    
    await sendEmail({
      to: to || process.env.ADMIN_EMAIL || 'koroskki@gmail.com',
      subject: 'Test Email from Kateri Pharmacy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0A438C;">Email Configuration Test</h2>
          <p>This is a test email to verify that the Brevo email integration is working correctly.</p>
          <p><strong>From:</strong> ${process.env.MAIL_FROM || process.env.FROM_EMAIL}</p>
          <p><strong>To:</strong> ${to || process.env.ADMIN_EMAIL}</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent successfully' 
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}
