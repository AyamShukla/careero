import { sendEmail } from "../lib/mailer.js";

export const sendConnectionAcceptedEmail = async (senderEmail, senderName, recipientName) => {
  await sendEmail({
    to: senderEmail,
    subject: `${recipientName} accepted your connection request 🎉`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #6366f1; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Connection Accepted!</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2>Hi ${senderName}! 👋</h2>
          <p><strong>${recipientName}</strong> has accepted your connection request on Careero.</p>
          <p>You are now connected! Start engaging with their posts or send them a message.</p>
          <a href="http://localhost:5173/network" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px;">
            View Network
          </a>
        </div>
      </div>
    `,
  });
};