'use client';

import type { Graph } from '@antv/g6';
import { useEffect, useMemo, useRef } from 'react';
import type { G6GraphData, LayoutType } from '@/lib/graph';

export interface NodeTone {
  shape: 'rect' | 'circle';
  fill: string;
  stroke: string;
  labelFill: string;
  size: number | [number, number];
  /** 圆形的标签置于下方，避免压在节点上 */
  labelPlacement?: 'center' | 'bottom';
  /** 虚线描边，用于跨期衔接与聚合节点 */
  dashed?: boolean;
}

export interface G6CanvasHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  fit: () => void;
  reset: () => void;
  focus: (id: string) => void;
}

export interface G6CanvasProps {
  data: G6GraphData;
  layout: LayoutType;
  dark: boolean;
  tone: (node: Record<string, unknown>) => NodeTone;
  highlightIds?: string[];
  selectedId?: string | null;
  className?: string;
  onSelect?: (id: string) => void;
  onDrill?: (id: string) => void;
  handleRef?: React.MutableRefObject<G6CanvasHandle | null>;
}

function buildLayout(type: LayoutType) {
  switch (type) {
    case 'dagre-tb':
      return { type: 'antv-dagre', rankdir: 'TB', nodesep: 22, ranksep: 78 };
    case 'bubble':
      return {
        type: 'd3-force',
        manyBody: { strength: -380 },
        collide: { radius: 74, strength: 1 },
        alphaDecay: 0.03,
      };
    case 'force':
      return { type: 'd3-force', link: { distance: 140, strength: 0.4 }, collide: { radius: 62 } };
    case 'grid':
      return { type: 'grid', preventOverlap: true };
    case 'dagre-lr':
    default:
      return { type: 'antv-dagre', rankdir: 'LR', nodesep: 18, ranksep: 110 };
  }
}

