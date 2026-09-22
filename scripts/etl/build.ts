import fs from 'node:fs';
import path from 'node:path';
import type {
  DatasetMeta,
  Emperor,
  Institutions,
  Post,
  Prince,
  Rank,
  SearchDoc,
} from '../../src/types/index';
import { parseEmperors, parsePrinces, buildRelations } from './parse-emperors';
import { parseInstitutions } from './parse-institutions';
import { parsePosts } from './parse-posts';
import { loadSheet } from './sheet';
import { parseRank } from './util';

const ROOT = path.resolve(__dirname, '../..');
const RAW_FILE = path.join(ROOT, 'data/raw/明朝帝王世系&官职品级.xlsx');
const DATA_DIR = path.join(ROOT, 'src/data');
const PUBLIC_DIR = path.join(ROOT, 'public');

function write(file: string, payload: unknown) {
  const target = path.join(DATA_DIR, file);
  fs.writeFileSync(target, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`  ✓ src/data/${file}`);
}

function collectRanks(posts: Post[]): Rank[] {
  const map = new Map<string, Rank>();
  for (const post of posts) {
    const rank = parseRank(post.rankLabel);
    if (!map.has(rank.key)) map.set(rank.key, rank);
  }
  return Array.from(map.values()).sort((a, b) => a.sort - b.sort);
}

function buildSearchIndex(
  emperors: Emperor[],
  princes: Prince[],
  posts: Post[],
  institutions: Institutions,
): SearchDoc[] {
  const docs: SearchDoc[] = [];

  for (const e of emperors) {
    docs.push({
      id: e.id,
      type: 'emperor',
      title: `${e.templeName} ${e.name}`,
      subtitle: e.eras.map((era) => era.name).join('、'),
      text: [e.posthumousName, e.reignText, e.branch === 'nanming' ? '南明' : '大明'].join(' '),
      url: `/emperors/${e.id}/`,
    });
  }

  for (const p of princes) {
    docs.push({
      id: p.id,
      type: 'prince',
      title: p.name || p.title || p.orderLabel,
      subtitle: `${p.emperorName} 之${p.orderLabel}${p.title ? ` · ${p.title}` : ''}`,
      text: [p.title, p.note].filter(Boolean).join(' '),
      url: `/emperors/${p.emperorId}/`,
    });
  }

  for (const post of posts) {
    docs.push({
      id: post.id,
      type: 'post',
      title: post.name,
      subtitle: `${post.rankLabel} · ${post.org}`,
      text: [post.office, post.duty].filter(Boolean).join(' '),
      url: `/officials/?post=${post.id}`,
    });
  }

  for (const exam of institutions.exams) {
    docs.push({
      id: exam.id,
      type: 'exam',
      title: exam.name,
      subtitle: exam.grade ?? '科举',
      text: [exam.place, exam.time, ...exam.outcomes].filter(Boolean).join(' '),
      url: '/institutions/',
    });
  }

  for (const poem of institutions.poems) {
    docs.push({
      id: `poem-${poem.house}`,
      type: 'poem',
      title: poem.house,
      subtitle: '皇室字辈',
      text: poem.poem,
      url: '/institutions/',
    });
  }

  return docs;
}

function main() {
  console.log('读取原始表：', path.relative(ROOT, RAW_FILE));
  const sheet = loadSheet(RAW_FILE);

  const emperors = parseEmperors(sheet);
  const princes = parsePrinces(sheet, emperors);
  const relations = buildRelations(emperors, princes);
  const posts = parsePosts(sheet);
  const institutions = parseInstitutions(sheet);
  const ranks = collectRanks(posts);

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });

  const meta: DatasetMeta = {
    source: 'data/raw/明朝帝王世系&官职品级.xlsx',
    generatedAt: new Date().toISOString(),
    counts: {
      emperors: emperors.length,
      princes: princes.length,
      relations: relations.length,
      posts: posts.length,
    },
  };

  write('emperors.json', emperors);
  write('princes.json', princes);
  write('relations.json', relations);
  write('posts.json', posts);
  write('ranks.json', ranks);
  write('institutions.json', institutions);
  write('meta.json', meta);

  const index = buildSearchIndex(emperors, princes, posts, institutions);
  fs.writeFileSync(
    path.join(PUBLIC_DIR, 'search-index.json'),
    `${JSON.stringify(index)}\n`,
    'utf8',
  );
  console.log(`  ✓ public/search-index.json (${index.length} 条)`);

  console.log('\n数据概览：');
  console.log(`  皇帝 ${emperors.length} 位（大明 ${emperors.filter((e) => e.branch === 'ming').length} / 南明 ${emperors.filter((e) => e.branch === 'nanming').length}）`);
  console.log(`  皇子 ${princes.length} 位，关系边 ${relations.length} 条`);
  console.log(`  官职 ${posts.length} 条，品级 ${ranks.length} 档`);
  console.log(`  散阶 文 ${institutions.civilGrades.length} / 武 ${institutions.militaryGrades.length}`);
  console.log(`  勋级 文 ${institutions.civilMerits.length} / 武 ${institutions.militaryMerits.length}`);
  console.log(`  字辈 ${institutions.poems.length} 房`);
}

main();
