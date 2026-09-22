'use client';

import { getEmperor } from '@/lib/data';
import type { GraphLayer } from '@/lib/graph';
import { EmperorPanel, OrgPanel, PostPanel, PrincePanel } from './graph-panels';

export interface GraphSidePanelProps {
  layer: GraphLayer;
  periodId: string | null;
  selected: string | null;
  expanded: boolean;
  onToggleExpand: () => void;
  onSwitchPeriod: (periodId: string, emperorId: string) => void;
  org: string | null;
  selectedPost: string | null;
  onSelectPost: (id: string) => void;
}

const HINT = 'text-sm text-ink-faint dark:text-white/45';

export default function GraphSidePanel({
  layer,
  periodId,
  selected,
  expanded,
  onToggleExpand,
  onSwitchPeriod,
  org,
  selectedPost,
  onSelectPost,
}: GraphSidePanelProps) {
  if (layer === 'lineage-period') {
    if (!selected) {
      return (
        <p className={HINT}>
          点击图中节点查看帝王档案；点开「展开皇子」可把该帝子嗣加进图中，超过 12 位时会先折叠为聚合节点。
        </p>
      );
    }
    return getEmperor(selected) ? (
      <EmperorPanel
        emperorId={selected}
        currentPeriodId={periodId ?? ''}
        expanded={expanded}
        onToggleExpand={onToggleExpand}
        onSwitchPeriod={onSwitchPeriod}
      />
    ) : (
      <PrincePanel nodeId={selected} />
    );
  }

  if (layer === 'post-system') {
    return (
      <p className={HINT}>
        气泡大小代表该衙门的官职数量，描边颜色代表其最高品级。单击气泡查看概览，双击进入该衙门的官职阶梯。
      </p>
    );
  }

  if (layer === 'post-org') {
    if (!org) return null;
    if (selectedPost) {
      return (
        <div className="space-y-4">
          <PostPanel postId={selectedPost} />
          <button
            type="button"
            onClick={() => onSelectPost('')}
            className="text-xs text-ink-faint transition-colors hover:text-vermilion"
          >
            ← 返回衙门概览
          </button>
        </div>
      );
    }
    return <OrgPanel org={org} onSelectPost={onSelectPost} />;
  }

  return null;
}
