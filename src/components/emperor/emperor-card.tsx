import Link from 'next/link';
import type { Emperor } from '@/types/index';
import { cn } from '@/lib/utils';

interface EmperorCardProps {
  emperor: Emperor;
  compact?: boolean;
}

export function EmperorCard({ emperor, compact }: EmperorCardProps) {
  const eras = emperor.eras.map((e) => e.name).join('、');
  return (
    <Link
      href={`/emperors/${emperor.id}/`}
      className={cn(
        'surface surface-hover group flex h-full flex-col p-4',
        emperor.branch === 'nanming' && 'border-dashed',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-lg font-semibold tracking-wide group-hover:text-vermilion dark:group-hover:text-vermilion-soft">
            {emperor.templeName}
          </h3>
          <p className="mt-0.5 text-sm text-ink-soft dark:text-white/60">{emperor.name}</p>
        </div>
        <span className="chip shrink-0 text-[11px]">{emperor.branch === 'nanming' ? '南明' : `第 ${emperor.index} 帝`}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {emperor.eras.map((era) => (
          <span
            key={era.name}
            className="rounded-md bg-dai/10 px-2 py-0.5 text-xs text-dai dark:bg-dai-light/20 dark:text-dai-soft"
          >
            {era.name}
          </span>
        ))}
      </div>

      <p className="mt-2 text-xs text-ink-faint dark:text-white/45">
        {emperor.reignText || '—'}
        {emperor.reignYears ? ` · 共 ${emperor.reignYears} 年` : ''}
      </p>

      {compact ? null : (
        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-ink-soft dark:text-white/55">
          {emperor.posthumousName || '谥号未载'}
        </p>
      )}

      <span className="mt-auto pt-3 text-xs text-vermilion opacity-0 transition-opacity group-hover:opacity-100 dark:text-vermilion-soft">
        查看档案 →
      </span>
      <span className="sr-only">{eras}</span>
    </Link>
  );
}