export default function G6Canvas({
  data,
  layout,
  dark,
  tone,
  highlightIds,
  selectedId,
  className,
  onSelect,
  onDrill,
  handleRef,
}: G6CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const applyBaseRef = useRef<(() => void) | null>(null);
  const handlers = useRef({ onSelect, onDrill });
  handlers.current = { onSelect, onDrill };

  const adjacency = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const edge of data.edges) {
      const from = map.get(edge.source) ?? new Set<string>();
      from.add(edge.target);
      map.set(edge.source, from);
      const to = map.get(edge.target) ?? new Set<string>();
      to.add(edge.source);
      map.set(edge.target, to);
    }
    return map;
  }, [data.edges]);

  useEffect(() => {
    let disposed = false;
    let instance: Graph | null = null;

    const mount = async () => {
      if (!containerRef.current) return;
      const { Graph: G6Graph } = await import('@antv/g6');
      if (disposed) return;

      const edgeStroke = dark ? 'rgba(237,230,216,0.32)' : 'rgba(28,26,23,0.24)';
      const edgeLabelFill = dark ? 'rgba(237,230,216,0.6)' : '#8C8375';

      instance = new G6Graph({
        container: containerRef.current,
        data,
        autoFit: 'view',
        animation: false,
        padding: 32,
        layout: buildLayout(layout),
        node: {
          type: (d: Record<string, unknown>) => tone(d.data as Record<string, unknown>).shape,
          style: {
            size: (d: Record<string, unknown>) => tone(d.data as Record<string, unknown>).size,
            radius: 10,
            fill: (d: Record<string, unknown>) => tone(d.data as Record<string, unknown>).fill,
            stroke: (d: Record<string, unknown>) => tone(d.data as Record<string, unknown>).stroke,
            lineDash: (d: Record<string, unknown>) =>
              tone(d.data as Record<string, unknown>).dashed ? [5, 4] : undefined,
            lineWidth: 1.5,
            labelText: (d: Record<string, unknown>) => {
              const node = d.data as Record<string, unknown>;
              return node.sub ? `${node.label}\n${node.sub}` : String(node.label ?? '');
            },
            labelFill: (d: Record<string, unknown>) => tone(d.data as Record<string, unknown>).labelFill,
            labelFontSize: 12,
            labelLineHeight: 16,
            labelPlacement: (d: Record<string, unknown>) =>
              tone(d.data as Record<string, unknown>).labelPlacement ?? 'center',
            labelTextAlign: 'center',
            labelWordWrap: false,
            cursor: 'pointer',
          },
          state: {
            highlight: {
              lineWidth: 3,
              stroke: dark ? '#C8A45C' : '#9E2B25',
              shadowColor: dark ? 'rgba(200,164,92,0.5)' : 'rgba(158,43,37,0.35)',
              shadowBlur: 14,
            },
            dim: { opacity: 0.22 },
            selected: { lineWidth: 3, stroke: dark ? '#EDE6D8' : '#1C1A17' },
          },
        },
        edge: {
          style: {
            stroke: edgeStroke,
            lineWidth: 1,
            endArrow: true,
            endArrowSize: 6,
            labelText: (d: Record<string, unknown>) =>
              String((d.data as Record<string, unknown>)?.label ?? ''),
            labelFontSize: 10,
            labelFill: edgeLabelFill,
            labelBackground: true,
            labelBackgroundFill: dark ? '#1A232C' : '#FBF7EE',
            labelBackgroundFillOpacity: 0.88,
            labelBackgroundRadius: 3,
            labelPlacement: 'center',
          },
          state: {
            highlight: { stroke: dark ? '#C8A45C' : '#9E2B25', lineWidth: 2.5 },
            dim: { opacity: 0.12 },
          },
        },
        behaviors: ['zoom-canvas', 'drag-canvas', 'drag-element'],
      });

      await instance.render();
      if (disposed) {
        instance.destroy();
        return;
      }
      graphRef.current = instance;

      const applyBase = () => {
        if (!instance) return;
        const pinned = new Set(highlightIds ?? []);
        for (const node of data.nodes) {
          if (pinned.size) {
            instance.setElementState(node.id, pinned.has(node.id) ? ['highlight'] : ['dim']);
          } else {
            instance.setElementState(node.id, node.id === selectedId ? ['selected'] : []);
          }
        }
        for (const edge of data.edges) {
          const active = pinned.has(edge.source) && pinned.has(edge.target);
          instance.setElementState(edge.id, pinned.size ? (active ? ['highlight'] : ['dim']) : []);
        }
      };
      applyBaseRef.current = applyBase;
      applyBase();

      instance.on('node:click', (event) => {
        const id = (event as unknown as { target?: { id?: string } }).target?.id;
        if (id) handlers.current.onSelect?.(id);
      });
      instance.on('node:dblclick', (event) => {
        const id = (event as unknown as { target?: { id?: string } }).target?.id;
        if (id) handlers.current.onDrill?.(id);
      });
      instance.on('node:pointerenter', (event) => {
        const id = (event as unknown as { target?: { id?: string } }).target?.id;
        if (!id || !instance) return;
        const focus = new Set([id, ...(adjacency.get(id) ?? [])]);
        for (const node of data.nodes) {
          instance.setElementState(node.id, focus.has(node.id) ? ['highlight'] : ['dim']);
        }
        for (const edge of data.edges) {
          const active = edge.source === id || edge.target === id;
          instance.setElementState(edge.id, active ? ['highlight'] : ['dim']);
        }
      });
      instance.on('node:pointerleave', () => applyBaseRef.current?.());

      if (handleRef) {
        handleRef.current = {
          zoomIn: () => instance?.zoomTo(1.25, false),
          zoomOut: () => instance?.zoomTo(0.8, false),
          fit: () => instance?.fitView(),
          reset: () => {
            instance?.fitView();
          },
          focus: (id: string) => instance?.focusElement(id, false),
        };
      }
    };

    void mount();

    return () => {
      disposed = true;
      applyBaseRef.current = null;
      if (handleRef) handleRef.current = null;
      graphRef.current?.destroy();
      graphRef.current = null;
    };
  }, [adjacency, dark, data, handleRef, highlightIds, layout, selectedId, tone]);

  useEffect(() => {
    applyBaseRef.current?.();
  }, [highlightIds, selectedId]);

  return (
    <div
      className={
        className ??
        'h-[560px] w-full overflow-hidden rounded-2xl border border-gold/25 bg-paper-soft/60 dark:border-white/10 dark:bg-night-soft/60'
      }
    >
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
