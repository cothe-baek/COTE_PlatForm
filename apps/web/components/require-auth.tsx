'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth';

/** 로그인이 필요한 페이지를 감싼다. 비로그인 시 로그인 페이지로 보낸다. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login');
  }, [loading, user, router]);
  if (loading || !user) return <p className="p-8 text-sm text-slate-500">불러오는 중…</p>;
  return <>{children}</>;
}
