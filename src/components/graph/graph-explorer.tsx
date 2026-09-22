'use client';

import { cn } from '@/lib/utils';
import GraphBreadcrumb from './graph-breadcrumb';
import { PeriodCards, SystemCards } from './graph-index';
import GraphSidePanel from './graph-side-panel';
import GraphStage from './graph-stage';
import GraphToolbar from './graph-toolbar';
import { useGraphState } from './use-graph-state';

export default function GraphExplorer({
  focusId,
  focusPost,
}: {
  focusId?: string;
  focusPost?: string;
}) {
  const state = useGraphState({ focusId, focusPost });

  const toolbar = (
    <GraphToolbar
      title={state.toolbarTitle}
      hint={state.toolbarHint}
      findPlaceholder={state.findPlaceholder}
      suggestions={state.suggestions}
      onFindPick={state.onFindPick}
      handleRef={state.handleRef}
      immersive={state.immersive}
      onToggleImmersive={state.onToggleImmersive}
      listMode={state.useList}
      onToggleList={state.onToggleList}
    />
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10">
      {/* 一级切换：世系 / 官制 */}
      <div className="surface flex flex-wrap items-center gap-2 p-3">
        {(
          [
            ['lineage', '帝王世系图谱', `${state.periodCards.length} 个分期 · 21 位帝王`],
            ['posts', '官职体系图谱', `${state.systemCards.reduce((sum, card) => sum + card.postCount, 0)} 官职 · ${state.systemCards.reduce((sum, card) => sum + card.orgCount, 0)} 衙门`],
          ] as const
        ).map(([key, label, hint]) => (
          <button
            key={key}
            type="button"
            onClick={() => state.setTab(key)}
            className={cn(
              'flex-1 cursor-pointer rounded-xl border px-4 py-2.5 text-left transition-colors',
              state.tab === key
                ? 'border-vermilion/50 bg-vermilion/5'
                : 'border-ink/10 hover:border-vermilion/30 dark:border-white/10',
            )}
          >
            <span className="block font-serif text-sm font-semibold">{label}</span>
            <span className="mt-0.5 block text-[11px] text-ink-faint dark:text-white/45">{hint}</span>
          </button>
        ))}
      </div>

      {!state.isIndex ? (
        <div className="surface mt-3 space-y-3 p-3">
          <GraphBreadcrumb items={state.crumbs} />
          {toolbar}
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_340px]">
        <div>
          {state.layer === 'lineage-index' ? (
            <PeriodCards cards={state.periodCards} onPick={state.openPeriod} />
          ) : null}
          {state.layer === 'post-index' ? (
            <SystemCards cards={state.systemCards} onPick={state.openSystem} />
          ) : null}
          {!state.isIndex ? (
            <GraphStage
              graph={state.graph}
              layout={state.layout}
              tone={state.tone}
              legend={state.legend}
              dark={state.dark}
              selectedId={state.activeNodeId}
              highlightIds={state.highlightIds}
              onSelect={state.onSelect}
              onDrill={state.onDrill}
              handleRef={state.handleRef}
              listGroups={state.listGroups}
              listCaption={state.listCaption}
              useList={state.useList}
              immersive={state.immersive}
              toolbar={toolbar}
            />
          ) : null}
        </div>

        {!state.isIndex ? (
          <aside className="surface h-fit p-5 lg:sticky lg:top-24">
            <GraphSidePanel {...state.panelProps} />
          </aside>
        ) : null}
      </div>
    </div>
  );
}
