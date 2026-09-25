import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ReviewState } from '@cote/db';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, state?: ReviewState) {
    const items = await this.prisma.reviewNote.findMany({
      where: { userId, ...(state ? { state } : {}) },
      orderBy: [{ state: 'asc' }, { nextReviewAt: 'asc' }, { updatedAt: 'desc' }],
      include: { problem: { select: { id: true, title: true, difficulty: true, tags: { select: { tag: true } } } } },
    });
    return items.map((n) => this.serialize(n));
  }

  /** 오늘 복습할 문제: 아직 해결하지 못했고 다음 복습 시각이 지난 것 */
  async due(userId: string) {
    const items = await this.prisma.reviewNote.findMany({
      where: { userId, state: { not: 'DONE' }, nextReviewAt: { lte: new Date() } },
      orderBy: { nextReviewAt: 'asc' },
      include: { problem: { select: { id: true, title: true, difficulty: true, tags: { select: { tag: true } } } } },
    });
    return items.map((n) => this.serialize(n));
  }

  async get(userId: string, id: string) {
    const n = await this.prisma.reviewNote.findUnique({
      where: { id },
      include: { problem: { select: { id: true, title: true, difficulty: true, tags: { select: { tag: true } } } } },
    });
    if (!n) throw new NotFoundException('오답노트를 찾을 수 없습니다');
    if (n.userId !== userId) throw new ForbiddenException();
    const submissions = await this.prisma.submission.findMany({
      where: { userId, problemId: n.problemId, kind: 'SUBMIT' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, status: true, language: true, createdAt: true, passedCount: true, totalCount: true },
    });
    return { ...this.serialize(n), submissions };
  }

  async updateMemo(userId: string, id: string, memo: string) {
    const n = await this.prisma.reviewNote.findUnique({ where: { id } });
    if (!n) throw new NotFoundException('오답노트를 찾을 수 없습니다');
    if (n.userId !== userId) throw new ForbiddenException();
    const updated = await this.prisma.reviewNote.update({
      where: { id },
      data: { memo },
      include: { problem: { select: { id: true, title: true, difficulty: true, tags: { select: { tag: true } } } } },
    });
    return this.serialize(updated);
  }

  private serialize(n: {
    id: string;
    memo: string;
    state: ReviewState;
    failCount: number;
    reviewCount: number;
    nextReviewAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    problem: { id: number; title: string; difficulty: number; tags: { tag: string }[] };
  }) {
    return {
      id: n.id,
      memo: n.memo,
      state: n.state,
      failCount: n.failCount,
      reviewCount: n.reviewCount,
      nextReviewAt: n.nextReviewAt,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
      problem: { ...n.problem, tags: n.problem.tags.map((t) => t.tag) },
    };
  }
}
