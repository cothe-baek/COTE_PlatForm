'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { useAuth } from '@/lib/auth';

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

  const field = 'mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none';
  return (
    <div className="mx-auto mt-10 max-w-sm rounded-lg border border-slate-200 bg-white p-6">
      <h1 className="text-xl font-semibold">{mode === 'login' ? '로그인' : '회원가입'}</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <label className="block text-sm">
          이메일
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
        </label>
        {mode === 'signup' && (
          <label className="block text-sm">
            닉네임
            <input required minLength={2} maxLength={20} value={nickname} onChange={(e) => setNickname(e.target.value)} className={field} />
          </label>
        )}
        <label className="block text-sm">
          비밀번호
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={busy} className="w-full rounded bg-slate-900 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50">
          {busy ? '처리 중…' : mode === 'login' ? '로그인' : '가입하기'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        {mode === 'login' ? (
          <>
            계정이 없나요? <Link href="/auth/signup" className="underline">회원가입</Link>
          </>
        ) : (
          <>
            이미 계정이 있나요? <Link href="/auth/login" className="underline">로그인</Link>
          </>
        )}
      </p>
    </div>
  );
}
