'use client';

import { GitBranch, LayoutGrid, ListOrdered, Search } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { EmperorCard } from '@/components/emperor/emperor-card';
import type { Emperor, Prince, Relation } from '@/types/index';
import { RELATION_LABEL } from '@/types/index';
import { cn } from '@/lib/utils';

type BranchFilter = 'all' | 'ming' | 'nanming';
type ViewMode = 'grid' | 'timeline' | 'chain';

interface Props {
  emperors: Emperor[];
  princes: Prince[];
  relations: Relation[];
}

export default function EmperorExplorer({ emperors, princes, relations }: Props) {
  const [branch, setBranch] = useState<BranchFilter>('all');
  const [view, setView] = useState<ViewMode>('grid');
  const [keyword, setKeyword] = useState('');

  const filtered = useMemo(() => {
    const kw = keyword.trim();
    return emperors
      .filter((e) => branch === 'all' || e.branch === branch)
      .filter((e) => {
        if (!kw) return true;
        return [e.templeName, e.name, ...e.eras.map((era) => era.name), e.posthumousName]
          .join(' ')
          .includes(kw);
      });
  }, [branch, keyword, emperors]);

  const princeCount = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of princes) map.set(p.emperorId, (map.get(p.emperorId) ?? 0) + 1);
    return map;
  }, [princes]);

  const succession = useMemo(
    () => relations.filter((r) => r.type !== 'father_son'),
    [relations],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10">
      {/* 工具栏 */}
      <div className="surface sticky top-16 z-30 flex flex-wrap items-center gap-3 p-3">
        <div className="flex items-center gap-1.5">
          {(
            [
              ['all', '全部'],
              ['ming', '大明'],
              ['nanming', '南明'],
            ] as [BranchFilter, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setBranch(key)}
              className={cn('chip transition-colors', branch === key && 'chip-active')}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[180px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索庙号、名讳或年号，如「永乐」「朱棣」"
            className="w-full rounded-full border border-ink/15 bg-transparent py-1.5 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-ink-faint focus:border-vermilion/60 dark:border-white/15"
          />
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          {(
            [
              ['grid', LayoutGrid, '卡片'],
              ['timeline', ListOrdered, '时间轴'],
              ['chain', GitBranch, '继统链'],
            ] as [ViewMode, typeof LayoutGrid, string][]
          ).map(([key, Icon, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setView(key)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors',
                view === key
                  ? 'border-vermilion/50 bg-vermilion/10 text-vermilion dark:text-vermilion-soft'
                  : 'border-ink/15 text-ink-soft dark:border-white/15 dark:text-white/65',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs text-ink-faint dark:text-white/45">
        共 {filtered.length} 位帝王
        {branch === 'all' ? '（含南明）' : branch === 'nanming' ? '（南明）' : '（大明）'}
      </p>

      {/* 卡片视图 */}
      {view === 'grid' ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((emperor) => (
            <EmperorCard key={emperor.id} emperor={emperor} />
          ))}
        </div>
      ) : null}

      {/* 时间轴视图 */}
      {view === 'timeline' ? (
        <ol className="mt-6 space-y-3">
          {filtered.map((emperor) => (
            <li key={emperor.id} className="relative flex gap-4">
              <div className="flex w-28 shrink-0 flex-col items-end pt-3 text-right">
                <span className="font-serif text-sm text-vermilion dark:text-vermilion-soft">
                  {emperor.reignStart ?? '—'}
                </span>
                <span className="text-xs text-ink-faint dark:text-white/45">
                  {emperor.reignEnd && emperor.reignEnd !== emperor.reignStart ? emperor.reignEnd : ''}
                </span>
              </div>
              <div className="relative flex flex-col items-center">
                <span
                  className={cn(
                    'mt-4 h-3 w-3 rounded-full border-2',
                    emperor.branch === 'nanming'
                      ? 'border-dashed border-dai bg-transparent'
                      : 'border-vermilion bg-paper dark:bg-night',
                  )}
                />
                <span className="h-full w-px bg-ink/15 dark:bg-white/15" />
              </div>
              <Link
                href={`/emperors/${emperor.id}/`}
                className="surface surface-hover group flex-1 p-4"
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-serif text-lg font-semibold group-hover:text-vermilion dark:group-hover:text-vermilion-soft">
                    {emperor.templeName}
                  </h3>
                  <span className="text-sm text-ink-soft dark:text-white/60">{emperor.name}</span>
                  {emperor.eras.map((era) => (
                    <span
                      key={era.name}
                      className="rounded-md bg-dai/10 px-2 py-0.5 text-xs text-dai dark:bg-dai-light/20 dark:text-dai-soft"
                    >
                      {era.name}
                    </span>
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-ink-faint dark:text-white/45">
                  {emperor.reignText} · 皇子 {princeCount.get(emperor.id) ?? 0} 位
                </p>
                <p className="mt-2 text-xs leading-relaxed text-ink-soft dark:text-white/55">
                  {emperor.posthumousName || '谥号未载'}
                </p>
              </Link>
            </li>
          ))}
        </ol>
      ) : null}

      {/* 继统链视图 */}
      {view === 'chain' ? (
        <div className="mt-6 space-y-2">
          {succession.map((rel) => {
            const from = emperors.find((e) => e.id === rel.source);
            const to = emperors.find((e) => e.id === rel.target);
            if (!from || !to) return null;
            if (branch !== 'all' && (from.branch !== branch || to.branch !== branch)) return null;
            return (
              <div key={rel.id} className="surface flex flex-wrap items-center gap-3 p-3 text-sm">
                <Link href={`/emperors/${from.id}/`} className="font-serif hover:text-vermilion">
                  {from.templeName}
                </Link>
                <span className="text-xs text-ink-faint dark:text-white/45">
                  {RELATION_LABEL[rel.type]} · {rel.label}
                </span>
                <span className="text-vermilion">→</span>
                <Link href={`/emperors/${to.id}/`} className="font-serif hover:text-vermilion">
                  {to.templeName}
                </Link>
                <span className="ml-auto text-xs text-ink-faint dark:text-white/45">
                  {to.eras.map((era) => era.name).join('、')} · {to.reignText}
                </span>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
