'use client';

import {
  buildOrgBubbleGraph,
  buildOrgPostGraph,
  buildPeriodGraph,
  getAncestorPath,
  getDescendants,
  listEmperorOptions,
  listOrgs,
  listPostOptions,
  listSystems,
  ROLE_LABEL,
  type G6GraphData,
  type GraphLayer,
  type LayoutType,
  type NodeRole,
} from '@/lib/graph';
import { SYSTEM_LABEL, type System } from '@/types/index';
import type { NodeTone } from './g6-canvas';
import type { Crumb } from './graph-breadcrumb';
import type { ListGroup } from './graph-list-fallback';
import type { FindOption } from './graph-toolbar';
import { BUBBLE_LEGEND, LADDER_LEGEND, LINEAGE_LEGEND, type LegendItem, type ToneSet } from './tones';

export type Tab = 'lineage' | 'posts';

export interface LayerInput {
  tab: Tab;
  periodId: string | null;
  system: System | null;
  org: string | null;
}

export function resolveLayer({ tab, periodId, system, org }: LayerInput): GraphLayer {
  if (tab === 'lineage') return periodId ? 'lineage-period' : 'lineage-index';
  if (org) return 'post-org';
  return system ? 'post-system' : 'post-index';
}

export interface GraphInput {
  periodId: string | null;
  system: System | null;
  org: string | null;
  expanded: string[];
  fullExpand: string[];
}

export function buildGraphForLayer(layer: GraphLayer, input: GraphInput): G6GraphData | null {
  if (layer === 'lineage-period' && input.periodId) {
    return buildPeriodGraph({
      periodId: input.periodId,
      expandedEmperorIds: input.expanded,
      fullExpandIds: input.fullExpand,
    });
  }
  if (layer === 'post-system' && input.system) return buildOrgBubbleGraph(input.system);
  if (layer === 'post-org' && input.org) return buildOrgPostGraph(input.org);
  return null;
}

/** 官职阶梯横向排列：品级由尊至卑从左向右，同品级官职纵向堆叠 */
export function layoutForLayer(layer: GraphLayer): LayoutType {
  return layer === 'post-system' ? 'bubble' : 'dagre-lr';
}

export function legendForLayer(layer: GraphLayer): LegendItem[] {
  if (layer === 'lineage-period') return LINEAGE_LEGEND;
  if (layer === 'post-system') return BUBBLE_LEGEND;
  return LADDER_LEGEND;
}

export function toneForLayer(
  layer: GraphLayer,
  tones: ToneSet,
): (node: Record<string, unknown>) => NodeTone {
  if (layer === 'lineage-period') return tones.lineage;
  if (layer === 'post-system') return tones.bubble;
  return tones.ladder;
}

/** 当前层内与某节点直接相连的节点（含自身） */
function neighbors(graph: G6GraphData, id: string): string[] {
  const result = new Set<string>([id]);
  for (const edge of graph.edges) {
    if (edge.source === id) result.add(edge.target);
    if (edge.target === id) result.add(edge.source);
  }
  return Array.from(result);
}

/** 世系层高亮祖孙链，其余层高亮一度邻居 */
export function resolveHighlight(
  graph: G6GraphData | null,
  tab: Tab,
  activeNodeId: string | null,
): string[] | undefined {
  if (!graph || !activeNodeId) return undefined;
  const ids = new Set(graph.nodes.map((node) => node.id));
  if (tab === 'lineage') {
    const chain = [
      activeNodeId,
      ...getAncestorPath(activeNodeId),
      ...getDescendants(activeNodeId),
    ].filter((id) => ids.has(id));
    return chain.length > 1 ? chain : undefined;
  }
  return neighbors(graph, activeNodeId);
}

/** 把图数据按节点角色分组，供小屏与大图的列表视图复用 */
export function fallbackGroups(graph: G6GraphData): ListGroup[] {
  const byRole = new Map<string, { id: string; label: string; sub?: string }[]>();
  for (const node of graph.nodes) {
    const role = String(node.data.role ?? 'post');
    const list = byRole.get(role) ?? [];
    list.push({
      id: node.id,
      label: String(node.data.label ?? node.id),
      sub: [node.data.sub, node.data.caption].filter(Boolean).join(' · '),
    });
    byRole.set(role, list);
  }
  return Array.from(byRole, ([role, items]) => ({
    key: role,
    title: ROLE_LABEL[role as NodeRole] ?? role,
    items,
  }));
}

export function buildSuggestions(layer: GraphLayer, system: System | null, org: string | null): FindOption[] {
  if (layer === 'lineage-index' || layer === 'lineage-period') {
    return listEmperorOptions().map((item) => ({
      id: item.id,
      label: item.label,
      hint: item.periodName,
    }));
  }
  if (layer === 'post-system') {
    return listOrgs(system ?? 'central').map((item) => ({
      id: `org-${item.org}`,
      label: item.org,
      hint: `${item.count} 职`,
    }));
  }
  if (layer === 'post-org' && org) {
    return listPostOptions()
      .filter((item) => item.org === org)
      .map((item) => ({ id: item.id, label: item.label }));
  }
  return listSystems().map((item) => ({
    id: item.system,
    label: item.label,
    hint: `${item.postCount} 职`,
  }));
}

export function buildCrumbs(
  layer: GraphLayer,
  names: { periodName?: string; system?: System; org?: string | null },
  handlers: { toPeriodIndex: () => void; toSystemIndex: () => void; toSystem: () => void },
): Crumb[] {
  if (layer === 'lineage-index') return [{ label: '关系图谱' }];
  if (layer === 'lineage-period') {
    return [
      { label: '世系总览', onClick: handlers.toPeriodIndex },
      { label: names.periodName ?? '分期' },
    ];
  }
  const items: Crumb[] = [{ label: '官制总览', onClick: handlers.toSystemIndex }];
  if (names.system) {
    items.push({ label: SYSTEM_LABEL[names.system], onClick: handlers.toSystem });
  }
  if (names.org) items.push({ label: names.org });
  return items;
}

export function toolbarTitle(
  layer: GraphLayer,
  names: { periodName?: string; system?: System | null; org?: string | null },
): string {
  if (layer === 'lineage-period') return names.periodName ?? '分期';
  if (layer === 'lineage-index') return '世系总览';
  if (names.org) return names.org;
  return SYSTEM_LABEL[names.system ?? 'central'];
}

export function findPlaceholderFor(layer: GraphLayer): string {
  if (layer === 'post-org') return '搜索本衙门官职';
  if (layer === 'post-system') return '搜索衙门';
  if (layer === 'post-index') return '搜索体系';
  return '搜索帝王';
}

export function hintForLayer(layer: GraphLayer): string {
  if (layer === 'lineage-period') return '单击查看详情 · 双击帝王进入档案 · 虚线圈为跨期衔接';
  if (layer === 'post-system') return '气泡越大官职越多 · 单击查看概览 · 双击进入该衙门';
  return '按品级由尊至卑从左向右排列 · 单击查看职事';
}
