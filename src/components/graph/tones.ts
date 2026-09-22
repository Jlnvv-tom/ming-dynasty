import { RANK_TIERS } from '@/lib/graph';
import type { NodeTone } from './g6-canvas';

/** 品级段描边色，气泡图与图例共用 */
export const TIER_STROKE: Record<string, string> = {
  'tier-1': '#9E2B25',
  'tier-2': '#B4553F',
  'tier-3': '#C8A45C',
  'tier-4': '#2F7D5B',
  'tier-5': '#2E4A62',
  'tier-6': '#8C8375',
  'tier-0': '#A8BCCC',
};

export interface LegendItem {
  label: string;
  color: string;
  shape: 'rect' | 'circle';
  dashed?: boolean;
}

export interface ToneSet {
  lineage: (node: Record<string, unknown>) => NodeTone;
  bubble: (node: Record<string, unknown>) => NodeTone;
  ladder: (node: Record<string, unknown>) => NodeTone;
}

export function createTones(dark: boolean): ToneSet {
  const ink = dark ? '#EDE6D8' : '#1C1A17';
  const paperFill = dark ? '#1F2A34' : '#FBF7EE';

  const lineage = (node: Record<string, unknown>): NodeTone => {
    if (node.aggregate) {
      return {
        shape: 'rect',
        fill: dark ? '#2A3440' : '#EFE9DA',
        stroke: '#C8A45C',
        labelFill: ink,
        size: [104, 40],
        dashed: true,
      };
    }
    if (node.role === 'prince') {
      return {
        shape: 'rect',
        fill: dark ? '#1A232C' : '#F1E8D6',
        stroke: dark ? '#3E6B9E' : '#2E4A62',
        labelFill: ink,
        size: [96, 40],
      };
    }
    if (node.branch === 'nanming') {
      return {
        shape: 'rect',
        fill: dark ? '#2A2124' : '#F7E4DF',
        stroke: dark ? '#C1443C' : '#9E2B25',
        labelFill: ink,
        size: [104, 46],
        dashed: Boolean(node.bridge),
      };
    }
    return {
      shape: 'rect',
      fill: paperFill,
      stroke: dark ? '#C8A45C' : '#9E2B25',
      labelFill: ink,
      size: [104, 46],
      dashed: Boolean(node.bridge),
    };
  };

  const bubble = (node: Record<string, unknown>): NodeTone => {
    const stroke = TIER_STROKE[String(node.tier ?? 'tier-6')] ?? '#8C8375';
    return {
      shape: 'circle',
      fill: dark ? '#1F2A34' : '#FBF7EE',
      stroke,
      labelFill: ink,
      size: Number(node.size ?? 56),
      labelPlacement: 'bottom',
    };
  };

  const ladder = (node: Record<string, unknown>): NodeTone => {
    if (node.role === 'org') {
      return {
        shape: 'rect',
        fill: dark ? '#232F22' : '#EEF3EA',
        stroke: '#2F7D5B',
        labelFill: ink,
        size: [128, 46],
      };
    }
    if (node.role === 'rank') {
      return {
        shape: 'rect',
        fill: dark ? '#2B2430' : '#F7F1F8',
        stroke: '#C8A45C',
        labelFill: ink,
        size: [104, 40],
      };
    }
    return {
      shape: 'rect',
      fill: paperFill,
      stroke: dark ? '#3E6B9E' : '#2E4A62',
      labelFill: ink,
      size: [124, 40],
    };
  };

  return { lineage, bubble, ladder };
}

export const LINEAGE_LEGEND: LegendItem[] = [
  { label: '大明帝王', color: '#9E2B25', shape: 'rect' },
  { label: '南明帝王', color: '#C1443C', shape: 'rect' },
  { label: '宗室藩王', color: '#2E4A62', shape: 'rect' },
  { label: '跨期衔接', color: '#C8A45C', shape: 'rect', dashed: true },
  { label: '子嗣聚合', color: '#C8A45C', shape: 'rect', dashed: true },
];

export const LADDER_LEGEND: LegendItem[] = [
  { label: '衙门', color: '#2F7D5B', shape: 'rect' },
  { label: '品级', color: '#C8A45C', shape: 'rect' },
  { label: '官职', color: '#2E4A62', shape: 'rect' },
];

/** 气泡图图例：按最高品级段配色 */
export const BUBBLE_LEGEND: LegendItem[] = RANK_TIERS.map((tier) => ({
  label: tier.label,
  color: TIER_STROKE[tier.key] ?? '#8C8375',
  shape: 'circle' as const,
}));
