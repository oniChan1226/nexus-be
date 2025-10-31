import logger from "config/logger";
import nodemailer from "nodemailer";

export const EmailService = {
  async createTransport() {
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure, // true for 465, false for other ports
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    logger.info(
      `[EmailService] Using Ethereal test account ${testAccount.user}`
    );
    return transporter;
  },

  async sendMail(to: string, subject: string, text: string, html?: string) {
    const transporter = await this.createTransport();

    const info = await transporter.sendMail({
      from: '"Nexus Backend" <no-reply@nexus.dev>',
      to,
      subject,
      text,
      html,
    });

    logger.info(`[EmailService] Message sent: ${info.messageId}`);
    logger.info(
      `[EmailService] Preview URL: ${nodemailer.getTestMessageUrl(info)}`
    );
  },

  async sendVerificationEmail(email: string, name: string, verificationUrl: string) {
    const subject = "Verify Your Email - Nexus Backend";
    const text = `Hi ${name},\n\nThank you for registering! Please verify your email by clicking the link below:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create this account, please ignore this email.\n\nBest regards,\nNexus Backend Team`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #4F46E5; 
              color: white; 
              text-decoration: none; 
              border-radius: 6px;
              margin: 20px 0;
            }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Welcome to Nexus Backend! 🎉</h2>
            <p>Hi ${name},</p>
            <p>Thank you for registering! Please verify your email address to activate your account.</p>
            <a href="${verificationUrl}" class="button">Verify Email</a>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #4F46E5;">${verificationUrl}</p>
            <p>This link will expire in <strong>24 hours</strong>.</p>
            <div class="footer">
              <p>If you didn't create this account, please ignore this email.</p>
              <p>&copy; ${new Date().getFullYear()} Nexus Backend. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendMail(email, subject, text, html);
    logger.info(`[EmailService] Verification email sent to ${email}`);
  },

  async sendPasswordResetEmail(email: string, name: string, resetUrl: string) {
    const subject = "Reset Your Password - Nexus Backend";
    const text = `Hi ${name},\n\nWe received a request to reset your password. Click the link below to create a new password:\n\n${resetUrl}\n\nThis link will expire in 15 minutes.\n\nIf you didn't request this, please ignore this email and your password will remain unchanged.\n\nBest regards,\nNexus Backend Team`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #DC2626; 
              color: white; 
              text-decoration: none; 
              border-radius: 6px;
              margin: 20px 0;
            }
            .warning { 
              background-color: #FEF3C7; 
              border-left: 4px solid: #F59E0B; 
              padding: 12px; 
              margin: 20px 0;
            }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Password Reset Request 🔐</h2>
            <p>Hi ${name},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #DC2626;">${resetUrl}</p>
            <div class="warning">
              <strong>⚠️ Important:</strong> This link will expire in <strong>15 minutes</strong>.
            </div>
            <div class="footer">
              <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
              <p>For security, never share this link with anyone.</p>
              <p>&copy; ${new Date().getFullYear()} Nexus Backend. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendMail(email, subject, text, html);
    logger.info(`[EmailService] Password reset email sent to ${email}`);
  },
};
