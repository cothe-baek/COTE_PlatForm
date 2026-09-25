import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { SubmissionKind } from '@cote/db';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { SubmitDto } from './dto';

@Injectable()
export class SubmissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queue: QueueService,
  ) {}

  async create(userId: string, problemId: number, dto: SubmitDto, kind: SubmissionKind) {
    const problem = await this.prisma.problem.findFirst({ where: { id: problemId, isPublic: true }, select: { id: true } });
    if (!problem) throw new NotFoundException('문제를 찾을 수 없습니다');

    const submission = await this.prisma.submission.create({
      data: { userId, problemId, kind, language: dto.language, code: dto.code },
      select: { id: true, status: true, kind: true, createdAt: true },
    });
    await this.queue.enqueueJudge(submission.id);
    return submission;
  }

  async get(userId: string, id: string) {
    const s = await this.prisma.submission.findUnique({
      where: { id },
      include: {
        problem: { select: { id: true, title: true, slug: true } },
        results: {
          orderBy: { testCase: { order: 'asc' } },
          include: { testCase: { select: { order: true, isSample: true, input: true, output: true } } },
        },
      },
    });
    if (!s) throw new NotFoundException('제출을 찾을 수 없습니다');
    if (s.userId !== userId) throw new ForbiddenException();
    return {
      id: s.id,
      kind: s.kind,
      language: s.language,
      code: s.code,
      status: s.status,
      execTimeMs: s.execTimeMs,
      memoryKb: s.memoryKb,
      compileLog: s.compileLog,
      passedCount: s.passedCount,
      totalCount: s.totalCount,
      createdAt: s.createdAt,
      judgedAt: s.judgedAt,
      problem: s.problem,
      results: s.results.map((r) => ({
        order: r.testCase.order,
        isSample: r.testCase.isSample,
        verdict: r.verdict,
        execTimeMs: r.execTimeMs,
        memoryKb: r.memoryKb,
        // 샘플 테스트케이스의 입출력과 실제 stdout 은 RUN(예제 실행)에서만 노출한다
        ...(s.kind === 'RUN' && r.testCase.isSample
          ? { input: r.testCase.input, expected: r.testCase.output, stdout: r.stdout, stderr: r.stderr }
          : { stderr: r.stderr }),
      })),
    };
  }

  async listMine(userId: string, opts: { problemId?: number; page?: number; pageSize?: number }) {
    const page = Math.max(1, opts.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, opts.pageSize ?? 20));
    const where = { userId, kind: SubmissionKind.SUBMIT, ...(opts.problemId ? { problemId: opts.problemId } : {}) };
    const [total, items] = await Promise.all([
      this.prisma.submission.count({ where }),
      this.prisma.submission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          language: true,
          status: true,
          execTimeMs: true,
          memoryKb: true,
          passedCount: true,
          totalCount: true,
          createdAt: true,
          problem: { select: { id: true, title: true, difficulty: true } },
        },
      }),
    ]);
    return { page, pageSize, total, items };
  }
}
