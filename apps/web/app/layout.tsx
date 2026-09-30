import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Nav } from '@/components/nav';
import { AuthProvider } from '@/lib/auth';
import { THEME_INIT_SCRIPT, ThemeProvider } from '@/lib/theme';
import './globals.css';

export const metadata: Metadata = {
  title: 'COTE — 코딩테스트 준비',
  description: '문제 풀이, 오답 복습, 모의고사로 이어지는 코딩테스트 준비 플랫폼',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <AuthProvider>
            <Nav />
            <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
