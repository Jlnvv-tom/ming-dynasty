import emperorsData from '@/data/emperors.json';
import institutionsData from '@/data/institutions.json';
import metaData from '@/data/meta.json';
import postsData from '@/data/posts.json';
import princesData from '@/data/princes.json';
import ranksData from '@/data/ranks.json';
import relationsData from '@/data/relations.json';
import type {
  DatasetMeta,
  Emperor,
  Institutions,
  Post,
  Prince,
  Rank,
  Relation,
} from '@/types/index';

export const emperors = emperorsData as unknown as Emperor[];
export const princes = princesData as unknown as Prince[];
export const relations = relationsData as unknown as Relation[];
export const posts = postsData as unknown as Post[];
export const ranks = ranksData as unknown as Rank[];
export const institutions = institutionsData as unknown as Institutions;
export const meta = metaData as unknown as DatasetMeta;

/* ---------------------------------- 帝王 ---------------------------------- */

export function getEmperors(branch?: Emperor['branch']): Emperor[] {
  const list = branch ? emperors.filter((e) => e.branch === branch) : emperors;
  return [...list].sort((a, b) => a.index - b.index);
}

export function getEmperor(id: string): Emperor | undefined {
  return emperors.find((e) => e.id === id);
}

export function getPrinces(emperorId: string): Prince[] {
  return princes
    .filter((p) => p.emperorId === emperorId)
    .sort((a, b) => a.order - b.order);
}

/** 某位皇帝在世系中的父节点与子节点（父子关系） */
export function getFamilyLinks(id: string) {
  const parents = relations
    .filter((r) => r.type === 'father_son' && r.target === id)
    .map((r) => resolveNode(r.source));
  const children = relations
    .filter((r) => r.type === 'father_son' && r.source === id)
    .map((r) => resolveNode(r.target));
  return { parents, children };
}

/** 继统链上的前任与继任 */
export function getSuccessionLinks(id: string) {
  const prev = relations.filter((r) => r.type !== 'father_son' && r.target === id);
  const next = relations.filter((r) => r.type !== 'father_son' && r.source === id);
  return { prev, next };
}

export interface GraphNodeRef {
  id: string;
  label: string;
  caption: string;
  kind: 'emperor' | 'prince';
  href?: string;
}

/** 把关系端点解析为可展示的节点（皇帝或皇子） */
export function resolveNode(id: string): GraphNodeRef {
  const emperor = getEmperor(id);
  if (emperor) {
    return {
      id: emperor.id,
      label: emperor.templeName,
      caption: `${emperor.name} · ${emperor.eras.map((e) => e.name).join('、')}`,
      kind: 'emperor',
      href: `/emperors/${emperor.id}/`,
    };
  }
  const prince = princes.find((p) => p.id === id);
  if (prince) {
    return {
      id: prince.id,
      label: prince.name || prince.title || prince.orderLabel,
      caption: `${prince.emperorName}之${prince.orderLabel}${prince.title ? ` · ${prince.title}` : ''}`,
      kind: 'prince',
      href: `/emperors/${prince.emperorId}/`,
    };
  }
  return { id, label: id, caption: '', kind: 'prince' };
}

/* ---------------------------------- 官职 ---------------------------------- */

export function getPost(id: string): Post | undefined {
  return posts.find((p) => p.id === id);
}

export function getOrgs(system?: Post['system']): { org: string; system: Post['system']; count: number }[] {
  const filtered = system ? posts.filter((p) => p.system === system) : posts;
  const map = new Map<string, { org: string; system: Post['system']; count: number }>();
  for (const post of filtered) {
    const hit = map.get(post.org);
    if (hit) hit.count += 1;
    else map.set(post.org, { org: post.org, system: post.system, count: 1 });
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

export function getPostsByRank(rankLabel: string): Post[] {
  return posts.filter((p) => p.rankLabel === rankLabel);
}

/** 与某官职同衙门的其他官职 */
export function getSiblingPosts(post: Post, limit = 8): Post[] {
  return posts.filter((p) => p.org === post.org && p.id !== post.id).slice(0, limit);
}

/** 品级相同的其他官职 */
export function getPeersByRank(post: Post, limit = 8): Post[] {
  return posts.filter((p) => p.rankLabel === post.rankLabel && p.id !== post.id).slice(0, limit);
}

export function getRank(label: string): Rank | undefined {
  return ranks.find((r) => r.label === label);
}

/* --------------------------------- 统计 --------------------------------- */

export function getStats() {
  const ming = emperors.filter((e) => e.branch === 'ming');
  const years = ming.reduce((sum, e) => sum + (e.reignYears ?? 0), 0);
  return {
    emperors: emperors.length,
    mingEmperors: ming.length,
    nanmingEmperors: emperors.length - ming.length,
    princes: princes.length,
    posts: posts.length,
    relations: relations.length,
    ranks: ranks.length,
    orgs: getOrgs().length,
    reignYears: years,
  };
}
