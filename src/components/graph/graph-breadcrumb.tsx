'use client';

import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Crumb {
  label: string;
  onClick?: () => void;
}

export default function GraphBreadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="层级导航" className="flex flex-wrap items-center gap-1 text-sm">
      <button
        type="button"
        onClick={items[0]?.onClick}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-ink-soft transition-colors hover:text-vermilion dark:text-white/60"
      >
        <Home className="h-3.5 w-3.5" />
        {items[0]?.label ?? '总览'}
      </button>
      {items.slice(1).map((item, index) => {
        const isLast = index === items.length - 2;
        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 text-ink-faint" />
            {isLast || !item.onClick ? (
              <span className={cn('px-2 py-1 font-serif', isLast && 'text-vermilion dark:text-vermilion-soft')}>
                {item.label}
              </span>
            ) : (
              <button
                type="button"
                onClick={item.onClick}
                className="cursor-pointer rounded-lg px-2 py-1 text-ink-soft transition-colors hover:text-vermilion dark:text-white/60"
              >
                {item.label}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
