'use client';

import { Building2, Layers, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import PostDetail from '@/components/officials/post-detail';
import type { Post, Rank, System } from '@/types/index';
import { SYSTEM_LABEL } from '@/types/index';
import { cn } from '@/lib/utils';

interface Props {
  posts: Post[];
  ranks: Rank[];
}

const SYSTEM_TABS: (System | 'all')[] = ['all', 'central', 'local', 'military', 'field'];

function rankTone(rankLevel: number): string {
  if (rankLevel === 0) return 'text-ink-faint dark:text-white/45';
  if (rankLevel <= 2) return 'text-vermilion dark:text-vermilion-soft';
  if (rankLevel <= 4) return 'text-dai dark:text-dai-soft';
  if (rankLevel <= 6) return 'text-jade';
  return 'text-clay';
}

function PostRow({
  post,
  active,
  onSelect,
}: {
  post: Post;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(post.id)}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-all',
        active
          ? 'border-vermilion/60 bg-vermilion/5 shadow-card'
          : 'border-ink/10 hover:border-vermilion/40 hover:bg-vermilion/[0.04] dark:border-white/10',
      )}
    >
      <span className={cn('w-14 shrink-0 font-serif text-xs', rankTone(post.rankLevel))}>
        {post.rankLabel}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm">{post.name}</span>
        <span className="block truncate text-xs text-ink-faint dark:text-white/45">{post.org}</span>
      </span>
      {post.headcount ? (
        <span className="shrink-0 text-xs text-ink-faint dark:text-white/45">{post.headcount}</span>
      ) : null}
    </button>
  );
}

