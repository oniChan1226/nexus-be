import logger from "config/logger";
import { startOtpWorker } from "./otpWorker";
import { closeRedisConnection } from "queues/connection";

(async () => {
  await startOtpWorker();
  logger.info(`Worker running at process: ${process.pid}`);

  const gracefulShutdown = async (signal: string) => {
    logger.info(`🛑 Received ${signal}, shutting down OTP worker...`);
    await closeRedisConnection();
    process.exit(0);
  };

  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.once("SIGUSR2", async () => {
    await gracefulShutdown("SIGUSR2");
    process.kill(process.pid, "SIGUSR2"); // Let nodemon actually restart it
  });
})();
