import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@cote/db';
import { PrismaService } from '../prisma/prisma.service';

export type SolveStatus = 'solved' | 'tried' | 'unsolved';

export interface ProblemListQuery {
  tag?: string;
  difficulty?: number;
  status?: SolveStatus;
  q?: string;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class ProblemsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ProblemListQuery, userId?: string) {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 30));

    const where: Prisma.ProblemWhereInput = { isPublic: true };
    if (query.tag) where.tags = { some: { tag: query.tag } };
    if (query.difficulty) where.difficulty = query.difficulty;
    if (query.q) where.title = { contains: query.q, mode: 'insensitive' };

    // 풀이 상태 필터는 사용자별 제출 이력이 필요하다
    let statusMap = new Map<number, SolveStatus>();
    if (userId) {
      statusMap = await this.statusByProblem(userId);
      if (query.status) {
        const ids = [...statusMap.entries()].filter(([, s]) => s === query.status).map(([id]) => id);
        if (query.status === 'unsolved') where.id = { notIn: [...statusMap.keys()] };
        else where.id = { in: ids };
      }
    }

    const [total, items] = await Promise.all([
      this.prisma.problem.count({ where }),
      this.prisma.problem.findMany({
        where,
        orderBy: [{ difficulty: 'asc' }, { id: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          slug: true,
          title: true,
          difficulty: true,
          tags: { select: { tag: true } },
          _count: { select: { submissions: { where: { kind: 'SUBMIT' } } } },
        },
      }),
    ]);

    // 정답률 계산용 AC 수 (문제별 groupBy)
    const acCounts = await this.prisma.submission.groupBy({
      by: ['problemId'],
      where: { kind: 'SUBMIT', status: 'AC', problemId: { in: items.map((p) => p.id) } },
      _count: { _all: true },
    });
    const acMap = new Map(acCounts.map((r) => [r.problemId, r._count._all]));

    return {
      page,
      pageSize,
      total,
      items: items.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        difficulty: p.difficulty,
        tags: p.tags.map((t) => t.tag),
        submitCount: p._count.submissions,
        acCount: acMap.get(p.id) ?? 0,
        status: statusMap.get(p.id) ?? 'unsolved',
      })),
    };
  }

  async detail(id: number, userId?: string) {
    const p = await this.prisma.problem.findFirst({
      where: { id, isPublic: true },
      include: {
        tags: { select: { tag: true } },
        testCases: { where: { isSample: true }, orderBy: { order: 'asc' }, select: { input: true, output: true } },
      },
    });
    if (!p) throw new NotFoundException('문제를 찾을 수 없습니다');
    const status = userId ? ((await this.statusByProblem(userId)).get(id) ?? 'unsolved') : 'unsolved';
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      body: p.body,
      difficulty: p.difficulty,
      timeLimitMs: p.timeLimitMs,
      memoryLimitMb: p.memoryLimitMb,
      tags: p.tags.map((t) => t.tag),
      samples: p.testCases,
      status,
    };
  }

  async tags() {
    const rows = await this.prisma.problemTag.groupBy({ by: ['tag'], _count: { _all: true }, orderBy: { tag: 'asc' } });
    return rows.map((r) => ({ tag: r.tag, count: r._count._all }));
  }

  /** 사용자의 문제별 상태: AC가 하나라도 있으면 solved, 제출만 있으면 tried */
  async statusByProblem(userId: string): Promise<Map<number, SolveStatus>> {
    const rows = await this.prisma.submission.groupBy({
      by: ['problemId', 'status'],
      where: { userId, kind: 'SUBMIT' },
    });
    const map = new Map<number, SolveStatus>();
    for (const r of rows) {
      if (r.status === 'AC') map.set(r.problemId, 'solved');
      else if (!map.has(r.problemId)) map.set(r.problemId, 'tried');
    }
    return map;
  }
}
