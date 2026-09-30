import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createCoachBackend, type ChatMessage, type CoachBackend } from './coach.llm';
import { COACH_GREETING, COACH_STEPS, QUICK_REPLIES } from './coach.prompt';

const MAX_MESSAGE_LENGTH = 2000;
const MAX_MESSAGES = 60; // 한 세션에서 주고받을 수 있는 최대 메시지 수

@Injectable()
export class CoachService {
  private readonly backend: CoachBackend = createCoachBackend();
  private readonly logger = new Logger(CoachService.name);

  constructor(private readonly prisma: PrismaService) {
    this.logger.log(`coach backend: ${this.backend.name}`);
  }

  /** 모바일 문제 목록용: 내 코치 세션 상태 */
  async listMine(userId: string) {
    const rows = await this.prisma.coachSession.findMany({
      where: { userId },
      select: { problemId: true, progress: true, solved: true, updatedAt: true },
    });
    return rows.map((r) => ({ ...r, status: r.solved ? 'solved' : 'tried' }));
  }

  meta() {
    return { steps: COACH_STEPS, greeting: COACH_GREETING, quickReplies: QUICK_REPLIES, backend: this.backend.name };
  }

  async get(userId: string, problemId: number) {
    const session = await this.prisma.coachSession.findUnique({ where: { userId_problemId: { userId, problemId } } });
    return session ? this.serialize(session) : null;
  }

  async reset(userId: string, problemId: number) {
    await this.prisma.coachSession.deleteMany({ where: { userId, problemId } });
  }

  async send(userId: string, problemId: number, text: string) {
    const trimmed = text.trim();
    if (!trimmed) throw new BadRequestException('메시지가 비어 있습니다');
    if (trimmed.length > MAX_MESSAGE_LENGTH) throw new BadRequestException('메시지가 너무 깁니다');

    const problem = await this.prisma.problem.findFirst({
      where: { id: problemId, isPublic: true },
      include: { tags: true, testCases: { where: { isSample: true }, orderBy: { order: 'asc' } } },
    });
    if (!problem) throw new NotFoundException('문제를 찾을 수 없습니다');

    const existing = await this.prisma.coachSession.findUnique({ where: { userId_problemId: { userId, problemId } } });
    if (existing?.solved) throw new BadRequestException('이미 풀이를 마친 문제입니다. 다시 시작하려면 세션을 초기화하세요');
    const prior = (existing?.messages as unknown as ChatMessage[] | undefined) ?? [];
    if (prior.length >= MAX_MESSAGES) throw new BadRequestException('대화가 너무 길어졌습니다. 세션을 초기화하고 다시 시작하세요');

    const history: ChatMessage[] = [...prior, { role: 'user', text: trimmed }];
    const answer = await this.backend.ask(
      { title: problem.title, body: problem.body, tags: problem.tags.map((t) => t.tag), samples: problem.testCases.map((t) => ({ input: t.input, output: t.output })) },
      history,
      existing?.progress ?? 0,
    );
    const messages: ChatMessage[] = [...history, { role: 'assistant', text: answer.reply }];

    const session = await this.prisma.coachSession.upsert({
      where: { userId_problemId: { userId, problemId } },
      create: { userId, problemId, messages: messages as object[], progress: answer.progress, solved: answer.solved, summary: answer.summary },
      update: { messages: messages as object[], progress: answer.progress, solved: answer.solved, summary: answer.summary },
    });
    return this.serialize(session);
  }

  private serialize(s: { id: string; problemId: number; messages: unknown; progress: number; solved: boolean; summary: string | null; updatedAt: Date }) {
    return {
      id: s.id,
      problemId: s.problemId,
      messages: s.messages as ChatMessage[],
      progress: s.progress,
      solved: s.solved,
      summary: s.summary,
      updatedAt: s.updatedAt,
    };
  }
}
