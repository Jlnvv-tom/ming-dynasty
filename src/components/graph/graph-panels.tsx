'use client';

import Link from 'next/link';
import { getEmperor, getPost, getPrinces, posts, resolveNode } from '@/lib/data';
import { getPeriodOfEmperor } from '@/lib/graph';
import { SYSTEM_LABEL } from '@/types/index';

const LINK = 'inline-flex text-sm text-vermilion hover:underline dark:text-vermilion-soft';
const BTN =
  'inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-xs transition-colors hover:border-vermilion/50 hover:text-vermilion dark:border-white/15 dark:text-white/65';

/* ------------------------------- 帝王 / 宗室 ------------------------------- */

export function EmperorPanel({
  emperorId,
  currentPeriodId,
  expanded,
  onToggleExpand,
  onSwitchPeriod,
}: {
  emperorId: string;
  currentPeriodId: string;
  expanded: boolean;
  onToggleExpand: () => void;
  onSwitchPeriod: (periodId: string, emperorId: string) => void;
}) {
  const emperor = getEmperor(emperorId);
  if (!emperor) return null;
  const princes = getPrinces(emperor.id);
  const period = getPeriodOfEmperor(emperor.id);

  return (
    <div className="animate-fade-up">
      <p className="label-key">
        {emperor.branch === 'nanming' ? '南明' : '大明'} · 第 {emperor.index} 帝
      </p>
      <h3 className="mt-1 font-serif text-xl font-semibold">{emperor.templeName}</h3>
      <p className="mt-0.5 text-sm text-ink-soft dark:text-white/60">{emperor.name}</p>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {emperor.eras.map((era) => (
          <span
            key={era.name}
            className="rounded-md bg-dai/10 px-2 py-0.5 text-xs text-dai dark:bg-dai-light/20 dark:text-dai-soft"
          >
            {era.name}
          </span>
        ))}
      </div>

      <p className="mt-2 text-xs text-ink-faint dark:text-white/45">{emperor.reignText}</p>
      <p className="mt-3 text-xs leading-relaxed text-ink-soft dark:text-white/60">
        {emperor.posthumousName}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {princes.length ? (
          <button type="button" className={BTN} onClick={onToggleExpand}>
            {expanded ? `收起 ${princes.length} 位皇子` : `在图中展开 ${princes.length} 位皇子`}
          </button>
        ) : (
          <span className="text-xs text-ink-faint dark:text-white/45">原表未载子嗣</span>
        )}
      </div>

      {period && period.id !== currentPeriodId ? (
        <div className="mt-3">
          <button
            type="button"
            className={BTN}
            onClick={() => onSwitchPeriod(period.id, emperor.id)}
          >
            切换到「{period.name}」
          </button>
        </div>
      ) : null}

      <Link href={`/emperors/${emperor.id}/`} className={`${LINK} mt-4`}>
        查看完整档案 →
      </Link>
    </div>
  );
}

export function PrincePanel({ nodeId }: { nodeId: string }) {
  const prince = resolveNode(nodeId);

  return (
    <div className="animate-fade-up">
      <p className="label-key">宗室</p>
      <h3 className="mt-1 font-serif text-xl font-semibold">{prince.label}</h3>
      <p className="mt-1 text-sm text-ink-soft dark:text-white/60">{prince.caption}</p>
      <Link href={prince.href ?? '#'} className={`${LINK} mt-4`}>
        查看所属帝王 →
      </Link>
    </div>
  );
}

/* --------------------------------- 官职 --------------------------------- */

export function OrgPanel({
  org,
  onDrill,
  onSelectPost,
}: {
  org: string;
  onDrill?: () => void;
  onSelectPost: (id: string) => void;
}) {
  const scoped = posts.filter((post) => post.org === org);
  if (!scoped.length) return null;
  const sorted = [...scoped].sort((a, b) => a.rankSort - b.rankSort);
  const ranks = Array.from(new Set(sorted.map((post) => post.rankLabel)));

  return (
    <div className="animate-fade-up">
      <p className="label-key">衙门</p>
      <h3 className="mt-1 font-serif text-xl font-semibold">{org}</h3>
      <p className="mt-1 text-xs text-ink-faint dark:text-white/45">
        {scoped.length} 职 · 品级跨度 {ranks[0]} — {ranks[ranks.length - 1]}
      </p>

      {onDrill ? (
        <button type="button" className={`${BTN} mt-4`} onClick={onDrill}>
          进入该衙门官职图 →
        </button>
      ) : null}

      <div className="mt-4">
        <p className="label-key mb-2">主要官职</p>
        <div className="flex flex-wrap gap-1.5">
          {sorted.slice(0, 10).map((post) => (
            <button
              key={post.id}
              type="button"
              onClick={() => onSelectPost(post.id)}
              className="chip cursor-pointer text-[11px] transition-colors hover:border-vermilion/50 hover:text-vermilion"
            >
              {post.name} · {post.rankLabel}
            </button>
          ))}
        </div>
      </div>

      <Link href={`/officials/?org=${encodeURIComponent(org)}`} className={`${LINK} mt-4`}>
        在官职目录中筛选 →
      </Link>
    </div>
  );
}

export function PostPanel({ postId }: { postId: string }) {
  const post = getPost(postId);
  if (!post) return null;
  return (
    <div className="animate-fade-up">
      <p className="label-key">{SYSTEM_LABEL[post.system]}</p>
      <h3 className="mt-1 font-serif text-xl font-semibold">{post.name}</h3>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="rounded-md bg-vermilion/10 px-2 py-0.5 text-xs text-vermilion dark:text-vermilion-soft">
          {post.rankLabel}
        </span>
        <span className="chip text-[11px]">{post.org}</span>
        {post.headcount ? <span className="chip text-[11px]">员额 {post.headcount}</span> : null}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-ink-soft dark:text-white/60">
        {post.duty || '原表未载职事'}
      </p>
      <p className="mt-2 text-[11px] text-ink-faint dark:text-white/45">隶属：{post.office}</p>
      <Link href={`/officials/?post=${post.id}`} className={`${LINK} mt-4`}>
        在官职目录中查看 →
      </Link>
    </div>
  );
}
