'use client';

import { Menu, ScrollText, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import ThemeToggle from './theme-toggle';

const NAV = [
  { href: '/emperors/', label: '帝王世系' },
  { href: '/officials/', label: '官职品级' },
  { href: '/graph/', label: '关系图谱' },
  { href: '/institutions/', label: '制度附录' },
  { href: '/about/', label: '关于' },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-ink/10 bg-paper/85 backdrop-blur-md dark:border-white/10 dark:bg-night/85'
          : 'border-b border-transparent',
      )}
    >
      <div className={cn('mx-auto flex max-w-7xl items-center gap-4 px-4 transition-all duration-300', scrolled ? 'h-14' : 'h-16')}>
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="seal transition-transform duration-300 group-hover:rotate-6">明</span>
          <span className="flex flex-col leading-tight">
            <span className="font-serif text-base font-semibold tracking-[0.18em]">大明职官志</span>
            <span className="hidden text-[11px] tracking-[0.24em] text-ink-faint dark:text-white/45 sm:block">
              帝王世系 · 官职品级
            </span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href.replace(/\/$/, ''));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative rounded-lg px-3 py-1.5 text-sm transition-colors',
                  active
                    ? 'text-vermilion dark:text-vermilion-soft'
                    : 'text-ink-soft hover:text-vermilion dark:text-white/70 dark:hover:text-vermilion-soft',
                )}
              >
                {item.label}
                {active ? (
                  <span className="absolute inset-x-3 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-vermilion to-transparent" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/search/"
            className="hidden items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-xs text-ink-soft transition-colors hover:border-vermilion/50 hover:text-vermilion dark:border-white/15 dark:text-white/70 sm:flex"
          >
            <ScrollText className="h-3.5 w-3.5" />
            检索
          </Link>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="打开导航"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink-soft dark:border-white/15 dark:text-white/70 md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="animate-fade-in border-t border-ink/10 bg-paper/95 px-4 py-3 backdrop-blur-md dark:border-white/10 dark:bg-night/95 md:hidden">
          <ul className="grid gap-1">
            {[{ href: '/', label: '首页' }, ...NAV, { href: '/search/', label: '全局检索' }].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'block rounded-lg px-3 py-2 text-sm',
                    pathname === item.href
                      ? 'bg-vermilion/10 text-vermilion'
                      : 'text-ink-soft dark:text-white/70',
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
