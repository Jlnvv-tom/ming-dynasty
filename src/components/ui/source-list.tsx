import { BookOpen, ExternalLink } from 'lucide-react';
import type { SourceRef } from '@/types/index';
import { cn } from '@/lib/utils';

/** 史料出处列表：书名 + 卷次，只在可核验时附外链 */
export default function SourceList({
  sources,
  className,
}: {
  sources?: SourceRef[];
  className?: string;
}) {
  if (!sources?.length) return null;
  return (
    <ul className={cn('space-y-1.5 text-xs text-ink-faint dark:text-white/50', className)}>
      {sources.map((source) => (
        <li key={`${source.book}-${source.chapter ?? ''}`} className="flex flex-wrap items-baseline gap-1.5">
          <BookOpen className="h-3 w-3 shrink-0 translate-y-0.5" />
          <span className="text-ink-soft dark:text-white/65">{source.book}</span>
          {source.chapter ? <span>{source.chapter}</span> : null}
          {source.url ? (
            <a
              href={source.url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-0.5 text-dai transition-colors hover:text-vermilion dark:text-dai-soft"
            >
              在线核验
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
