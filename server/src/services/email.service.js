import nodemailer from 'nodemailer';

/**
 * Institutional Email Dispatch Service
 * Handles delivery of OTP verification codes, reservation confirmations, and receipts.
 */

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
    console.log(`[EMAIL_SERVICE] Configured SMTP transport via ${host}:${port}`);
  }

  return transporter;
}

/**
 * Send 6-digit OTP verification passkey to institutional user
 */
export async function sendOtpEmail({ to, name, otp }) {
  const mailTransporter = getTransporter();
  const from = process.env.EMAIL_FROM || '"Dine@Bennett Security" <dining@bennett.edu.in>';
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

  if (mailTransporter) {
    try {
      const info = await mailTransporter.sendMail({
        from,
        to,
        subject,
        text: `Your Dine@Bennett one-time verification passkey is: ${otp}. It expires in 10 minutes.`,
        html
      });
      console.log(`[EMAIL_SERVICE] Dispatched OTP to ${to} (MessageId: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`[EMAIL_SERVICE_ERROR] Failed sending email to ${to}:`, err.message);
      throw err;
    }
  } else {
    // In dev mode when SMTP is not configured, log to server terminal only
    console.log(`\n======================================================`);
    console.log(`[EMAIL DISPATCH] To: ${to}`);
    console.log(`[EMAIL SUBJECT]  ${subject}`);
    console.log(`[SECURITY OTP]   ${otp}`);
    console.log(`[NOTE] Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env for live email delivery.`);
    console.log(`======================================================\n`);
    return { success: true, simulated: true };
  }
}

/**
 * Send reservation confirmation email
 */
export async function sendBookingConfirmationEmail({ to, name, booking }) {
  const mailTransporter = getTransporter();
  if (!mailTransporter) return { success: true, simulated: true };

  const from = process.env.EMAIL_FROM || '"Dine@Bennett Reservations" <dining@bennett.edu.in>';
  const subject = `Confirmed: Table at ${booking.restaurantName} (#${booking.id})`;

  try {
    await mailTransporter.sendMail({
      from,
      to,
      subject,
      text: `Your reservation #${booking.id} at ${booking.restaurantName} is confirmed for ${booking.guests} guests on ${booking.date} at ${booking.time}. Table: ${booking.tableAssigned || 'TBD'}.`
    });
  } catch (err) {
    console.warn('[EMAIL_SERVICE] Failed sending booking confirmation email:', err.message);
  }
}

export default {
  sendOtpEmail,
  sendBookingConfirmationEmail
};
