'use client';

import { ArrowRight } from 'lucide-react';

export interface ListGroup {
  key: string;
  title: string;
  hint?: string;
  items: { id: string; label: string; sub?: string }[];
}

interface Props {
  groups: ListGroup[];
  onPick: (id: string) => void;
  caption?: string;
}

/** 小屏 / 大图降级：用分组列表替代画布 */
export default function GraphListFallback({ groups, onPick, caption }: Props) {
  return (
    <div className="space-y-3">
      {caption ? (
        <p className="px-1 text-[11px] text-ink-faint dark:text-white/45">{caption}</p>
      ) : null}
      {groups.map((group) => (
        <section key={group.key} className="surface p-4">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-serif text-base font-semibold">{group.title}</h3>
            <span className="text-[11px] text-ink-faint dark:text-white/45">
              {group.hint ?? `${group.items.length} 项`}
            </span>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {group.items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onPick(item.id)}
                  className="group flex w-full cursor-pointer items-center gap-2 rounded-lg border border-ink/10 px-3 py-2 text-left transition-colors hover:border-vermilion/40 hover:bg-vermilion/[0.04] dark:border-white/10"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{item.label}</span>
                    {item.sub ? (
                      <span className="mt-0.5 block truncate text-[11px] text-ink-faint dark:text-white/45">
                        {item.sub}
                      </span>
                    ) : null}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
