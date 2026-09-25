import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

export const JUDGE_QUEUE = 'judge';

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly connection = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
  });
  private readonly judgeQueue = new Queue<{ submissionId: string }>(JUDGE_QUEUE, {
    connection: this.connection,
    defaultJobOptions: { attempts: 2, removeOnComplete: 1000, removeOnFail: 1000 },
  });

  async enqueueJudge(submissionId: string) {
    await this.judgeQueue.add('judge', { submissionId }, { jobId: submissionId });
  }

  async onModuleDestroy() {
    await this.judgeQueue.close();
    this.connection.disconnect();
  }
}
