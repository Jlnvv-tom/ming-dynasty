import { emperors, getEmperor, getPrinces, relations, resolveNode } from '@/lib/data';
import { getPeriodById, PERIODS, periodEmperors, type Period } from './periods';
import type { G6Edge, G6GraphData, G6Node } from './types';

const MAX_PRINCES_PER_EMPEROR = 12;

export interface PeriodCard {
  period: Period;
  emperors: { id: string; templeName: string; name: string; era: string; reign: string }[];
  princeCount: number;
  relationCount: number;
}

/** 分期入口卡所需数据 */
export function listPeriods(): PeriodCard[] {
  return PERIODS.map((period) => {
    const list = periodEmperors(period);
    const princeCount = list.reduce((sum, emperor) => sum + getPrinces(emperor.id).length, 0);
    const idSet = new Set(period.emperorIds);
    const relationCount = relations.filter(
      (rel) => idSet.has(rel.source) && idSet.has(rel.target),
    ).length;
    return {
      period,
      emperors: list.map((emperor) => ({
        id: emperor.id,
        templeName: emperor.templeName,
        name: emperor.name,
        era: emperor.eras.map((e) => e.name).join('、'),
        reign: emperor.reignText,
      })),
      princeCount,
      relationCount,
    };
  });
}

export interface PeriodGraphOptions {
  periodId: string;
  /** 已展开子嗣的帝王 */
  expandedEmperorIds?: string[];
  /** 全量展开（不再折叠为聚合节点）的帝王 */
  fullExpandIds?: string[];
}

/**
 * 构建单期世系图：
 * 本期帝王 + 上下游衔接帝（跨期，虚线）+ 必要的宗室父辈 + 按需展开的子嗣
 */
export function buildPeriodGraph({
  periodId,
  expandedEmperorIds = [],
  fullExpandIds = [],
}: PeriodGraphOptions): G6GraphData {
  const period = getPeriodById(periodId);
  if (!period) return { nodes: [], edges: [] };

  const nodes = new Map<string, G6Node>();
  const addEmperor = (id: string, bridge?: 'before' | 'after') => {
    const emperor = getEmperor(id);
    if (!emperor || nodes.has(id)) return;
    nodes.set(id, {
      id,
      data: {
        role: 'emperor',
        label: emperor.templeName,
        sub: emperor.eras.map((e) => e.name).join('、'),
        caption: `${emperor.name} · ${emperor.reignText}`,
        branch: emperor.branch,
        bridge,
        href: `/emperors/${id}/`,
      },
    });
  };

  const addPrince = (id: string, parentId?: string) => {
    if (nodes.has(id)) return;
    const ref = resolveNode(id);
    if (ref.kind !== 'prince') return;
    nodes.set(id, {
      id,
      data: {
        role: 'prince',
        label: ref.label,
        sub: ref.caption,
        caption: ref.caption,
        parentId,
        href: ref.href,
      },
    });
  };

  // 1) 本期帝王
  period.emperorIds.forEach((id) => addEmperor(id));

  // 2) 上下游衔接帝（让分期之间看得见脉络）
  const first = period.emperorIds[0];
  const last = period.emperorIds[period.emperorIds.length - 1];
  for (const rel of relations) {
    if (rel.type === 'father_son') continue;
    if (rel.target === first) addEmperor(rel.source, 'before');
    if (rel.source === last) addEmperor(rel.target, 'after');
  }

  // 3) 宗室父辈：本期帝王若出自藩王，补上其父与（若为帝）祖父
  for (const id of period.emperorIds) {
    const parentRel = relations.find((rel) => rel.type === 'father_son' && rel.target === id);
    if (!parentRel) continue;
    const parentId = parentRel.source;
    if (getEmperor(parentId)) continue;
    addPrince(parentId, undefined);
    const grandRel = relations.find(
      (rel) => rel.type === 'father_son' && rel.target === parentId,
    );
    if (grandRel && getEmperor(grandRel.source)) addEmperor(grandRel.source, 'before');
  }

  // 4) 按需展开子嗣（超过上限时折叠为聚合节点）
  for (const emperorId of expandedEmperorIds) {
    const princes = getPrinces(emperorId);
    if (!princes.length) continue;
    const full = fullExpandIds.includes(emperorId);
    const visible = full ? princes : princes.slice(0, MAX_PRINCES_PER_EMPEROR);
    visible.forEach((prince) => addPrince(prince.id, emperorId));
    if (!full && princes.length > visible.length) {
      nodes.set(`agg-${emperorId}`, {
        id: `agg-${emperorId}`,
        data: {
          role: 'prince',
          aggregate: true,
          parentId: emperorId,
          label: `其余 ${princes.length - visible.length} 位`,
          sub: '点击展开',
          caption: `${getEmperor(emperorId)?.templeName ?? ''}其余子嗣`,
        },
      });
    }
  }

  // 5) 边：两端都在图内的关系
  const ids = new Set(nodes.keys());
  const edges: G6Edge[] = relations
    .filter((rel) => ids.has(rel.source) && ids.has(rel.target))
    .map((rel) => {
      const sourcePeriod = getEmperor(rel.source)
        ? PERIODS.find((p) => p.emperorIds.includes(rel.source))?.id
        : undefined;
      const targetPeriod = getEmperor(rel.target)
        ? PERIODS.find((p) => p.emperorIds.includes(rel.target))?.id
        : undefined;
      return {
        id: rel.id,
        source: rel.source,
        target: rel.target,
        data: {
          type: rel.type,
          label: rel.label ?? '',
          bridge: Boolean(sourcePeriod && targetPeriod && sourcePeriod !== targetPeriod),
        },
      };
    });

  // 聚合节点的连线（父 → 聚合）
  for (const node of nodes.values()) {
    if (!node.data.aggregate) continue;
    const parentId = String(node.data.parentId ?? '');
    if (!parentId || !ids.has(parentId)) continue;
    edges.push({
      id: `e-${node.id}`,
      source: parentId,
      target: node.id,
      data: { type: 'father_son', label: '', bridge: false },
    });
  }

  return { nodes: Array.from(nodes.values()), edges };
}

/** 帝王在其所属分期中的定位，供深链跳转使用 */
export function locateEmperor(emperorId: string) {
  const period = PERIODS.find((p) => p.emperorIds.includes(emperorId));
  if (!period) return undefined;
  return { periodId: period.id, periodName: period.name, index: period.emperorIds.indexOf(emperorId) };
}

/** 全部帝王，按分期顺序，用于搜索建议 */
export function listEmperorOptions() {
  return PERIODS.flatMap((period) =>
    period.emperorIds.map((id) => {
      const emperor = getEmperor(id);
      return {
        id,
        periodId: period.id,
        periodName: period.name,
        label: emperor ? `${emperor.templeName} ${emperor.name}` : id,
        keywords: emperor ? `${emperor.templeName}${emperor.name}${emperor.eras.map((e) => e.name).join('')}` : id,
      };
    }),
  );
}

export function totalPrinces(periodId: string): number {
  const period = getPeriodById(periodId);
  if (!period) return 0;
  return period.emperorIds.reduce((sum, id) => sum + getPrinces(id).length, 0);
}

export function isNanming(periodId: string): boolean {
  const period = getPeriodById(periodId);
  if (!period) return false;
  return period.emperorIds.some((id) => emperors.find((e) => e.id === id)?.branch === 'nanming');
}
