import './env';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { getPrisma } from '@cote/db';
import { createExecutor } from './executor';
import { judgeSubmission } from './judge';

export const JUDGE_QUEUE = 'judge';

async function main() {
  const connection = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', { maxRetriesPerRequest: null });
  const executor = createExecutor();
  const prisma = getPrisma();
  const concurrency = parseInt(process.env.JUDGE_CONCURRENCY ?? '2', 10);

  const worker = new Worker<{ submissionId: string }>(
    JUDGE_QUEUE,
    async (job) => {
      const started = Date.now();
      const verdict = await judgeSubmission(job.data.submissionId, { prisma, executor });
      console.log(`[judge] ${job.data.submissionId} -> ${verdict} (${Date.now() - started}ms)`);
      return verdict;
    },
    { connection, concurrency },
  );

  worker.on('failed', async (job, err) => {
    console.error(`[judge] job ${job?.id} failed (attempt ${job?.attemptsMade}):`, err);
    // 재시도가 모두 소진되면 제출을 IE 로 마감해 PENDING 으로 남지 않게 한다
    if (job && job.attemptsMade >= (job.opts.attempts ?? 1)) {
      await prisma.submission
        .updateMany({
          where: { id: job.data.submissionId, status: { in: ['PENDING', 'JUDGING'] } },
          data: { status: 'IE', compileLog: `judge failed: ${String(err).slice(0, 500)}`, judgedAt: new Date() },
        })
        .catch((e) => console.error('[judge] failed to mark IE:', e));
    }
  });
  console.log(`[judge] worker started (executor=${executor.name}, concurrency=${concurrency})`);

  const shutdown = async () => {
    await worker.close();
    await prisma.$disconnect();
    connection.disconnect();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
