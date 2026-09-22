import { relations } from '@/lib/data';

/** 父子关系映射：子 → 父（每子只取第一个父） */
export function buildParentMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const rel of relations) {
    if (rel.type !== 'father_son') continue;
    if (!map.has(rel.target)) map.set(rel.target, rel.source);
  }
  return map;
}

/** 父子关系映射：父 → 子[] */
export function buildChildMap(): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const rel of relations) {
    if (rel.type !== 'father_son') continue;
    const list = map.get(rel.source) ?? [];
    list.push(rel.target);
    map.set(rel.source, list);
  }
  return map;
}

/** 沿父子链向上追溯祖先（不含自身） */
export function getAncestorPath(id: string): string[] {
  const parentMap = buildParentMap();
  const path: string[] = [];
  let cursor: string | undefined = id;
  const guard = new Set<string>();
  while (cursor && !guard.has(cursor)) {
    guard.add(cursor);
    const parent: string | undefined = parentMap.get(cursor);
    if (!parent) break;
    path.push(parent);
    cursor = parent;
  }
  return path;
}

/** 向下收集全部子孙 */
export function getDescendants(id: string): string[] {
  const childMap = buildChildMap();
  const result: string[] = [];
  const seen = new Set([id]);
  const queue = [id];
  while (queue.length) {
    const current = queue.shift() as string;
    for (const child of childMap.get(current) ?? []) {
      if (seen.has(child)) continue;
      seen.add(child);
      result.push(child);
      queue.push(child);
    }
  }
  return result;
}
