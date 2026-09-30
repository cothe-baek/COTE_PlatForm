'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth';
import { Loading } from './ui';

/** 로그인이 필요한 페이지를 감싼다. 비로그인 시 로그인 페이지로 보낸다. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login');
  }, [loading, user, router]);
  if (loading || !user) return <Loading />;
  return <>{children}</>;
}
