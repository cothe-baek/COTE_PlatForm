/**
 * problems/<slug>/problem.md + tests/*.in|out 를 읽어 DB에 upsert 한다.
 * 이미 있는 문제는 본문·메타·테스트케이스를 갱신한다(제출 이력은 유지).
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const PROBLEMS_DIR = path.resolve(__dirname, '../../../problems');

interface Meta {
  title: string;
  difficulty: number;
  tags: string[];
  timeLimitMs?: number;
  memoryLimitMb?: number;
  samples?: number;
}

function parseProblem(dir: string) {
  const md = fs.readFileSync(path.join(dir, 'problem.md'), 'utf8');
  const m = md.match(/^<!--\s*meta\s*(\{[\s\S]*?\})\s*-->/);
  if (!m) throw new Error(`meta comment not found in ${dir}`);
  const meta = JSON.parse(m[1]) as Meta;
  // 제목은 meta 에 있으므로 본문 맨 앞의 H1 은 제거한다
  const body = md.slice(m[0].length).trim().replace(/^#\s+[^\n]*\n+/, '');
  const testsDir = path.join(dir, 'tests');
  const inputs = fs
    .readdirSync(testsDir)
    .filter((f) => f.endsWith('.in'))
    .sort((a, b) => parseInt(a) - parseInt(b));
  const tests = inputs.map((f, i) => ({
    order: i + 1,
    input: fs.readFileSync(path.join(testsDir, f), 'utf8'),
    output: fs.readFileSync(path.join(testsDir, f.replace(/\.in$/, '.out')), 'utf8'),
    isSample: i < (meta.samples ?? 1),
  }));
  return { meta, body, tests };
}

async function main() {
  const slugs = fs
    .readdirSync(PROBLEMS_DIR)
    .filter((s) => fs.existsSync(path.join(PROBLEMS_DIR, s, 'problem.md')));

  for (const slug of slugs) {
    const { meta, body, tests } = parseProblem(path.join(PROBLEMS_DIR, slug));
    const problem = await prisma.problem.upsert({
      where: { slug },
      create: {
        slug,
        title: meta.title,
        body,
        difficulty: meta.difficulty,
        timeLimitMs: meta.timeLimitMs ?? 2000,
        memoryLimitMb: meta.memoryLimitMb ?? 256,
      },
      update: {
        title: meta.title,
        body,
        difficulty: meta.difficulty,
        timeLimitMs: meta.timeLimitMs ?? 2000,
        memoryLimitMb: meta.memoryLimitMb ?? 256,
      },
    });
    await prisma.problemTag.deleteMany({ where: { problemId: problem.id } });
    await prisma.problemTag.createMany({
      data: meta.tags.map((tag) => ({ problemId: problem.id, tag })),
    });
    for (const t of tests) {
      await prisma.testCase.upsert({
        where: { problemId_order: { problemId: problem.id, order: t.order } },
        create: { problemId: problem.id, ...t },
        update: { input: t.input, output: t.output, isSample: t.isSample },
      });
    }
    await prisma.testCase.deleteMany({
      where: { problemId: problem.id, order: { gt: tests.length } },
    });
    console.log(`seeded ${slug} (${tests.length} tests)`);
  }
  console.log(`done: ${slugs.length} problems`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