export default function OfficialsExplorer({ posts, ranks }: Props) {
  const [system, setSystem] = useState<System | 'all'>('all');
  const [view, setView] = useState<'rank' | 'org'>('rank');
  const [keyword, setKeyword] = useState('');
  const [rankFilter, setRankFilter] = useState<string | null>(null);
  const [orgFilter, setOrgFilter] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 挂载后读取 URL 查询串，支持 /officials/?post=p-123 与 ?org=吏部 深链
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const rank = query.get('rank');
    const post = query.get('post');
    const orgParam = query.get('org');
    if (rank) setRankFilter(rank);
    if (post) setSelectedId(post);
    if (orgParam) {
      setOrgFilter(orgParam);
      setView('org');
    }
  }, []);

  const filtered = useMemo(() => {
    const kw = keyword.trim();
    return posts.filter((post) => {
      if (system !== 'all' && post.system !== system) return false;
      if (rankFilter && post.rankLabel !== rankFilter) return false;
      if (orgFilter && post.org !== orgFilter) return false;
      if (!kw) return true;
      return [post.name, post.org, post.office, post.duty ?? ''].join(' ').includes(kw);
    });
  }, [keyword, orgFilter, posts, rankFilter, system]);

  const rankGroups = useMemo(
    () =>
      ranks
        .map((rank) => ({ rank, items: filtered.filter((p) => p.rankLabel === rank.label) }))
        .filter((group) => group.items.length > 0),
    [filtered, ranks],
  );

  const orgGroups = useMemo(() => {
    const map = new Map<string, Post[]>();
    for (const post of filtered) {
      const list = map.get(post.org) ?? [];
      list.push(post);
      map.set(post.org, list);
    }
    return Array.from(map, ([org, items]) => ({ org, items })).sort((a, b) => b.items.length - a.items.length);
  }, [filtered]);

  const selected = useMemo(() => posts.find((p) => p.id === selectedId) ?? null, [posts, selectedId]);
  const siblings = useMemo(
    () => (selected ? posts.filter((p) => p.org === selected.org && p.id !== selected.id).slice(0, 10) : []),
    [posts, selected],
  );
  const peers = useMemo(
    () =>
      selected
        ? posts.filter((p) => p.rankLabel === selected.rankLabel && p.id !== selected.id).slice(0, 10)
        : [],
    [posts, selected],
  );

  const select = (id: string | null) => {
    setSelectedId(id);
    const url = new URL(window.location.href);
    if (id) url.searchParams.set('post', id);
    else url.searchParams.delete('post');
    window.history.replaceState(null, '', url);
  };

  const clearFilters = () => {
    setRankFilter(null);
    setOrgFilter(null);
    setKeyword('');
    setSystem('all');
  };

  const hasFilter = Boolean(rankFilter || orgFilter || keyword || system !== 'all');

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10">
      {/* 工具栏 */}
      <div className="surface sticky top-16 z-30 space-y-3 p-3">
        <div className="flex flex-wrap items-center gap-2">
          {SYSTEM_TABS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSystem(key)}
              className={cn('chip transition-colors', system === key && 'chip-active')}
            >
              {key === 'all' ? '全部体系' : SYSTEM_LABEL[key]}
            </button>
          ))}
          {hasFilter ? (
            <button
              type="button"
              onClick={clearFilters}
              className="chip ml-auto gap-1 transition-colors hover:border-vermilion/50 hover:text-vermilion"
            >
              <X className="h-3 w-3" />
              清除筛选
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="搜索官职、衙门或职事，如「尚书」「巡抚」「监察」"
              className="w-full rounded-full border border-ink/15 bg-transparent py-1.5 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-ink-faint focus:border-vermilion/60 dark:border-white/15"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {(
              [
                ['rank', Layers, '按品级'],
                ['org', Building2, '按衙门'],
              ] as ['rank' | 'org', typeof Layers, string][]
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

        <div className="flex flex-wrap gap-1.5">
          {ranks.map((rank) => (
            <button
              key={rank.key}
              type="button"
              onClick={() => setRankFilter(rankFilter === rank.label ? null : rank.label)}
              className={cn(
                'rounded-md border px-2 py-0.5 text-[11px] transition-colors',
                rankFilter === rank.label
                  ? 'border-vermilion/60 bg-vermilion/10 text-vermilion dark:text-vermilion-soft'
                  : 'border-ink/10 text-ink-faint hover:border-vermilion/40 dark:border-white/10 dark:text-white/50',
              )}
            >
              {rank.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-ink-faint dark:text-white/45">
        <span>共 {filtered.length} 条官职</span>
        {orgFilter ? (
          <button type="button" onClick={() => setOrgFilter(null)} className="hover:text-vermilion">
            衙门筛选：{orgFilter} ✕
          </button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {view === 'rank'
            ? rankGroups.map((group) => (
                <section key={group.rank.key} className="surface p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className={cn('font-serif text-base font-semibold', rankTone(group.rank.level))}>
                      {group.rank.label}
                    </h3>
                    <span className="text-xs text-ink-faint dark:text-white/45">{group.items.length} 职</span>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {group.items.map((post) => (
                      <PostRow key={post.id} post={post} active={post.id === selectedId} onSelect={select} />
                    ))}
                  </div>
                </section>
              ))
            : orgGroups.map((group) => (
                <section key={group.org} className="surface p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setOrgFilter(group.org)}
                      className="font-serif text-base font-semibold hover:text-vermilion"
                    >
                      {group.org}
                    </button>
                    <span className="text-xs text-ink-faint dark:text-white/45">
                      {group.items.length} 职 ·{' '}
                      {Array.from(new Set(group.items.map((p) => p.rankLabel))).slice(0, 4).join(' / ')}
                    </span>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {group.items.map((post) => (
                      <PostRow key={post.id} post={post} active={post.id === selectedId} onSelect={select} />
                    ))}
                  </div>
                </section>
              ))}

          {!filtered.length ? (
            <div className="surface p-10 text-center text-sm text-ink-faint dark:text-white/45">
              没有匹配的官职，试试调整筛选条件
            </div>
          ) : null}
        </div>

        <div className="lg:sticky lg:top-40 lg:h-fit">
          {selected ? (
            <PostDetail post={selected} siblings={siblings} peers={peers} onClose={() => select(null)} onSelect={select} />
          ) : (
            <div className="surface p-6 text-sm text-ink-faint dark:text-white/45">
              点击左侧任意官职，查看其品级、隶属、员额与职事。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
