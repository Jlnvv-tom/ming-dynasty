/** 与 G6 数据结构兼容的最小类型定义 */

export interface G6Node {
  id: string;
  data: Record<string, unknown>;
  [key: string]: unknown;
}

export interface G6Edge {
  id: string;
  source: string;
  target: string;
  data: Record<string, unknown>;
  [key: string]: unknown;
}

export interface G6GraphData {
  nodes: G6Node[];
  edges: G6Edge[];
}

/** 各层可用的布局 */
export type LayoutType = 'dagre-lr' | 'dagre-tb' | 'bubble' | 'force' | 'grid';

/** 图谱页的层级状态 */
export type GraphLayer =
  | 'lineage-index'
  | 'lineage-period'
  | 'post-index'
  | 'post-system'
  | 'post-org';

/** 节点角色，用于配色与图例 */
export type NodeRole =
  | 'emperor'
  | 'prince'
  | 'period'
  | 'system'
  | 'org'
  | 'rank'
  | 'post';

export const ROLE_LABEL: Record<NodeRole, string> = {
  emperor: '帝王',
  prince: '宗室',
  period: '分期',
  system: '体系',
  org: '衙门',
  rank: '品级',
  post: '官职',
};
