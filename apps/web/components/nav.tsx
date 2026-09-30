'use client';

import { Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';

const LINKS = [
  { href: '/dashboard', label: '대시보드', auth: true },
  { href: '/problems', label: '문제', auth: false },
  { href: '/review', label: '오답노트', auth: true },
  { href: '/submissions', label: '제출 이력', auth: true },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const opt = (value: 'light' | 'dark', Icon: typeof Sun, label: string) => (
    <button
      type="button"
      onClick={() => setTheme(value)}
      aria-pressed={theme === value}
      aria-label={label}
      className={`inline-flex items-center gap-1 rounded-[7px] px-2.5 py-1 text-xs font-medium transition ${
        theme === value ? 'bg-surface text-fg shadow-sm' : 'text-fg-2 hover:text-fg'
      }`}
    >
      <Icon size={13} /> <span className="hidden sm:inline">{label}</span>
    </button>
  );
  return (
    <div className="inline-flex rounded-md bg-fill p-0.5">
      {opt('light', Sun, '라이트')}
      {opt('dark', Moon, '다크')}
    </div>
  );
}

export function Nav() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20 border-b border-border-soft bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-6">
          <Link href="/" className="shrink-0 text-lg font-extrabold tracking-tight text-primary">
            COTE
          </Link>
          <nav className="flex gap-0.5 overflow-x-auto whitespace-nowrap [scrollbar-width:none]">
            {LINKS.filter((l) => !l.auth || user).map((l) => {
              const active = pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`shrink-0 rounded-md px-2.5 py-1.5 text-sm font-medium transition sm:px-3 ${
                    active ? 'bg-primary-soft text-primary' : 'text-fg-2 hover:bg-fill hover:text-fg'
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-sm sm:gap-3">
          <ThemeToggle />
          {loading ? null : user ? (
            <>
              <span className="hidden font-medium text-fg-2 sm:inline">{user.nickname}</span>
              <button
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                className="whitespace-nowrap rounded-md border border-border px-3 py-1.5 text-xs font-medium text-fg-2 transition hover:border-primary hover:text-primary"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="whitespace-nowrap px-2 font-medium text-fg-2 hover:text-fg">
                로그인
              </Link>
              <Link href="/auth/signup" className="whitespace-nowrap rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-fg shadow-primary hover:bg-primary-hover">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
