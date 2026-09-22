import fs from 'node:fs';
import path from 'node:path';
import type { Emperor, Post, Prince, Relation } from '../src/types/index';

const ROOT = path.resolve(__dirname, '..');
const read = <T>(file: string): T =>
  JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data', file), 'utf8')) as T;

const errors: string[] = [];
const warnings: string[] = [];

const emperors = read<Emperor[]>('emperors.json');
const princes = read<Prince[]>('princes.json');
const relations = read<Relation[]>('relations.json');
const posts = read<Post[]>('posts.json');

// 1. 关系边的端点必须存在
const nodeIds = new Set<string>([
  ...emperors.map((e) => e.id),
  ...princes.map((p) => p.id),
]);
for (const rel of relations) {
  if (!nodeIds.has(rel.source)) errors.push(`关系 ${rel.id} 起点不存在：${rel.source}`);
  if (!nodeIds.has(rel.target)) errors.push(`关系 ${rel.id} 终点不存在：${rel.target}`);
}

// 2. 皇帝唯一性与在位区间
const emperorIds = new Set<string>();
for (const e of emperors) {
  if (emperorIds.has(e.id)) errors.push(`皇帝 id 重复：${e.id}`);
  emperorIds.add(e.id);
  if (!e.templeName || !e.name) errors.push(`皇帝 ${e.id} 缺少庙号或名讳`);
  if (!e.eras.length) warnings.push(`皇帝 ${e.id} 无年号`);
  for (const era of e.eras) {
    if (era.start && era.end && era.start > era.end) {
      errors.push(`${e.templeName} 年号 ${era.name} 区间倒置：${era.start}-${era.end}`);
    }
  }
}

// 3. 皇子归属
for (const p of princes) {
  if (!emperorIds.has(p.emperorId)) errors.push(`皇子 ${p.id} 归属的皇帝不存在：${p.emperorId}`);
  if (!p.name && !p.title) warnings.push(`皇子 ${p.id} 既无名讳也无封号`);
}

// 4. 官职品级合法
for (const post of posts) {
  if (post.rankSort >= 999) errors.push(`官职 ${post.id} ${post.name} 品级无法解析：${post.rankLabel}`);
  if (!post.name) errors.push(`官职 ${post.id} 缺少官职名`);
  if (!post.org) warnings.push(`官职 ${post.id} 缺少所属衙门`);
}

// 5. 秩序检查：皇帝 index 连续
const indexes = emperors.map((e) => e.index).sort((a, b) => a - b);
indexes.forEach((idx, i) => {
  if (idx !== i + 1) errors.push(`皇帝序位不连续：第 ${i + 1} 位为 ${idx}`);
});

console.log('数据校验：');
console.log(`  皇帝 ${emperors.length} / 皇子 ${princes.length} / 关系 ${relations.length} / 官职 ${posts.length}`);
if (warnings.length) {
  console.log(`\n  警告 ${warnings.length} 条：`);
  warnings.slice(0, 10).forEach((w) => console.log(`   - ${w}`));
}
if (errors.length) {
  console.log(`\n  错误 ${errors.length} 条：`);
  errors.slice(0, 20).forEach((e) => console.log(`   ✗ ${e}`));
  process.exit(1);
}
console.log('  ✓ 全部通过');
