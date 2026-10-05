import { Resend } from 'resend';
import nodemailer from 'nodemailer';

/**
 * Institutional Email Dispatch Service
 * Handles delivery of OTP verification codes, reservation confirmations, and receipts.
 * Supports Resend API (preferred) and SMTP via Nodemailer, with a local dev fallback.
 */

let resendClient = null;
let smtpTransporter = null;

function getResendClient() {
  if (resendClient) return resendClient;
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    resendClient = new Resend(apiKey);
    console.log('[EMAIL_SERVICE] Configured Resend API client');
  }
  return resendClient;
}

function getSmtpTransporter() {
  if (smtpTransporter) return smtpTransporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    smtpTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
    console.log(`[EMAIL_SERVICE] Configured SMTP transport via ${host}:${port}`);
  }

  return smtpTransporter;
}

/**
 * Low-level email dispatcher using Resend, SMTP, or Dev fallback
 */
async function sendEmail({ to, subject, html, text }) {
  const resend = getResendClient();

  if (resend) {
    let from = process.env.EMAIL_FROM || 'Dine Security <onboarding@resend.dev>';
    if (/@(hotmail\.com|gmail\.com|yahoo\.com|outlook\.com)/i.test(from)) {
      from = 'Dine Security <onboarding@resend.dev>';
    }
    let { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text
    });

    // If custom domain is still propagating verification, fallback to onboarding sender so delivery doesn't fail
    if (error && error.message && error.message.includes('not verified') && from !== 'Dine Security <onboarding@resend.dev>') {
      console.warn(`[EMAIL_SERVICE] Domain in sender "${from}" is pending verification. Temporarily falling back to onboarding sender.`);
      const retry = await resend.emails.send({
        from: 'Dine Security <onboarding@resend.dev>',
        to,
        subject,
        html,
        text
      });
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error(`[EMAIL_SERVICE_ERROR] Resend delivery failed to ${to}:`, error);
      throw new Error(`Resend email delivery failed: ${error.message || JSON.stringify(error)}`);
    }

    console.log(`[EMAIL_SERVICE] Dispatched email to ${to} via Resend (ID: ${data?.id})`);
    return { success: true, messageId: data?.id, provider: 'resend' };
  }

  const mailTransporter = getSmtpTransporter();

  if (mailTransporter) {
    const from = process.env.EMAIL_FROM || '"Dine Security" <sahi0045@hotmail.com>';
    const info = await mailTransporter.sendMail({
      from,
      to,
      subject,
      text,
      html
    });
    console.log(`[EMAIL_SERVICE] Dispatched email to ${to} via SMTP (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId, provider: 'smtp' };
  }

  if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
    throw new Error('Neither RESEND_API_KEY nor SMTP is configured. Email cannot be delivered in production.');
  }

  console.log(`[EMAIL DISPATCH] To: ${to} | Subject: "${subject}" logged locally because no email provider is set (development mode)`);
  return { success: true, simulated: true };
}

/**
 * Send 6-digit OTP verification passkey to institutional user
 */
export async function sendOtpEmail({ to, name, otp }) {
  const subject = 'Your Dine@Bennett Institutional Access Code';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f7f6f2; color: #11120d; margin: 0; padding: 24px; }
          .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e8e2d5; padding: 32px; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
          .header { text-align: center; border-bottom: 1px solid #f0ebe1; padding-bottom: 20px; margin-bottom: 24px; }
          .logo { font-size: 20px; font-weight: 700; letter-spacing: -0.5px; color: #11120d; }
          .code-box { background: #fbf9f5; border: 1.5px dashed #2563eb; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0; }
          .code { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1e3a8a; font-family: monospace; }
          .footer { font-size: 12px; color: #6b7280; text-align: center; margin-top: 28px; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Dine@Bennett · Campus Dining</div>
          </div>
          <p>Hello${name ? ` ${name}` : ''},</p>
          <p>Here is your institutional one-time passkey to authenticate your dining session:</p>
          <div class="code-box">
            <div class="code">${otp}</div>
          </div>
          <p style="font-size: 14px; color: #4b5563;">This code is valid for <strong>10 minutes</strong>. Never share this code with anyone.</p>
          <div class="footer">
            Bennett University Institutional Dining Network<br>
            If you did not request this passkey, please ignore this email.
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `Your Dine@Bennett one-time verification passkey is: ${otp}. It expires in 10 minutes.`;

  return sendEmail({ to, subject, html, text });
}

/**
 * Send reservation confirmation email
 */
export async function sendBookingConfirmationEmail({ to, name, booking }) {
  const subject = `Confirmed: Table at ${booking.restaurantName} (#${booking.id})`;
  const text = `Your reservation #${booking.id} at ${booking.restaurantName} is confirmed for ${booking.guests} guests on ${booking.date} at ${booking.time}. Table: ${booking.tableAssigned || 'TBD'}.`;
  const html = `<p>Hello${name ? ` ${name}` : ''},</p><p>Your reservation <strong>#${booking.id}</strong> at <strong>${booking.restaurantName}</strong> is confirmed for ${booking.guests} guests on ${booking.date} at ${booking.time}. Table: ${booking.tableAssigned || 'TBD'}.</p>`;

  try {
    return await sendEmail({ to, subject, html, text });
  } catch (err) {
    console.warn('[EMAIL_SERVICE] Failed sending booking confirmation email:', err.message);
  }
}

export default {
  sendOtpEmail,
  sendBookingConfirmationEmail
};
