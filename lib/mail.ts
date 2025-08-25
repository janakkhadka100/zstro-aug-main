import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function sendResetPasswordEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  const params = {
    Source: process.env.SES_EMAIL_SENDER!,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: {
        Data: "Password Reset Request",
      },
      Body: {
        Html: {
          Data: `
            <p>You requested a password reset.</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>If you didn't request this, please ignore this email.</p>
          `,
        },
      },
    },
  };

  try {
    await sesClient.send(new SendEmailCommand(params));
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error("Error sending email via AWS SES:", error);
  }
}
