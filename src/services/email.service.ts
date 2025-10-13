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

  async sendMail(to: string, subject: string, text: string) {
    const transporter = await this.createTransport();

    const info = await transporter.sendMail({
      from: '"Chichu ki maliyan" <no-reply@oni.dev>',
      to,
      subject,
      text,
    });

    logger.info(`[EmailService] Message sent: ${info.messageId}`);
    logger.info(
      `[EmailService] Preview URL: ${nodemailer.getTestMessageUrl(info)}`
    );
  },
};
