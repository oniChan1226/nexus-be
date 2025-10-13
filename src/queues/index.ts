import { registerOtpQueue } from "./otp/otpQueue";
import { startOtpWorker } from "./otp/otpWorker";

export async function bootstrapQueues() {
  await Promise.all([registerOtpQueue(), startOtpWorker()]);

  console.log("[App] All queues and workers initialized");
}
