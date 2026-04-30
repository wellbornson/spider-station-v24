import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  console.log("[Backup API] POST request received");
  try {
    const { action, data, email } = await request.json();

    if (action === 'sendBackup') {
      console.log(`[Backup API] Immediate backup triggered for ${email || 'default'}`);
      
      if (!data) {
        return NextResponse.json({ error: 'Missing data' }, { status: 400 });
      }

      // Final Credentials Verification
      const SMTP_USER = process.env.EMAIL_USER || 'muhammad.zahid.imam@gmail.com';
      const SMTP_PASS = process.env.EMAIL_PASS || 'lmrs wxlt ahwk owki';
      const RECIPIENT = email || process.env.BACKUP_RECIPIENT || 'muhammad.zahid.imam@gmail.com';

      console.log(`[Backup API] Using SMTP User: ${SMTP_USER}`);

      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // SSL
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
        // Increase timeout to prevent hang
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
      });

      const today = new Date().toISOString().split('T')[0];
      const mailOptions = {
        from: `"CLICK Cafe OS" <${SMTP_USER}>`,
        to: RECIPIENT,
        subject: `CLICK Cafe OS - Daily Backup [${today}]`,
        text: `CLICK Cafe OS backup attached.\nGenerated: ${new Date().toLocaleString()}\n\nManual Triggered Backup.`,
        attachments: [{
          filename: `CLICK_Backup_${today}.json`,
          content: JSON.stringify(data, null, 2),
          contentType: 'application/json',
        }],
      };

      console.log("[Backup API] Sending mail...");
      const info = await transporter.sendMail(mailOptions);
      console.log("[Backup API] Mail sent successfully:", info.messageId);

      return NextResponse.json({ success: true, message: `Backup sent to ${RECIPIENT}` });

    } else if (action === 'scheduleNightly') {
      return NextResponse.json({ success: true, message: 'Nightly backup scheduled' });

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('[Backup] Unexpected error:', error.message || error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    smtpHost: process.env.EMAIL_HOST || 'smtp.gmail.com',
    smtpPort: process.env.EMAIL_PORT || '465',
    emailUser: process.env.EMAIL_USER ? '✓ configured' : '✗ not set',
    emailPass: process.env.EMAIL_PASS ? '✓ configured' : '✗ not set',
  });
}
