// src/services/queue.service.ts
import { Queue, Worker, Processor } from "bullmq";
import { getRedisConnection } from "queues/connection";
import type { QueueNames } from "../@types/queues/job.types";

export class QueueService {
  private static queues = new Map<QueueNames, Queue>();

  /** Creates and registers a queue if not already existing */
  static async registerQueue(name: QueueNames): Promise<Queue> {
    if (!this.queues.has(name)) {
      const connection = await getRedisConnection();
      const queue = new Queue(name, { connection });
      this.queues.set(name, queue);
    }
    return this.queues.get(name)!;
  }

  static getQueue(name: QueueNames): Queue | undefined {
    return this.queues.get(name);
  }

  /** Start a worker for given queue */
  static async createWorker(name: QueueNames, processor: Processor<any>) {
    const connection = await getRedisConnection();
    const worker = new Worker(name, processor, { connection });

    worker.on("completed", (job) =>
      console.log(`[Worker:${name}] ✅ Job completed: ${job.id}`)
    );

    worker.on("failed", (job, err) =>
      console.error(`[Worker:${name}] ❌ Job failed: ${job?.id} - ${err.message}`)
    );

    console.log(`[Worker:${name}] started`);
  }
}
