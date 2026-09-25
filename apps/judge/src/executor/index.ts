import { DockerExecutor } from './docker';
import { LocalExecutor } from './local';
import type { Executor } from './types';

export type { Executor, RunResult, CompileResult, RunLimits } from './types';

export function createExecutor(kind = process.env.JUDGE_EXECUTOR ?? 'local'): Executor {
  switch (kind) {
    case 'docker':
      return new DockerExecutor();
    case 'local':
      return new LocalExecutor();
    default:
      throw new Error(`unknown JUDGE_EXECUTOR: ${kind}`);
  }
}
