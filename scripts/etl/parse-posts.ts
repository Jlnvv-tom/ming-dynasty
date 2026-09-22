import type { Post, System } from '../../src/types/index';
import type { SheetReader } from './sheet';
import { parseRank } from './util';

interface BlockSpec {
  system: System;
  /** 官属列 */
  group: string;
  /** 官职列 */
  name: string;
  /** 品级列 */
  rank: string;
  /** 人数列，可为空（派驻地方官无员额） */
  headcount?: string;
  /** 隶属列 */
  office?: string;
  /** 职事列 */
  duty: string;
  from: number;
  to: number;
  /** 需要跳过的隶属（源表中重复登记、且归错的条目） */
  excludeOffices?: string[];
}

const BLOCKS: BlockSpec[] = [
  // A-F：皇帝辅臣 + 中央政府
  { system: 'central', group: 'A', name: 'B', rank: 'C', headcount: 'D', office: 'E', duty: 'F', from: 4, to: 401 },
  // G-L：地方行政（含土司、卫所）；尚宝司属中央，源表重复登记于此处
  {
    system: 'local',
    group: 'G',
    name: 'H',
    rank: 'I',
    headcount: 'J',
    office: 'K',
    duty: 'L',
    from: 51,
    to: 199,
    excludeOffices: ['尚宝司'],
  },
  // M-R：军事机构
  { system: 'military', group: 'M', name: 'N', rank: 'O', headcount: 'P', office: 'Q', duty: 'R', from: 51, to: 109 },
  // M-P：派驻地方官（无员额列）
  { system: 'field', group: 'M', name: 'N', rank: 'O', duty: 'P', from: 112, to: 131 },
];

const HEADER_WORDS = new Set(['官职', '品级', '人数', '隶属', '职事', '官属']);

/** 区块标题（非衙门），需从衙门候选中剔除 */
const SECTION_WORDS = new Set(['中央政府', '地方行政', '军事机构', '派驻地方官']);

/**
 * 由「隶属」归并出所属衙门，例如「吏部文选清吏司」→「吏部」。
 * 候选衙门只取「官属」列（源表已分好的最高一级机构），
 * 不能把整条「隶属」也当作候选，否则最长前缀永远等于自身，归并会失效。
 */
function pickOrg(office: string, group: string, knownOrgs: string[]): string {
  const cleaned = office.replace(/\s+/g, '');
  if (!cleaned) return group;
  let best = '';
  for (const org of knownOrgs) {
    if (cleaned.startsWith(org) && org.length > best.length) best = org;
  }
  return best || group;
}

export function parsePosts(sheet: SheetReader): Post[] {
  // 收集「官属」列出现过的机构名，作为归并目标
  const knownOrgs = new Set<string>();
  for (const block of BLOCKS) {
    for (let row = block.from; row <= block.to; row += 1) {
      const g = sheet.getMerged(block.group, row).replace(/\s+/g, '');
      if (g && !HEADER_WORDS.has(g) && !SECTION_WORDS.has(g)) knownOrgs.add(g);
    }
  }
  const orgList = Array.from(knownOrgs).sort((a, b) => b.length - a.length);

  const raw: Omit<Post, 'id'>[] = [];
  const seen = new Set<string>();

  for (const block of BLOCKS) {
    for (let row = block.from; row <= block.to; row += 1) {
      const name = sheet.get(block.name, row);
      const rankLabel = sheet.get(block.rank, row);
      if (!name || !rankLabel) continue;
      if (HEADER_WORDS.has(name) || HEADER_WORDS.has(rankLabel)) continue;

      const group = sheet.getMerged(block.group, row);
      const office = block.office ? sheet.get(block.office, row) : '';
      if (block.excludeOffices?.includes(office.replace(/\s+/g, ''))) continue;
      const headcount = block.headcount ? sheet.get(block.headcount, row) : '';
      const duty = sheet.getMerged(block.duty, row);

      const key = `${name}|${rankLabel}|${office}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const rank = parseRank(rankLabel);
      raw.push({
        name: name.replace(/\s+/g, ''),
        rankLabel,
        rankSort: rank.sort,
        rankLevel: rank.level,
        secondary: rank.secondary,
        headcount: headcount || undefined,
        office: office || group,
        // 兜底必须是「官属」列的分组名，而不是原始的「隶属」长串
        org: pickOrg(office || group, group, orgList),
        system: block.system,
        duty: duty || undefined,
      });
    }
  }

  const systemOrder: Record<System, number> = { central: 0, local: 1, military: 2, field: 3 };
  raw.sort(
    (a, b) =>
      systemOrder[a.system] - systemOrder[b.system] ||
      a.rankSort - b.rankSort ||
      a.office.localeCompare(b.office, 'zh') ||
      a.name.localeCompare(b.name, 'zh'),
  );

  return raw.map((item, index) => ({
    ...item,
    id: `p-${String(index + 1).padStart(3, '0')}`,
  }));
}
