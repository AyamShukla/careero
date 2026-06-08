import { sendEmail } from "../lib/mailer.js";

export const sendWelcomeEmail = async (email, name) => {
  await sendEmail({
    to: email,
    subject: "Welcome to Careero! 🎉",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #6366f1; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Welcome to Careero!</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2>Hi ${name}! 👋</h2>
          <p>We're thrilled to have you join Careero — your professional network to connect, grow, and succeed.</p>
          <p>Here's what you can do:</p>
          <ul>
            <li>🔗 Connect with professionals</li>
            <li>📝 Share posts and updates</li>
            <li>👤 Build your professional profile</li>
            <li>🔔 Get notified about your network activity</li>
          </ul>
          <a href="http://localhost:5173" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px;">
            Go to Careero
          </a>
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
            If you didn't create this account, please ignore this email.
          </p>
        </div>
      </div>
    `,
  });
};