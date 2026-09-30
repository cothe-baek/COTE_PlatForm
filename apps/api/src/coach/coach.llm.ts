/**
 * 코치 응답 생성. ANTHROPIC_API_KEY 가 있으면 Claude 를, 없으면 정해진 순서로 답하는 목 코치를 쓴다.
 */
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { Logger } from '@nestjs/common';
import { z } from 'zod';
import { COACH_STEPS, QUICK_REPLIES, coachSystemPrompt, tagLabel, type CoachProblem } from './coach.prompt';

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export interface CoachReply {
  reply: string;
  progress: number; // 0 ~ 4
  solved: boolean;
  summary: string | null;
}

const CoachReplySchema = z.object({
  reply: z.string(),
  progress: z.number().int().min(0).max(4),
  solved: z.boolean(),
  summary: z.string().nullable(),
});

export interface CoachBackend {
  readonly name: string;
  ask(problem: CoachProblem, history: ChatMessage[], progress: number): Promise<CoachReply>;
}

/** Claude 코치 */
export class ClaudeCoach implements CoachBackend {
  readonly name = 'claude';
  private readonly client = new Anthropic();
  private readonly model = process.env.COACH_MODEL ?? 'claude-opus-5-5';
  private readonly logger = new Logger(ClaudeCoach.name);

  async ask(problem: CoachProblem, history: ChatMessage[], progress: number): Promise<CoachReply> {
    const messages: Anthropic.MessageParam[] = history.map((m) => ({ role: m.role, content: m.text }));
    const response = await this.client.messages.parse({
      model: this.model,
      max_tokens: 1024,
      // 짧은 대화형 응답이므로 낮은 effort 로 충분하다
      output_config: { effort: 'low', format: zodOutputFormat(CoachReplySchema) },
      system: [
        {
          type: 'text',
          text: `${coachSystemPrompt(problem)}\n\n지금까지 사용자가 충분히 설명한 단계 수: ${progress}`,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages,
    });
    if (response.stop_reason === 'refusal' || !response.parsed_output) {
      this.logger.warn(`coach reply unavailable (stop_reason=${response.stop_reason})`);
      return { reply: '지금은 답하기 어려워요. 다른 말로 다시 설명해 주시겠어요?', progress, solved: false, summary: null };
    }
    const out = response.parsed_output;
    const nextProgress = Math.max(progress, out.progress); // 줄어들지 않는다
    const solved = out.solved || nextProgress >= COACH_STEPS.length;
    return { reply: out.reply, progress: solved ? COACH_STEPS.length : nextProgress, solved, summary: solved ? out.summary : null };
  }
}

const SCRIPTED = [
  '그 방법으로 첫 번째 입출력 예를 직접 따라가 보면 어떤 순서로 값을 확인하게 되나요? 한 단계씩 말해 보세요.',
  '방향이 좋아요. 그렇게 하면 입력이 가장 클 때 대략 몇 번 연산하게 될까요? 시간 복잡도로 말해 보세요.',
  '시간 복잡도는 제한사항 안에 들어와요. 입력이 가장 작을 때나 값이 모두 같을 때처럼 예외가 되는 경우도 생각해 보세요.',
];

/** 목 코치: 사용자의 말을 이해하지 않고 정해진 순서로 답한다 (개발·테스트용) */
export class MockCoach implements CoachBackend {
  readonly name = 'mock';

  async ask(problem: CoachProblem, history: ChatMessage[], progress: number): Promise<CoachReply> {
    const last = history[history.length - 1]?.text ?? '';
    if (last === '힌트 주세요' || last === '잘 모르겠어요') {
      return {
        reply: `${problem.tags[0] ? tagLabel(problem.tags[0]) : '이'} 유형의 문제예요. 이 방식을 쓰면 어떤 값을 빠르게 찾거나 기억해 둘 수 있을지 생각해 보세요.`,
        progress,
        solved: false,
        summary: null,
      };
    }
    const next = progress + 1;
    if (next >= COACH_STEPS.length) {
      const explanations = history.filter((m) => m.role === 'user' && !QUICK_REPLIES.includes(m.text)).map((m) => m.text);
      return {
        reply: '네 단계를 모두 설명했어요. 지금까지 말한 풀이를 정리해 둘게요.',
        progress: COACH_STEPS.length,
        solved: true,
        summary: explanations.slice(-3).join('\n'),
      };
    }
    return { reply: SCRIPTED[next - 1], progress: next, solved: false, summary: null };
  }
}

export function createCoachBackend(): CoachBackend {
  if (process.env.ANTHROPIC_API_KEY) return new ClaudeCoach();
  return new MockCoach();
}
