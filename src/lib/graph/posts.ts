import { posts } from '@/lib/data';
import type { Post, System } from '@/types/index';
import { SYSTEM_LABEL } from '@/types/index';
import type { G6Edge, G6GraphData, G6Node } from './types';

export interface RankTier {
  key: string;
  label: string;
  /** 归类边界：品级数值越小越尊 */
  max: number;
}

/** 品级段：用于气泡配色与图例 */
export const RANK_TIERS: RankTier[] = [
  { key: 'tier-1', label: '正从一品', max: 1 },
  { key: 'tier-2', label: '正从二品', max: 2 },
  { key: 'tier-3', label: '正从三品', max: 3 },
  { key: 'tier-4', label: '正从四品', max: 4 },
  { key: 'tier-5', label: '正从五品', max: 5 },
  { key: 'tier-6', label: '六品及以下', max: 9 },
  { key: 'tier-0', label: '超品 / 未入流', max: 0 },
];

export function rankTier(rankLevel: number): RankTier {
  if (rankLevel === 0) return RANK_TIERS[RANK_TIERS.length - 1];
  return RANK_TIERS.find((tier) => tier.max >= rankLevel) ?? RANK_TIERS[RANK_TIERS.length - 2];
}

export interface SystemCard {
  system: System;
  label: string;
  postCount: number;
  orgCount: number;
  topOrgs: { org: string; count: number }[];
  tierSpread: { tier: RankTier; count: number }[];
}

export function listSystems(): SystemCard[] {
  return (Object.keys(SYSTEM_LABEL) as System[]).map((system) => {
    const scoped = posts.filter((post) => post.system === system);
    const orgCount = new Map<string, number>();
    const tierCount = new Map<string, number>();
    for (const post of scoped) {
      orgCount.set(post.org, (orgCount.get(post.org) ?? 0) + 1);
      const tier = rankTier(post.rankLevel);
      tierCount.set(tier.key, (tierCount.get(tier.key) ?? 0) + 1);
    }
    return {
      system,
      label: SYSTEM_LABEL[system],
      postCount: scoped.length,
      orgCount: orgCount.size,
      topOrgs: Array.from(orgCount, ([org, count]) => ({ org, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3),
      tierSpread: RANK_TIERS.filter((tier) => tierCount.has(tier.key)).map((tier) => ({
        tier,
        count: tierCount.get(tier.key) ?? 0,
      })),
    };
  });
}

export interface OrgSummary {
  org: string;
  count: number;
  /** 最高品级（sort 最小者） */
  topRank: string;
  topRankLevel: number;
  tier: RankTier;
  samples: string[];
}

/** 某体系下的衙门概览，用于气泡图与列表降级 */
export function listOrgs(system: System): OrgSummary[] {
  const grouped = new Map<string, Post[]>();
  for (const post of posts) {
    if (post.system !== system) continue;
    const list = grouped.get(post.org) ?? [];
    list.push(post);
    grouped.set(post.org, list);
  }
  return Array.from(grouped, ([org, list]) => {
    const sorted = [...list].sort((a, b) => a.rankSort - b.rankSort);
    const top = sorted[0];
    return {
      org,
      count: list.length,
      topRank: top?.rankLabel ?? '—',
      topRankLevel: top?.rankLevel ?? 0,
      tier: rankTier(top?.rankLevel ?? 0),
      samples: sorted.slice(0, 3).map((post) => post.name),
    };
  }).sort((a, b) => b.count - a.count || a.org.localeCompare(b.org, 'zh'));
}

/** 衙门气泡图：每个气泡一个衙门，尺寸按官职数，颜色按最高品级段 */
export function buildOrgBubbleGraph(system: System): G6GraphData {
  const orgs = listOrgs(system);
  const max = Math.max(...orgs.map((item) => item.count), 1);
  const nodes: G6Node[] = orgs.map((item) => ({
    id: `org-${item.org}`,
    data: {
      role: 'org',
      label: item.org,
      sub: `${item.count} 职`,
      caption: `最高 ${item.topRank} · ${item.samples.join('、')}`,
      org: item.org,
      count: item.count,
      tier: item.tier.key,
      tierLabel: item.tier.label,
      size: 46 + Math.round((item.count / max) * 46),
    },
  }));
  return { nodes, edges: [] };
}

/** 单衙门官职图：衙门 → 品级 → 官职（三级阶梯） */
export function buildOrgPostGraph(org: string): G6GraphData {
  const scoped = posts.filter((post) => post.org === org);
  if (!scoped.length) return { nodes: [], edges: [] };

  const nodes: G6Node[] = [
    {
      id: `org-${org}`,
      data: {
        role: 'org',
        label: org,
        sub: `${scoped.length} 职`,
        caption: scoped[0]?.system ? SYSTEM_LABEL[scoped[0].system] : '',
        org,
      },
    },
  ];
  const edges: G6Edge[] = [];

  const byRank = new Map<string, Post[]>();
  for (const post of scoped) {
    const list = byRank.get(post.rankLabel) ?? [];
    list.push(post);
    byRank.set(post.rankLabel, list);
  }

  const groups = Array.from(byRank, ([rankLabel, list]) => ({
    rankLabel,
    rankSort: list[0]?.rankSort ?? 999,
    list: [...list].sort((a, b) => a.name.localeCompare(b.name, 'zh')),
  })).sort((a, b) => a.rankSort - b.rankSort);

  for (const group of groups) {
    const rankId = `rank-${org}-${group.rankLabel}`;
    nodes.push({
      id: rankId,
      data: {
        role: 'rank',
        label: group.rankLabel,
        sub: `${group.list.length} 职`,
        caption: '',
        tier: rankTier(group.list[0]?.rankLevel ?? 0).key,
      },
    });
    edges.push({
      id: `e-${rankId}`,
      source: `org-${org}`,
      target: rankId,
      data: { type: 'belongs', label: '' },
    });
    for (const post of group.list) {
      nodes.push({
        id: post.id,
        data: {
          role: 'post',
          label: post.name,
          sub: post.headcount ?? post.rankLabel,
          caption: post.duty ?? post.office,
          postId: post.id,
          org: post.org,
          rankLabel: post.rankLabel,
        },
      });
      edges.push({
        id: `e-${post.id}`,
        source: rankId,
        target: post.id,
        data: { type: 'belongs', label: '' },
      });
    }
  }

  return { nodes, edges };
}

export interface PostOption {
  id: string;
  org: string;
  system: System;
  label: string;
  keywords: string;
}

/** 搜索建议：全部官职 */
export function listPostOptions(): PostOption[] {
  return posts.map((post) => ({
    id: post.id,
    org: post.org,
    system: post.system,
    label: `${post.name}（${post.rankLabel} · ${post.org}）`,
    keywords: `${post.name}${post.rankLabel}${post.org}${post.office}`,
  }));
}
