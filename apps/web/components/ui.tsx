import Link from 'next/link';
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

/** 카드: 흰 면, 16px 라운드, 은은한 인디고 그림자 (다크에서는 그림자 없음) */
export function Card({ children, className = '', padded = true }: { children: ReactNode; className?: string; padded?: boolean }) {
  return <div className={`rounded-lg bg-surface shadow-card ${padded ? 'p-5' : ''} ${className}`}>{children}</div>;
}

type Variant = 'primary' | 'default' | 'text' | 'success';
const BTN: Record<Variant, string> = {
  primary: 'bg-primary text-primary-fg shadow-primary hover:bg-primary-hover',
  default: 'border border-border bg-surface text-fg hover:border-primary hover:text-primary',
  text: 'text-fg-2 hover:bg-fill hover:text-fg',
  success: 'bg-success text-white hover:opacity-90',
};
const BTN_BASE =
  'inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';

export function Button({ variant = 'default', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={`${BTN_BASE} ${BTN[variant]} ${className}`} {...props} />;
}

export function LinkButton({ href, variant = 'default', className = '', children }: { href: string; variant?: Variant; className?: string; children: ReactNode }) {
  return (
    <Link href={href} className={`${BTN_BASE} ${BTN[variant]} ${className}`}>
      {children}
    </Link>
  );
}

const FIELD = 'rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-soft';

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${FIELD} ${className}`} {...props} />;
}

export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${FIELD} ${className}`} {...props} />;
}

export function PageTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-fg-2">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-base font-bold">{children}</h2>
      {action}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-fg-2">{children}</div>;
}

export function Loading() {
  return <p className="py-8 text-center text-sm text-fg-3">불러오는 중…</p>;
}
