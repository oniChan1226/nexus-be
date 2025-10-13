import { Job } from "bullmq";
import { OtpService } from "services/otp.service";
import { QueueService } from "services/queue.service";

export async function startOtpWorker() {
  await QueueService.createWorker("otpQueue", async (job: Job) => {
    const { email, otp } = job.data;
    return await OtpService.processOtpJob(email, otp);
  });
}
