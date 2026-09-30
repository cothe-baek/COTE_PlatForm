'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { useAuth } from '@/lib/auth';
import { Button, Card, Input } from './ui';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const { login, signup } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === 'login') await login(email, password);
      else await signup(email, nickname, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : '요청에 실패했습니다');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto mt-12 max-w-sm">
      <Card className="p-7">
        <h1 className="text-xl font-bold">{mode === 'login' ? '로그인' : '회원가입'}</h1>
        <p className="mt-1 text-sm text-fg-2">{mode === 'login' ? '다시 만나서 반가워요.' : '풀고, 틀리고, 다시 풀어 봅시다.'}</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium">
            이메일
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full" />
          </label>
          {mode === 'signup' && (
            <label className="block text-sm font-medium">
              닉네임
              <Input required minLength={2} maxLength={20} value={nickname} onChange={(e) => setNickname(e.target.value)} className="mt-1.5 w-full" />
            </label>
          )}
          <label className="block text-sm font-medium">
            비밀번호
            <Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 w-full" />
          </label>
          {error && <p className="text-sm text-error">{error}</p>}
          <Button variant="primary" disabled={busy} className="w-full">
            {busy ? '처리 중…' : mode === 'login' ? '로그인' : '가입하기'}
          </Button>
        </form>
      </Card>
      <p className="mt-4 text-center text-sm text-fg-2">
        {mode === 'login' ? (
          <>
            계정이 없나요?{' '}
            <Link href="/auth/signup" className="font-medium text-primary hover:underline">
              회원가입
            </Link>
          </>
        ) : (
          <>
            이미 계정이 있나요?{' '}
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              로그인
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
