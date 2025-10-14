import logger from "config/logger";
import { startOtpWorker } from "./otpWorker";
import { closeRedisConnection } from "queues/connection";

(async () => {
  await startOtpWorker();

  process.on("SIGINT", async () => {
    logger.info("🛑 Shutting down OTP worker...");
    await closeRedisConnection();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    logger.info("🛑 Shutting down OTP worker...");
    await closeRedisConnection();
    process.exit(0);
  });
})();