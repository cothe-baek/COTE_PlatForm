import { getPrisma, Verdict, type Language, type PrismaClient } from '@cote/db';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { outputsMatch } from './compare';
import type { Executor } from './executor';
import { LANGUAGES } from './languages';

const DAY_MS = 24 * 60 * 60 * 1000;
const STDOUT_KEEP = 4000; // RUN 결과로 보여줄 stdout 최대 길이

export interface JudgeDeps {
  prisma?: PrismaClient;
  executor: Executor;
  workRoot?: string;
}

/** 실패 → 다음 복습 간격(일). 간격 반복(1 → 3 → 7 → 14)은 2차 범위, MVP는 1일 고정 */
function nextReviewAt(now = new Date()): Date {
  return new Date(now.getTime() + DAY_MS);
}

export async function judgeSubmission(submissionId: string, deps: JudgeDeps): Promise<Verdict> {
  const prisma = deps.prisma ?? getPrisma();
  const { executor } = deps;

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { problem: true },
  });
  if (!submission) throw new Error(`submission ${submissionId} not found`);

  const testCases = await prisma.testCase.findMany({
    where: { problemId: submission.problemId, ...(submission.kind === 'RUN' ? { isSample: true } : {}) },
    orderBy: { order: 'asc' },
  });

  await prisma.submission.update({
    where: { id: submissionId },
    data: { status: Verdict.JUDGING, totalCount: testCases.length },
  });

  const workRoot = deps.workRoot ?? path.resolve(process.env.JUDGE_WORKDIR ?? path.join(os.tmpdir(), 'cote-judge'));
  const workdir = path.join(workRoot, submissionId);
  fs.mkdirSync(workdir, { recursive: true });

  let finalVerdict: Verdict = Verdict.IE;
  let maxTime = 0;
  let maxMem: number | null = null;
  let passed = 0;
  let compileLog: string | null = null;

  try {
    const spec = LANGUAGES[submission.language as Language];
    fs.writeFileSync(path.join(workdir, spec.sourceFile), submission.code, 'utf8');

    const compiled = await executor.compile(workdir, submission.language as Language);
    if (!compiled.ok) {
      finalVerdict = Verdict.CE;
      compileLog = compiled.log || '(no compiler output)';
    } else {
      compileLog = compiled.log || null;
      finalVerdict = Verdict.AC;
      for (const tc of testCases) {
        const r = await executor.run(workdir, submission.language as Language, tc.input, {
          timeLimitMs: submission.problem.timeLimitMs,
          memoryLimitMb: submission.problem.memoryLimitMb,
        });
        let verdict: Verdict;
        if (r.timedOut) verdict = Verdict.TLE;
        else if (r.memoryExceeded) verdict = Verdict.MLE;
        else if (r.exitCode !== 0) verdict = Verdict.RE;
        else if (r.timeMs > submission.problem.timeLimitMs * spec.timeFactor) verdict = Verdict.TLE;
        else verdict = outputsMatch(tc.output, r.stdout) ? Verdict.AC : Verdict.WA;

        maxTime = Math.max(maxTime, r.timeMs);
        if (r.memoryKb != null) maxMem = Math.max(maxMem ?? 0, r.memoryKb);
        if (verdict === Verdict.AC) passed++;

        await prisma.submissionResult.create({
          data: {
            submissionId,
            testCaseId: tc.id,
            verdict,
            execTimeMs: r.timeMs,
            memoryKb: r.memoryKb,
            stdout: submission.kind === 'RUN' ? r.stdout.slice(0, STDOUT_KEEP) : null,
            stderr: verdict === Verdict.RE || verdict === Verdict.MLE ? r.stderr.slice(0, 2000) : null,
          },
        });

        if (verdict !== Verdict.AC) {
          finalVerdict = verdict;
          if (submission.kind === 'SUBMIT') break; // 최종 제출은 첫 실패에서 조기 종료
        }
      }
    }
  } catch (err) {
    finalVerdict = Verdict.IE;
    compileLog = `internal error: ${String(err)}`;
  } finally {
    fs.rmSync(workdir, { recursive: true, force: true });
  }

  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: finalVerdict,
      execTimeMs: maxTime,
      memoryKb: maxMem,
      passedCount: passed,
      compileLog,
      judgedAt: new Date(),
    },
  });

  if (submission.kind === 'SUBMIT' && finalVerdict !== Verdict.IE) {
    await updateReviewNote(prisma, submission.userId, submission.problemId, finalVerdict === Verdict.AC);
  }
  return finalVerdict;
}

/** 오답노트 자동 관리: 실패하면 등록/갱신, 맞히면 복습 완료 처리 */
async function updateReviewNote(prisma: PrismaClient, userId: string, problemId: number, accepted: boolean) {
  const existing = await prisma.reviewNote.findUnique({ where: { userId_problemId: { userId, problemId } } });
  if (!accepted) {
    if (!existing) {
      await prisma.reviewNote.create({ data: { userId, problemId, state: 'TODO', failCount: 1, nextReviewAt: nextReviewAt() } });
    } else {
      await prisma.reviewNote.update({
        where: { id: existing.id },
        data: {
          failCount: { increment: 1 },
          state: existing.state === 'DONE' ? 'TODO' : 'REVIEWING',
          nextReviewAt: nextReviewAt(),
        },
      });
    }
  } else if (existing && existing.state !== 'DONE') {
    await prisma.reviewNote.update({
      where: { id: existing.id },
      data: { state: 'DONE', reviewCount: { increment: 1 }, nextReviewAt: null },
    });
  }
}
