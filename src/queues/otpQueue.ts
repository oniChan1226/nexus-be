import { QueueService } from "services/queue.service";

export async function registerOtpQueue() {
  return await QueueService.registerQueue("otpQueue");
}
