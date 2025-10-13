import { randomInt } from "crypto";
import { deleteOtp, getOtp, saveOtp } from "lib/otpStore";
import { getRedisConnection } from "queues/connection";
import { QueueService } from "./queue.service";
import logger from "config/logger";
import { EmailService } from "./email.service";

export const OtpService = {
  async generateOtp(identifier: string): Promise<string> {
    const otp = randomInt(100000, 999999).toString();
    const redis = await getRedisConnection();

    // Save OTP in Redis
    await saveOtp(redis, identifier, otp);

    return otp;
  },

  async getOtp(identifier: string): Promise<string> {
    const redis = await getRedisConnection();
    const otp = await getOtp(redis, identifier);
    return otp as string;
  },

  async deleteOtp(identifier: string): Promise<void> {
    const redis = await getRedisConnection();
    await deleteOtp(redis, identifier);
  },

  async sendOtp(email: string) {
    const otp = await this.generateOtp(email);

    const queue = await QueueService.registerQueue("otpQueue");
    await queue.add("sendOtp", { email, otp });

    logger.info(`[OtpService] Job queued for ${email} with OTP ${otp}`);
  },

  async processOtpJob(email: string, otp: string) {
    await EmailService.sendMail(email, "Your OTP Code", `Your OTP is ${otp}`);
    logger.info(`[OtpService] Sending OTP ${otp} to ${email}`);
    return true;
  },
};
