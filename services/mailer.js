const nodemailer = require('nodemailer');
require('dotenv').config();

const SALES_EMAIL = process.env.NOTIFICATION_EMAIL || 'sales@bluwis.com';
const SENDER_EMAIL = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@trawis.ai';

// Initialize transporter
function getTransporter() {
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_PASS !== 'PASTE_APP_PASSWORD_HERE' &&
    process.env.SMTP_PASS.trim() !== ''
  ) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000
    });
  }
  return null;
}

/**
 * Sends notification email to sales@bluwis.com and confirmation to lead
 */
async function sendMeetingNotification(data) {
  const { name, company, jobTitle, email, phone, notes, eventSource } = data;
  const event = eventSource || 'Energy Trading Week Americas 2026';
  const isDemo = event.toLowerCase().includes('demo');
  const submissionTime = new Date().toLocaleString('en-US', { timeZoneName: 'short' });

  const salesHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f0d14; color: #ffffff; padding: 24px; margin: 0; }
      .container { max-width: 600px; margin: 0 auto; background: #1a1622; border-radius: 12px; border: 1px solid #2d2638; overflow: hidden; }
      .header { background: linear-gradient(135deg, #1f1526, #2d1838); padding: 28px 24px; border-bottom: 2px solid #ffc400; }
      .title { font-size: 20px; font-weight: 800; color: #ffffff; margin: 0 0 6px; letter-spacing: -0.02em; }
      .tag { display: inline-block; background: rgba(255, 196, 0, 0.15); color: #ffc400; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
      .content { padding: 24px; }
      .lead-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      .lead-table th { text-align: left; padding: 12px 14px; background: #231c2e; color: #9c93a8; font-size: 13px; font-weight: 600; width: 35%; border-bottom: 1px solid #2e263d; }
      .lead-table td { padding: 12px 14px; background: #1a1622; color: #ffffff; font-size: 14px; font-weight: 500; border-bottom: 1px solid #2e263d; }
      .lead-table a { color: #ffc400; text-decoration: none; }
      .notes-box { margin-top: 20px; background: #231c2e; padding: 16px; border-radius: 8px; border-left: 3px solid #ffc400; }
      .footer { padding: 16px 24px; background: #14111c; font-size: 12px; color: #6e647c; text-align: center; border-top: 1px solid #241e30; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <span class="tag">${event}</span>
        <h1 class="title" style="margin-top: 10px;">${isDemo ? 'New Demo Request Received' : 'New Meeting Request Received'}</h1>
        <p style="color: #c7bed4; font-size: 14px; margin: 0;">${isDemo ? 'A prospect has requested a product demonstration with the BluWis & TraWis team.' : 'A prospect has requested a meeting with the BluWis & TraWis team.'}</p>
      </div>
      <div class="content">
        <table class="lead-table">
          <tr><th>Full Name</th><td><strong>${name}</strong></td></tr>
          <tr><th>Company</th><td><strong>${company}</strong></td></tr>
          <tr><th>Job Title / Role</th><td>${jobTitle}</td></tr>
          <tr><th>Work Email</th><td><a href="mailto:${email}">${email}</a></td></tr>
          <tr><th>Phone Number</th><td><a href="tel:${phone}">${phone}</a></td></tr>
          <tr><th>Source / Event</th><td>${event}</td></tr>
          <tr><th>Submitted At</th><td>${submissionTime}</td></tr>
        </table>
        ${notes ? `
        <div class="notes-box">
          <strong style="display: block; font-size: 12px; text-transform: uppercase; color: #ffc400; margin-bottom: 6px;">Details / Preferred Time</strong>
          <span style="color: #e3dbe8; font-size: 14px; white-space: pre-wrap;">${notes}</span>
        </div>
        ` : ''}
      </div>
      <div class="footer">
        BluWis & TraWis Trade Intelligence Platform &bull; Automated Sales Lead Dispatch
      </div>
    </div>
  </body>
  </html>
  `;

  const leadHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f6f9; color: #1a1622; padding: 24px; margin: 0; }
      .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5e2ea; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
      .header { background: #191421; padding: 28px 24px; color: #ffffff; text-align: center; }
      .title { font-size: 22px; font-weight: 800; margin: 0 0 6px; color: #ffffff; }
      .content { padding: 32px 28px; line-height: 1.6; font-size: 15px; color: #3b3347; }
      .btn { display: inline-block; background: #ffc400; color: #140f19; font-weight: 700; padding: 12px 24px; border-radius: 999px; text-decoration: none; margin: 20px 0 10px; }
      .footer { padding: 18px 24px; background: #f2f0f5; font-size: 12px; color: #877f94; text-align: center; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1 class="title">TraWis &bull; Trade Intelligence</h1>
        <p style="color: #ffc400; font-weight: 600; font-size: 14px; margin: 0;">${isDemo ? 'Product Demo Request Received' : 'Meeting Request Received'}</p>
      </div>
      <div class="content">
        <p>Hi <strong>${name}</strong>,</p>
        <p>Thank you for reaching out to connect with the <strong>TraWis</strong> team${isDemo ? ' for a product demo' : ` for <strong>${event}</strong>`}.</p>
        <p>We have successfully received your details for <strong>${company}</strong>. Our enterprise sales team will review your inquiry and follow up promptly to coordinate your schedule.</p>
        <p>If you have any immediate questions in the meantime, feel free to reply directly to this email or reach us at <a href="mailto:${SALES_EMAIL}" style="color: #1a1622; font-weight: 700;">${SALES_EMAIL}</a>.</p>
        <p style="margin-top: 24px;">Warm regards,<br><strong>The BluWis & TraWis Team</strong></p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} BluWis / TraWis. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;

  const transporter = getTransporter();

  if (transporter) {
    try {
      // Send notification to sales@bluwis.com
      const salesInfo = await transporter.sendMail({
        from: `"TraWis Trade Intelligence" <${SENDER_EMAIL}>`,
        to: SALES_EMAIL,
        subject: `[${isDemo ? 'Demo Request' : 'Meeting Request'} - ${event}] ${name} from ${company}`,
        html: salesHtml,
        replyTo: email
      });
      console.log(`[Mailer] Successfully dispatched lead to ${SALES_EMAIL}:`, salesInfo.messageId);

      // Send confirmation to user
      try {
        await transporter.sendMail({
          from: `"TraWis Team" <${SENDER_EMAIL}>`,
          to: email,
          subject: `Meeting Request Confirmed: TraWis @ ${event}`,
          html: leadHtml
        });
        console.log(`[Mailer] Confirmation sent to prospect: ${email}`);
      } catch (clientErr) {
        console.warn(`[Mailer] Confirmation email to ${email} failed:`, clientErr.message);
      }

      return { success: true, messageId: salesInfo.messageId };
    } catch (err) {
      console.error('[Mailer] SMTP transport error:', err.message);
      return { success: false, error: err.message };
    }
  } else {
    // Development / fallback mode: log details cleanly
    console.log('\n============================================================');
    console.log('📧 [MAILER LOG] (SMTP not configured in .env - Simulated Send)');
    console.log(`To: ${SALES_EMAIL}`);
    console.log(`Lead: ${name} (${email}) | Company: ${company} | Role: ${jobTitle}`);
    console.log(`Phone: ${phone} | Event: ${event}`);
    if (notes) console.log(`Notes: ${notes}`);
    console.log('To send real emails, set SMTP_HOST, SMTP_USER, SMTP_PASS in .env');
    console.log('============================================================\n');

    return { success: true, simulated: true };
  }
}

module.exports = {
  sendMeetingNotification
};
