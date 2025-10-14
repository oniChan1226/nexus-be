import { registerOtpQueue } from "./otpQueue";

export async function bootstrapQueues() {
  await Promise.all([registerOtpQueue(),]);

  console.log("[App] All queues initialized");
}
