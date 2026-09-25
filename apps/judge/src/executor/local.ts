/**
 * 로컬 실행기: 호스트 프로세스로 직접 실행한다.
 * 개발·테스트 전용이며 격리가 없다. 운영에서는 DockerExecutor를 사용한다.
 */
import { spawn } from 'child_process';
import * as fs from 'fs';
import type { Language } from '@cote/db';
import { LANGUAGES, substituteMem } from '../languages';
import type { CompileResult, Executor, RunLimits, RunResult } from './types';

const MAX_OUTPUT_BYTES = 1024 * 1024; // 1MB 넘는 출력은 잘라낸다

function readPeakRssKb(pid: number): number | null {
  try {
    const status = fs.readFileSync(`/proc/${pid}/status`, 'utf8');
    const m = status.match(/VmHWM:\s+(\d+)\s+kB/);
    return m ? parseInt(m[1], 10) : null;
  } catch {
    return null;
  }
}

export class LocalExecutor implements Executor {
  readonly name = 'local';

  async compile(workdir: string, language: Language): Promise<CompileResult> {
    const spec = LANGUAGES[language];
    if (!spec.compile) return { ok: true, log: '' };
    const r = await this.spawnCollect(spec.compile, workdir, '', 30_000, null, false);
    return { ok: r.exitCode === 0 && !r.timedOut, log: (r.stderr || r.stdout).slice(0, 8000) };
  }

  async run(workdir: string, language: Language, input: string, limits: RunLimits): Promise<RunResult> {
    const spec = LANGUAGES[language];
    const memMb = limits.memoryLimitMb + spec.memoryExtraMb;
    const cmd = substituteMem(spec.run, memMb);
    // 벽시계 시간은 제한의 timeFactor 배 + 여유를 두고, 판정은 CPU 시간이 아닌 벽시계 기준
    const wallMs = limits.timeLimitMs * spec.timeFactor;
    return this.spawnCollect(cmd, workdir, input, wallMs, spec.addressSpaceLimit ? memMb : null, true);
  }

  private spawnCollect(
    cmd: string[],
    cwd: string,
    input: string,
    wallMs: number,
    addressSpaceMb: number | null,
    trackMemory: boolean,
  ): Promise<RunResult> {
    return new Promise((resolve) => {
      const argv =
        addressSpaceMb != null
          ? ['prlimit', `--as=${addressSpaceMb * 1024 * 1024}`, '--nproc=64', '--', ...cmd]
          : ['prlimit', '--nproc=64', '--', ...cmd];
      const start = process.hrtime.bigint();
      const child = spawn(argv[0], argv.slice(1), {
        cwd,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { PATH: process.env.PATH ?? '/usr/bin:/bin', LANG: 'C.UTF-8', HOME: cwd },
      });

      let stdout = '';
      let stderr = '';
      let outBytes = 0;
      let timedOut = false;
      let peakKb: number | null = null;

      const killTimer = setTimeout(() => {
        timedOut = true;
        child.kill('SIGKILL');
      }, wallMs);

      const memTimer = trackMemory
        ? setInterval(() => {
            const v = child.pid ? readPeakRssKb(child.pid) : null;
            if (v != null && (peakKb == null || v > peakKb)) peakKb = v;
          }, 5)
        : null;

      child.stdout.on('data', (d: Buffer) => {
        outBytes += d.length;
        if (outBytes <= MAX_OUTPUT_BYTES) stdout += d.toString();
      });
      child.stderr.on('data', (d: Buffer) => {
        if (stderr.length < 64 * 1024) stderr += d.toString();
      });
      child.on('error', (err) => {
        clearTimeout(killTimer);
        if (memTimer) clearInterval(memTimer);
        resolve({
          stdout,
          stderr: String(err),
          exitCode: null,
          signal: null,
          timedOut: false,
          memoryExceeded: false,
          timeMs: 0,
          memoryKb: null,
        });
      });
      child.on('close', (code, signal) => {
        clearTimeout(killTimer);
        if (memTimer) clearInterval(memTimer);
        const timeMs = Number((process.hrtime.bigint() - start) / 1_000_000n);
        const memoryExceeded =
          !timedOut &&
          (/MemoryError|std::bad_alloc|OutOfMemoryError|ENOMEM|Cannot allocate memory/.test(stderr) ||
            (addressSpaceMb != null && peakKb != null && peakKb > addressSpaceMb * 1024));
        resolve({
          stdout,
          stderr,
          exitCode: code,
          signal,
          timedOut,
          memoryExceeded,
          timeMs,
          memoryKb: peakKb,
        });
      });

      child.stdin.on('error', () => undefined); // 프로그램이 입력을 다 읽지 않고 종료해도 무시
      child.stdin.end(input);
    });
  }
}
