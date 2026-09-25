import type { Language } from '@cote/db';

export interface CompileResult {
  ok: boolean;
  log: string;
}

export interface RunLimits {
  timeLimitMs: number;
  memoryLimitMb: number;
}

export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  signal: string | null;
  timedOut: boolean;
  /** 메모리 초과로 판단되는 경우 (OOM kill, ENOMEM 등) */
  memoryExceeded: boolean;
  timeMs: number;
  memoryKb: number | null;
}

export interface Executor {
  readonly name: string;
  /** 소스가 저장된 workdir에서 컴파일한다. 인터프리터 언어는 ok:true 반환 */
  compile(workdir: string, language: Language): Promise<CompileResult>;
  /** 컴파일된 workdir에서 한 테스트케이스를 실행한다 */
  run(workdir: string, language: Language, input: string, limits: RunLimits): Promise<RunResult>;
}
