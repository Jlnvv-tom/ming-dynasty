import { ArrowLeft, Network } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAncestorPath, getDescendants } from '@/lib/graph';
import {
  emperors,
  getEmperor,
  getFamilyLinks,
  getPrinces,
  getSuccessionLinks,
  resolveNode,
} from '@/lib/data';
import { RELATION_LABEL } from '@/types/index';

interface Params {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return emperors.map((emperor) => ({ id: emperor.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const emperor = getEmperor(id);
  if (!emperor) return { title: '帝王' };
  return {
    title: `${emperor.templeName} ${emperor.name}`,
    description: `${emperor.templeName}（${emperor.name}），年号${emperor.eras
      .map((e) => e.name)
      .join('、')}，在位 ${emperor.reignText}。谥号：${emperor.posthumousName}。`,
  };
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-2 text-sm">
      <span className="w-16 shrink-0 text-ink-faint dark:text-white/45">{label}</span>
      <span className="flex-1 leading-relaxed">{value}</span>
    </div>
  );
}

export default async function EmperorDetailPage({ params }: Params) {
  const { id } = await params;
  const emperor = getEmperor(id);
  if (!emperor) notFound();

  const ancestors = getAncestorPath(emperor.id).reverse();
  const children = getPrinces(emperor.id);
  const { parents } = getFamilyLinks(emperor.id);
  const { prev, next } = getSuccessionLinks(emperor.id);
  const siblings = parents.length
    ? getPrinces(parents[0].id).filter((p) => p.name !== emperor.name)
    : [];
  const descendants = getDescendants(emperor.id).length;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-10">
      <Link
        href="/emperors/"
        className="inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-vermilion dark:text-white/60"
      >
        <ArrowLeft className="h-4 w-4" />
        返回帝王世系
      </Link>

      {/* 档案头 */}
      <section className="surface mt-4 p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label-key">
              {emperor.branch === 'nanming' ? '南明' : '大明'} · 第 {emperor.index} 位
            </p>
            <h1 className="mt-2 font-serif text-4xl font-semibold">{emperor.templeName}</h1>
            <p className="mt-1 text-lg text-ink-soft dark:text-white/65">{emperor.name}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {emperor.eras.map((era) => (
              <span
                key={era.name}
                className="rounded-lg bg-dai/10 px-3 py-1 text-sm text-dai dark:bg-dai-light/20 dark:text-dai-soft"
              >
                {era.name}
              </span>
            ))}
          </div>
        </div>

        <div className="gold-rule my-5" />

        <div className="grid gap-x-10 sm:grid-cols-2">
          <InfoRow label="在位" value={emperor.reignText || '—'} />
          <InfoRow
            label="纪年"
            value={
              emperor.reignStart
                ? `${emperor.reignStart} — ${emperor.reignEnd ?? ''} 年`
                : '—'
            }
          />
          <InfoRow label="年数" value={emperor.reignYears ? `${emperor.reignYears} 年` : '不足一年'} />
          <InfoRow label="谥号" value={emperor.posthumousName || '未载'} />
        </div>
      </section>

      {/* 世系路径 */}
      {ancestors.length ? (
        <section className="mt-6">
          <h2 className="mb-3 font-serif text-lg font-semibold">世系源流</h2>
          <div className="surface flex flex-wrap items-center gap-2 p-4 text-sm">
            {ancestors.map((nodeId) => {
              const node = resolveNode(nodeId);
              return (
                <span key={nodeId} className="flex items-center gap-2">
                  <Link
                    href={node.href ?? '#'}
                    className="rounded-md border border-ink/10 px-2 py-1 transition-colors hover:border-vermilion/50 hover:text-vermilion dark:border-white/15"
                  >
                    {node.label}
                  </Link>
                  <span className="text-ink-faint">→</span>
                </span>
              );
            })}
            <span className="rounded-md bg-vermilion/10 px-2 py-1 text-vermilion dark:text-vermilion-soft">
              {emperor.templeName}
            </span>
          </div>
        </section>
      ) : null}

      {/* 亲属与继统 */}
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="surface p-5">
          <h2 className="font-serif text-lg font-semibold">亲属关系</h2>
          <div className="mt-3">
            <p className="label-key mb-1.5">父辈</p>
            {parents.length ? (
              <div className="flex flex-wrap gap-2">
                {parents.map((node) => (
                  <Link
                    key={node.id}
                    href={node.href ?? '#'}
                    className="chip transition-colors hover:border-vermilion/50 hover:text-vermilion"
                  >
                    {node.label} · {node.caption}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-faint dark:text-white/45">原表未载</p>
            )}
          </div>

          {siblings.length ? (
            <div className="mt-4">
              <p className="label-key mb-1.5">兄弟（{emperor.templeName}之同父诸子）</p>
              <div className="flex flex-wrap gap-2">
                {siblings.map((prince) => (
                  <span key={prince.id} className="chip">
                    {prince.name || prince.title}
                    {prince.title ? ` · ${prince.title}` : ''}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-4">
            <p className="label-key mb-1.5">继统</p>
            <div className="space-y-1.5 text-sm">
              {prev.map((rel) => {
                const node = resolveNode(rel.source);
                return (
                  <p key={rel.id}>
                    <span className="text-ink-faint dark:text-white/45">前任：</span>
                    <Link href={node.href ?? '#'} className="hover:text-vermilion">
                      {node.label}
                    </Link>
                    <span className="ml-2 text-xs text-ink-faint dark:text-white/45">
                      {RELATION_LABEL[rel.type]} · {rel.label}
                    </span>
                  </p>
                );
              })}
              {next.map((rel) => {
                const node = resolveNode(rel.target);
                return (
                  <p key={rel.id}>
                    <span className="text-ink-faint dark:text-white/45">继任：</span>
                    <Link href={node.href ?? '#'} className="hover:text-vermilion">
                      {node.label}
                    </Link>
                    <span className="ml-2 text-xs text-ink-faint dark:text-white/45">
                      {RELATION_LABEL[rel.type]} · {rel.label}
                    </span>
                  </p>
                );
              })}
              {!prev.length && !next.length ? (
                <p className="text-sm text-ink-faint dark:text-white/45">原表未载</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="surface p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-lg font-semibold">皇子支系</h2>
            <span className="text-xs text-ink-faint dark:text-white/45">
              {children.length} 位 · 后代 {descendants} 人
            </span>
          </div>
          {children.length ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {children.map((prince) => (
                <div
                  key={prince.id}
                  className="rounded-lg border border-ink/10 px-3 py-2 text-sm dark:border-white/10"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-serif">{prince.name || '（未命名）'}</span>
                    <span className="text-xs text-ink-faint dark:text-white/45">{prince.orderLabel}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-soft dark:text-white/55">
                    {prince.title ?? ''}
                    {prince.note ? ` · ${prince.note}` : ''}
                    {prince.isEmperor ? ' · 后即位' : ''}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-ink-faint dark:text-white/45">原表记载无子或未载子嗣</p>
          )}
        </div>
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/graph/?focus=${emperor.id}`}
          className="inline-flex items-center gap-2 rounded-full bg-vermilion px-4 py-2 text-sm text-paper-soft transition-transform hover:-translate-y-0.5 hover:bg-vermilion-light"
        >
          <Network className="h-4 w-4" />
          在关系图谱中定位
        </Link>
        <Link
          href="/officials/"
          className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-4 py-2 text-sm text-ink-soft transition-colors hover:border-gold dark:border-white/20 dark:text-white/70"
        >
          查阅同期官职
        </Link>
      </div>
    </div>
  );
}
