'use client';

import { ArrowRight } from 'lucide-react';
import type { PeriodCard, SystemCard } from '@/lib/graph';
import { TIER_STROKE } from './tones';

export function PeriodCards({ cards, onPick }: { cards: PeriodCard[]; onPick: (id: string) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ period, emperors, princeCount, relationCount }) => (
        <button
          key={period.id}
          type="button"
          onClick={() => onPick(period.id)}
          className="surface surface-hover group cursor-pointer p-5 text-left"
        >
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-serif text-lg font-semibold group-hover:text-vermilion dark:group-hover:text-vermilion-soft">
              {period.name}
            </h3>
            <span className="shrink-0 text-[11px] text-ink-faint dark:text-white/45">{period.era}</span>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-ink-soft dark:text-white/60">{period.summary}</p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {emperors.map((emperor) => (
              <span
                key={emperor.id}
                className="rounded-md bg-vermilion/10 px-2 py-0.5 text-[11px] text-vermilion dark:text-vermilion-soft"
              >
                {emperor.templeName}
              </span>
            ))}
          </div>

          <div className="gold-rule my-3" />

          <p className="text-[11px] text-ink-faint dark:text-white/45">
            {emperors.length} 帝 · {princeCount} 皇子 · {relationCount} 条关系
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-ink-faint dark:text-white/40">
            {period.events.join(' · ')}
          </p>

          <span className="mt-3 inline-flex items-center gap-1 text-xs text-vermilion opacity-0 transition-opacity group-hover:opacity-100 dark:text-vermilion-soft">
            进入该期图谱 <ArrowRight className="h-3 w-3" />
          </span>
        </button>
      ))}
    </div>
  );
}

export function SystemCards({ cards, onPick }: { cards: SystemCard[]; onPick: (system: SystemCard['system']) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const total = card.tierSpread.reduce((sum, item) => sum + item.count, 0) || 1;
        return (
          <button
            key={card.system}
            type="button"
            onClick={() => onPick(card.system)}
            className="surface surface-hover group cursor-pointer p-5 text-left"
          >
            <h3 className="font-serif text-lg font-semibold group-hover:text-vermilion dark:group-hover:vermilion-soft">
              {card.label}
            </h3>
            <p className="mt-2 text-2xl font-semibold text-vermilion dark:text-vermilion-soft">
              {card.postCount}
              <span className="ml-1 text-xs font-normal text-ink-faint dark:text-white/45">官职</span>
            </p>
            <p className="mt-0.5 text-xs text-ink-soft dark:text-white/60">{card.orgCount} 个衙门</p>

            <div className="mt-3 flex h-1.5 overflow-hidden rounded-full">
              {card.tierSpread.map((item) => (
                <span
                  key={item.tier.key}
                  style={{
                    width: `${(item.count / total) * 100}%`,
                    background: TIER_STROKE[item.tier.key],
                  }}
                  title={`${item.tier.label} ${item.count}`}
                />
              ))}
            </div>

            <div className="gold-rule my-3" />

            <ul className="space-y-1 text-[11px] text-ink-faint dark:text-white/45">
              {card.topOrgs.map((item) => (
                <li key={item.org} className="flex justify-between gap-2">
                  <span className="truncate">{item.org}</span>
                  <span>{item.count} 职</span>
                </li>
              ))}
            </ul>

            <span className="mt-3 inline-flex items-center gap-1 text-xs text-vermilion opacity-0 transition-opacity group-hover:opacity-100 dark:text-vermilion-soft">
              查看衙门分布 <ArrowRight className="h-3 w-3" />
            </span>
          </button>
        );
      })}
    </div>
  );
}
