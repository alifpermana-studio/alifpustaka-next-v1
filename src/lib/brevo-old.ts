import { BrevoClient } from "@getbrevo/brevo";

// Initialize the Brevo Client
const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY!,
});

interface SendEmailArgs {
  to: string;
  subject: string;
  htmlContent: string;
}

export async function sendTransactionalEmail({
  to,
  subject,
  htmlContent,
}: SendEmailArgs) {
  try {
    const response = await brevo.transactionalEmails.sendTransacEmail({
      sender: {
        name: process.env.BREVO_SENDER_NAME!,
        email: process.env.BREVO_SENDER_EMAIL!,
      },
      to: [{ email: to }],
      subject: subject,
      htmlContent: htmlContent,
    });

    console.log("Success send email verification: ", response);

    return { success: true, data: response };
  } catch (error) {
    console.error("Brevo Email Error:", error);
    return { success: false, error };
  }
}
