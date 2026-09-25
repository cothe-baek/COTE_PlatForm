/**
 * 실행기 단위 검증 (DB 없이). `pnpm --filter @cote/judge test`
 * 각 언어의 정답/오답/시간초과/런타임에러/컴파일에러 판정을 확인한다.
 */
import * as assert from 'assert';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { outputsMatch } from './compare';
import { createExecutor } from './executor';
import { LANGUAGES } from './languages';
import type { Language } from '@cote/db';

const executor = createExecutor(process.env.JUDGE_EXECUTOR ?? 'local');

async function runCode(language: Language, code: string, input: string, timeLimitMs = 1000) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'judge-spec-'));
  try {
    fs.writeFileSync(path.join(dir, LANGUAGES[language].sourceFile), code);
    const c = await executor.compile(dir, language);
    if (!c.ok) return { verdict: 'CE', log: c.log };
    const r = await executor.run(dir, language, input, { timeLimitMs, memoryLimitMb: 128 });
    if (r.timedOut) return { verdict: 'TLE' };
    if (r.exitCode !== 0) return { verdict: 'RE', stderr: r.stderr };
    return { verdict: 'OK', stdout: r.stdout, memoryKb: r.memoryKb };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const cases: Array<[string, () => Promise<void>]> = [
  ['compare ignores trailing whitespace', async () => {
    assert.ok(outputsMatch('3\n', '3'));
    assert.ok(outputsMatch('a b \n\n', 'a b'));
    assert.ok(!outputsMatch('3', '4'));
    assert.ok(!outputsMatch('1\n2', '1 2'));
  }],
  ['python AC', async () => {
    const r = await runCode('PYTHON', 'a,b=map(int,input().split());print(a+b)', '1 2\n');
    assert.equal(r.verdict, 'OK');
    assert.ok(outputsMatch('3', r.stdout!));
  }],
  ['python TLE', async () => {
    const r = await runCode('PYTHON', 'while True: pass', '', 300);
    assert.equal(r.verdict, 'TLE');
  }],
  ['python RE', async () => {
    const r = await runCode('PYTHON', 'print(1/0)', '');
    assert.equal(r.verdict, 'RE');
  }],
  ['javascript AC', async () => {
    const r = await runCode('JAVASCRIPT', 'const [a,b]=require("fs").readFileSync(0,"utf8").split(" ").map(Number);console.log(a+b)', '1 2\n');
    assert.equal(r.verdict, 'OK');
    assert.ok(outputsMatch('3', r.stdout!));
  }],
  ['cpp AC', async () => {
    const r = await runCode('CPP', '#include <cstdio>\nint main(){long long a,b;scanf("%lld %lld",&a,&b);printf("%lld\\n",a+b);}', '1 2\n');
    assert.equal(r.verdict, 'OK');
    assert.ok(outputsMatch('3', r.stdout!));
  }],
  ['cpp CE', async () => {
    const r = await runCode('CPP', 'int main(){ return x; }', '');
    assert.equal(r.verdict, 'CE');
    assert.ok(r.log!.length > 0);
  }],
  ['java AC', async () => {
    const r = await runCode(
      'JAVA',
      'import java.util.*;public class Main{public static void main(String[] a){Scanner s=new Scanner(System.in);System.out.println(s.nextLong()+s.nextLong());}}',
      '1 2\n',
      2000,
    );
    assert.equal(r.verdict, 'OK', JSON.stringify(r));
    assert.ok(outputsMatch('3', r.stdout!));
  }],
];

(async () => {
  let failed = 0;
  for (const [name, fn] of cases) {
    try {
      await fn();
      console.log(`  ok   ${name}`);
    } catch (e) {
      failed++;
      console.log(`  FAIL ${name}\n       ${String(e)}`);
    }
  }
  console.log(failed ? `${failed} failed` : 'all passed');
  process.exit(failed ? 1 : 0);
})();
