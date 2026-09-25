'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const LINKS = [
  { href: '/dashboard', label: '대시보드', auth: true },
  { href: '/problems', label: '문제', auth: false },
  { href: '/review', label: '오답노트', auth: true },
  { href: '/submissions', label: '제출 이력', auth: true },
];

export function Nav() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            COTE
          </Link>
          <nav className="flex gap-1">
            {LINKS.filter((l) => !l.auth || user).map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded px-3 py-1.5 text-sm ${pathname.startsWith(l.href) ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {loading ? null : user ? (
            <>
              <span className="text-slate-600">{user.nickname}</span>
              <button
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                className="rounded border border-slate-300 px-3 py-1 hover:bg-slate-50"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="px-3 py-1 text-slate-600 hover:underline">
                로그인
              </Link>
              <Link href="/auth/signup" className="rounded bg-slate-900 px-3 py-1 text-white hover:bg-slate-700">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
