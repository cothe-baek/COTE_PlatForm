'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function LandingPage() {
  const { user } = useAuth();
  return (
    <div className="py-16">
      <h1 className="text-4xl font-bold tracking-tight">
        풀고, 틀리고, <span className="text-emerald-600">다시 푼다.</span>
      </h1>
      <p className="mt-4 max-w-xl text-lg text-slate-600">
        문제 은행이 아니라 준비 과정을 관리합니다. 틀린 문제는 자동으로 오답노트에 쌓이고, 다음 날 복습 목록에 올라옵니다.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href={user ? '/dashboard' : '/auth/signup'} className="rounded bg-slate-900 px-5 py-2.5 text-white hover:bg-slate-700">
          {user ? '대시보드로' : '시작하기'}
        </Link>
        <Link href="/problems" className="rounded border border-slate-300 px-5 py-2.5 hover:bg-white">
          문제 둘러보기
        </Link>
      </div>
      <div className="mt-16 grid gap-4 sm:grid-cols-3">
        {[
          ['문제 풀이', 'Python, JavaScript, C++, Java. 예제 실행으로 먼저 확인하고 제출합니다.'],
          ['자동 오답노트', '틀린 제출은 오답노트에 자동 등록됩니다. 왜 틀렸는지 메모하고 재도전하세요.'],
          ['유형별 통계', '어떤 유형이 약한지 대시보드에서 바로 확인합니다.'],
        ].map(([t, d]) => (
          <div key={t} className="rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="font-semibold">{t}</h3>
            <p className="mt-2 text-sm text-slate-600">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
