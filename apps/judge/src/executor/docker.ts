/**
 * Docker 실행기: 언어별 이미지에서 격리 실행한다.
 *  - 네트워크 차단, 메모리·CPU·PID 제한, 읽기 전용 루트 파일시스템
 *  - 제출 코드 디렉터리만 /box 에 마운트
 * 워커 호스트에 docker CLI와 데몬 접근 권한이 있어야 한다.
 */
import { spawn } from 'child_process';
import type { Language } from '@cote/db';
import { LANGUAGES, substituteMem } from '../languages';
import type { CompileResult, Executor, RunLimits, RunResult } from './types';

const MAX_OUTPUT_BYTES = 1024 * 1024;

export class DockerExecutor implements Executor {
  readonly name = 'docker';

  async compile(workdir: string, language: Language): Promise<CompileResult> {
    const spec = LANGUAGES[language];
    if (!spec.compile) return { ok: true, log: '' };
    const r = await this.dockerRun(
      ['-v', `${workdir}:/box`, '-w', '/box', '--network', 'none', '--memory', '1g', '--cpus', '1', spec.image, ...spec.compile],
      '',
      60_000,
    );
    return { ok: r.exitCode === 0 && !r.timedOut, log: (r.stderr || r.stdout).slice(0, 8000) };
  }

  async run(workdir: string, language: Language, input: string, limits: RunLimits): Promise<RunResult> {
    const spec = LANGUAGES[language];
    const memMb = limits.memoryLimitMb + spec.memoryExtraMb;
    const cmd = substituteMem(spec.run, memMb);
    const wallMs = limits.timeLimitMs * spec.timeFactor;
    const r = await this.dockerRun(
      [
        '-i',
        '--network', 'none',
        '--memory', `${memMb}m`,
        '--memory-swap', `${memMb}m`,
        '--cpus', '1',
        '--pids-limit', '64',
        '--read-only',
        '--tmpfs', '/tmp:rw,size=64m',
        '--cap-drop', 'ALL',
        '--security-opt', 'no-new-privileges',
        '-v', `${workdir}:/box:ro`,
        '-w', '/box',
        spec.image,
        ...cmd,
      ],
      input,
      wallMs,
    );
    // docker 는 OOM kill 시 exit code 137 을 돌려준다
    const memoryExceeded = !r.timedOut && (r.exitCode === 137 || /OutOfMemoryError|MemoryError|bad_alloc/.test(r.stderr));
    return { ...r, memoryExceeded };
  }

  private dockerRun(args: string[], input: string, wallMs: number): Promise<RunResult> {
    return new Promise((resolve) => {
      const start = process.hrtime.bigint();
      const child = spawn('docker', ['run', '--rm', ...args], { stdio: ['pipe', 'pipe', 'pipe'] });
      let stdout = '';
      let stderr = '';
      let outBytes = 0;
      let timedOut = false;
      const timer = setTimeout(() => {
        timedOut = true;
        child.kill('SIGKILL');
      }, wallMs + 2000); // 컨테이너 기동 오버헤드 여유
      child.stdout.on('data', (d: Buffer) => {
        outBytes += d.length;
        if (outBytes <= MAX_OUTPUT_BYTES) stdout += d.toString();
      });
      child.stderr.on('data', (d: Buffer) => {
        if (stderr.length < 64 * 1024) stderr += d.toString();
      });
      child.on('error', (err) =>
        resolve({ stdout, stderr: String(err), exitCode: null, signal: null, timedOut: false, memoryExceeded: false, timeMs: 0, memoryKb: null }),
      );
      child.on('close', (code, signal) => {
        clearTimeout(timer);
        const timeMs = Number((process.hrtime.bigint() - start) / 1_000_000n);
        resolve({ stdout, stderr, exitCode: code, signal, timedOut, memoryExceeded: false, timeMs, memoryKb: null });
      });
      child.stdin.on('error', () => undefined);
      child.stdin.end(input);
    });
  }
}
