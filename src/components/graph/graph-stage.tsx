'use client';

import type { ReactNode } from 'react';
import type { G6GraphData, LayoutType } from '@/lib/graph';
import { cn } from '@/lib/utils';
import G6Canvas, { type G6CanvasHandle, type NodeTone } from './g6-canvas';
import GraphLegend from './graph-legend';
import GraphListFallback, { type ListGroup } from './graph-list-fallback';
import type { LegendItem } from './tones';

interface Props {
  graph: G6GraphData | null;
  layout: LayoutType;
  tone: (node: Record<string, unknown>) => NodeTone;
  legend: LegendItem[];
  dark: boolean;
  selectedId: string | null;
  highlightIds?: string[];
  onSelect: (id: string) => void;
  onDrill: (id: string) => void;
  handleRef: React.MutableRefObject<G6CanvasHandle | null>;
  listGroups: ListGroup[];
  listCaption: string;
  useList: boolean;
  immersive: boolean;
  /** 由外层构造的工具栏，避免重复传参 */
  toolbar: ReactNode;
}

export default function GraphStage({
  graph,
  layout,
  tone,
  legend,
  dark,
  selectedId,
  highlightIds,
  onSelect,
  onDrill,
  handleRef,
  listGroups,
  listCaption,
  useList,
  immersive,
  toolbar,
}: Props) {
  if (!graph) {
    return (
      <div className="surface flex h-[280px] items-center justify-center text-sm text-ink-faint dark:text-white/45">
        当前层级暂无数据
      </div>
    );
  }

  const canvas = useList ? (
    <GraphListFallback groups={listGroups} onPick={onSelect} caption={listCaption} />
  ) : (
    <G6Canvas
      data={graph}
      layout={layout}
      dark={dark}
      tone={tone}
      highlightIds={highlightIds}
      selectedId={selectedId}
      handleRef={handleRef}
      onSelect={onSelect}
      onDrill={onDrill}
      className={cn(
        'w-full overflow-hidden rounded-2xl border border-gold/25 bg-paper-soft/60 dark:border-white/10 dark:bg-night-soft/60',
        immersive ? 'h-full' : 'h-[560px]',
      )}
    />
  );

  if (immersive && !useList) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col gap-3 bg-paper p-4 dark:bg-night">
        {toolbar}
        <div className="min-h-0 flex-1">{canvas}</div>
      </div>
    );
  }

  return (
    <>
      {!useList ? (
        <div className="mt-3">
          <GraphLegend items={legend} />
        </div>
      ) : null}
      {canvas}
    </>
  );
}
