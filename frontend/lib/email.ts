interface EmailData {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailData) {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

  if (!BREVO_API_KEY) {
    console.error('BREVO_API_KEY is not configured');
    throw new Error('Email service not configured');
  }

  const emailData = {
    sender: {
      name: 'Kateri Pharmacy',
      email: process.env.MAIL_FROM || process.env.FROM_EMAIL || 'noreply@kateripharmacy.com',
    },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  };

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Brevo API error: ${errorData.message || response.statusText}`);
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}
