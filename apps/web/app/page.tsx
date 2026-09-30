'use client';

import { BarChart3, Code2, NotebookPen } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Card, LinkButton } from '@/components/ui';

const FEATURES = [
  { Icon: Code2, title: '문제 풀이', desc: 'Python, JavaScript, C++, Java. 예제 실행으로 먼저 확인하고 제출합니다.' },
  { Icon: NotebookPen, title: '자동 오답노트', desc: '틀린 제출은 오답노트에 자동 등록됩니다. 왜 틀렸는지 메모하고 재도전하세요.' },
  { Icon: BarChart3, title: '유형별 통계', desc: '어떤 유형이 약한지 대시보드에서 바로 확인합니다.' },
];

export default function LandingPage() {
  const { user } = useAuth();
  return (
    <div className="py-14 sm:py-20">
      <span className="inline-block rounded-md bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">코딩테스트 준비 플랫폼</span>
      <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
        풀고, 틀리고, <span className="text-primary">다시 푼다.</span>
      </h1>
      <p className="mt-4 max-w-xl text-lg text-fg-2">
        문제 은행이 아니라 준비 과정을 관리합니다. 틀린 문제는 자동으로 오답노트에 쌓이고, 다음 날 복습 목록에 올라옵니다.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <LinkButton href={user ? '/dashboard' : '/auth/signup'} variant="primary" className="px-6 py-2.5">
          {user ? '대시보드로' : '시작하기'}
        </LinkButton>
        <LinkButton href="/problems" className="px-6 py-2.5">
          문제 둘러보기
        </LinkButton>
      </div>
      <div className="mt-16 grid gap-4 sm:grid-cols-3">
        {FEATURES.map(({ Icon, title, desc }) => (
          <Card key={title}>
            <div className="inline-flex rounded-md bg-primary-soft p-2 text-primary">
              <Icon size={18} />
            </div>
            <h3 className="mt-3 font-bold">{title}</h3>
            <p className="mt-1.5 text-sm leading-6 text-fg-2">{desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
