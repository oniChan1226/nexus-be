import type { QueueOptions, WorkerOptions } from "bullmq";
import { getRedisConnection } from "../queues/connection";
import { config } from "./env";

export async function getQueueOptions(): Promise<QueueOptions> {
  const connection = await getRedisConnection();
  return {
    connection,
    prefix: config.BULLMQ.prefix,
    defaultJobOptions: {
      attempts: Number(config.BULLMQ.maxRetries),
      backoff: {
        type: "exponential",
        delay: Number(config.BULLMQ.backoffDelay),
      },
      removeOnComplete: 100, // keep last 100 completed jobs
      removeOnFail: 500, // keep last 500 failed jobs
    },
  };
}

export async function getWorkerOptions(): Promise<WorkerOptions> {
  const connection = await getRedisConnection();
  return {
    connection,
    concurrency: Number(process.env.WORKER_CONCURRENCY || 5),
  };
}