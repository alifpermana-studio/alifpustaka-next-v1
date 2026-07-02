// lib/email.ts
import nodemailer from "nodemailer";

interface SendEmailProps {
  to: string;
  subject: string;
  htmlContent: string;
}

// Create a reusable transporter instance
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmail({ to, subject, htmlContent }: SendEmailProps) {
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "App Auth";

  if (!senderEmail) {
    console.error("Missing BREVO_SENDER_EMAIL configuration.");
    return { success: false };
  }

  try {
    const info = await transporter.sendMail({
      from: `"${senderName}" <${senderEmail}>`,
      to: to,
      subject: subject,
      html: htmlContent, // HTML body string
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Nodemailer SMTP Error:", error);
    return { success: false };
  }
}
