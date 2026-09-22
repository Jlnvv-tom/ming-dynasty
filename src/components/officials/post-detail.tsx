'use client';

import { X } from 'lucide-react';
import Link from 'next/link';
import type { Post } from '@/types/index';
import { SYSTEM_LABEL } from '@/types/index';

interface Props {
  post: Post;
  siblings: Post[];
  peers: Post[];
  onClose: () => void;
  onSelect: (id: string) => void;
}

export default function PostDetail({ post, siblings, peers, onClose, onSelect }: Props) {
  return (
    <aside className="surface animate-fade-up p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="label-key">{SYSTEM_LABEL[post.system]}</p>
          <h3 className="mt-1 font-serif text-xl font-semibold">{post.name}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭详情"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-ink/15 text-ink-soft transition-colors hover:border-vermilion/50 hover:text-vermilion dark:border-white/15 dark:text-white/70"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-md bg-vermilion/10 px-2 py-0.5 text-xs text-vermilion dark:text-vermilion-soft">
          {post.rankLabel}
        </span>
        <span className="chip text-[11px]">{post.org}</span>
        {post.headcount ? <span className="chip text-[11px]">员额 {post.headcount}</span> : null}
      </div>

      <div className="gold-rule my-4" />

      <dl className="space-y-2 text-sm">
        <div>
          <dt className="label-key mb-1">隶属</dt>
          <dd className="leading-relaxed">{post.office}</dd>
        </div>
        <div>
          <dt className="label-key mb-1">职事</dt>
          <dd className="leading-relaxed text-ink-soft dark:text-white/65">
            {post.duty || '原表未载'}
          </dd>
        </div>
      </dl>

      {siblings.length ? (
        <div className="mt-5">
          <p className="label-key mb-2">同衙门官职</p>
          <div className="flex flex-wrap gap-1.5">
            {siblings.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className="chip text-[11px] transition-colors hover:border-vermilion/50 hover:text-vermilion"
              >
                {item.name} · {item.rankLabel}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {peers.length ? (
        <div className="mt-4">
          <p className="label-key mb-2">同品级官职</p>
          <div className="flex flex-wrap gap-1.5">
            {peers.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className="chip text-[11px] transition-colors hover:border-vermilion/50 hover:text-vermilion"
              >
                {item.name} · {item.org}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <Link
        href={`/graph/?post=${post.id}`}
        className="mt-5 inline-flex items-center gap-1.5 text-sm text-vermilion hover:underline dark:text-vermilion-soft"
      >
        在官职体系图谱中查看 →
      </Link>
    </aside>
  );
}
