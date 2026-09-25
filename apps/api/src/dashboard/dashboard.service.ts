import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DAY_MS = 24 * 60 * 60 * 1000;

/** 로컬 자정 기준 날짜 키. MVP는 서버 시간대(TZ 환경변수) 기준 */
function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(userId: string) {
    const [subs, reviewTodo, recent] = await Promise.all([
      this.prisma.submission.findMany({
        where: { userId, kind: 'SUBMIT' },
        select: { problemId: true, status: true, createdAt: true, problem: { select: { tags: { select: { tag: true } } } } },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.reviewNote.count({ where: { userId, state: { not: 'DONE' } } }),
      this.prisma.submission.findMany({
        where: { userId, kind: 'SUBMIT' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, status: true, language: true, createdAt: true, problem: { select: { id: true, title: true } } },
      }),
    ]);

    const solvedProblems = new Set<number>();
    const triedProblems = new Set<number>();
    const solvedDays = new Set<string>();
    const activeDays = new Set<string>();
    const tagStats = new Map<string, { tried: Set<number>; solved: Set<number> }>();
    const today = dayKey(new Date());

    for (const s of subs) {
      triedProblems.add(s.problemId);
      activeDays.add(dayKey(s.createdAt));
      for (const { tag } of s.problem.tags) {
        if (!tagStats.has(tag)) tagStats.set(tag, { tried: new Set(), solved: new Set() });
        tagStats.get(tag)!.tried.add(s.problemId);
      }
      if (s.status === 'AC') {
        if (!solvedProblems.has(s.problemId)) solvedDays.add(dayKey(s.createdAt)); // 첫 AC 날짜만
        solvedProblems.add(s.problemId);
        for (const { tag } of s.problem.tags) tagStats.get(tag)!.solved.add(s.problemId);
      }
    }

    // streak: 오늘(또는 어제)부터 거꾸로 연속으로 제출이 있는 일수
    let streak = 0;
    let cursor = new Date();
    if (!activeDays.has(dayKey(cursor))) cursor = new Date(cursor.getTime() - DAY_MS);
    while (activeDays.has(dayKey(cursor))) {
      streak++;
      cursor = new Date(cursor.getTime() - DAY_MS);
    }

    const totalProblems = await this.prisma.problem.count({ where: { isPublic: true } });
    const tagTotals = await this.prisma.problemTag.groupBy({ by: ['tag'], _count: { _all: true } });

    return {
      totalProblems,
      solvedCount: solvedProblems.size,
      triedCount: triedProblems.size,
      todaySolved: [...subs].filter((s) => s.status === 'AC' && dayKey(s.createdAt) === today).length,
      streak,
      reviewTodo,
      submissionCount: subs.length,
      tagStats: tagTotals
        .map((t) => ({
          tag: t.tag,
          total: t._count._all,
          tried: tagStats.get(t.tag)?.tried.size ?? 0,
          solved: tagStats.get(t.tag)?.solved.size ?? 0,
        }))
        .sort((a, b) => a.tag.localeCompare(b.tag)),
      recent,
    };
  }
}
