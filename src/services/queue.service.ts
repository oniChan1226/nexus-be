// src/services/queue.service.ts
import { Queue, Worker, Processor } from "bullmq";
import { getRedisConnection } from "queues/connection";
import type { QueueNames } from "../@types/queues/job.types";
import logger from "config/logger";

export class QueueService {
  private static queues = new Map<QueueNames, Queue>();

  /** Creates and registers a queue if not already existing */
  static async registerQueue(name: QueueNames): Promise<Queue> {
    if (!this.queues.has(name)) {
      const connection = await getRedisConnection();
      const queue = new Queue(name, {
        connection,
        defaultJobOptions: {
          removeOnComplete: { age: 300, count: 100 }, // remove after 5min or keep max 100
          removeOnFail: { age: 86400, count: 200 }, // 1 day or max 200
        },
      });
      this.queues.set(name, queue);
    }
    return this.queues.get(name)!;
  }

  static getQueue(name: QueueNames): Queue | undefined {
    return this.queues.get(name);
  }

  /** Start a worker for given queue */
  static async createWorker(name: QueueNames, processor: Processor<any>) {
    logger.info(`[QueueService:CreateWorker}] ✅ Worker creation triggered`);
    const connection = await getRedisConnection();
    const worker = new Worker(name, processor, { connection, concurrency: 3 });

    worker.on("completed", (job) =>
      logger.info(`[Worker:${name}] ✅ Job completed: ${job.id}`)
    );

    worker.on("failed", (job, err) =>
      console.error(
        `[Worker:${name}] ❌ Job failed: ${job?.id} - ${err.message}`
      )
    );

    logger.info(`[Worker:${name}] started`);
  }
}
