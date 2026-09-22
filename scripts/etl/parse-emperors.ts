import type { Emperor, Era, Prince, Relation, RelationType } from '../../src/types/index';
import type { SheetReader } from './sheet';
import { cnToNumber, tidyName } from './util';

/** 庙号 → 稳定 id */
export const TEMPLE_ID: Record<string, string> = {
  太祖: 'taizu',
  惠帝: 'huidi',
  成祖: 'chengzu',
  仁宗: 'renzong',
  宣宗: 'xuanzong',
  英宗: 'yingzong',
  复帝: 'yingzong',
  代宗: 'daizong',
  宪宗: 'xianzong',
  孝宗: 'xiaozong',
  武宗: 'wuzong',
  世宗: 'shizong',
  穆宗: 'muzong',
  神宗: 'shenzong',
  光宗: 'guangzong',
  熹宗: 'xizong',
  思宗: 'sizong',
  安宗: 'anzong',
  绍宗: 'shaozong',
  文宗: 'wenzong',
  敬宗: 'jingzong',
  昭宗: 'zhaozong',
};

const TEMPLES = Object.keys(TEMPLE_ID);

/** 大明正朔：T-X 列 */
const EMPEROR_ROWS: { from: number; to: number; branch: 'ming' | 'nanming' }[] = [
  { from: 4, to: 20, branch: 'ming' },
  { from: 24, to: 28, branch: 'nanming' },
];

/** 继统顺序与关系性质 */
const SUCCESSION: { from: string; to: string; type: RelationType; label: string }[] = [
  { from: '太祖', to: '惠帝', type: 'grandparent', label: '孙承祖位' },
  { from: '惠帝', to: '成祖', type: 'uncle_nephew', label: '叔夺侄位·靖难' },
  { from: '成祖', to: '仁宗', type: 'father_son', label: '父子相承' },
  { from: '仁宗', to: '宣宗', type: 'father_son', label: '父子相承' },
  { from: '宣宗', to: '英宗', type: 'father_son', label: '父子相承' },
  { from: '英宗', to: '代宗', type: 'brother', label: '兄终弟及·土木之变' },
  { from: '代宗', to: '英宗', type: 'restoration', label: '夺门之变·复辟' },
  { from: '英宗', to: '宪宗', type: 'father_son', label: '父子相承' },
  { from: '宪宗', to: '孝宗', type: 'father_son', label: '父子相承' },
  { from: '孝宗', to: '武宗', type: 'father_son', label: '父子相承' },
  { from: '武宗', to: '世宗', type: 'cousin', label: '堂兄弟·藩王入继' },
  { from: '世宗', to: '穆宗', type: 'father_son', label: '父子相承' },
  { from: '穆宗', to: '神宗', type: 'father_son', label: '父子相承' },
  { from: '神宗', to: '光宗', type: 'father_son', label: '父子相承' },
  { from: '光宗', to: '熹宗', type: 'father_son', label: '父子相承' },
  { from: '熹宗', to: '思宗', type: 'brother', label: '兄终弟及' },
  { from: '思宗', to: '安宗', type: 'cousin', label: '堂兄弟·南明' },
  { from: '安宗', to: '绍宗', type: 'clan', label: '宗室相继·南明' },
  { from: '绍宗', to: '文宗', type: 'brother', label: '兄弟相继·南明' },
  { from: '文宗', to: '敬宗', type: 'clan', label: '宗室相继·南明' },
  { from: '敬宗', to: '昭宗', type: 'clan', label: '宗室相继·南明' },
];

/** 表中未直接列出的父子关系（父为宗室，非皇帝） */
const PARENT_OVERRIDES: { child: string; parentEmperor: string; parentPrince: string }[] = [
  { child: '惠帝', parentEmperor: '太祖', parentPrince: '朱标' },
  { child: '世宗', parentEmperor: '宪宗', parentPrince: '朱祐杬' },
  { child: '安宗', parentEmperor: '神宗', parentPrince: '朱常洵' },
  { child: '昭宗', parentEmperor: '神宗', parentPrince: '朱常瀛' },
];

function parseReign(raw: string): Era & { unit: '年' | '月' } {
  const text = raw.replace(/\s+/g, ' ').trim();
  const m = text.match(/(\d+)\s*(年|月)\s*\((\d{4})(?:\s*[-–]\s*(\d{4}))?\)/);
  if (!m) return { name: '', raw: text, unit: '年' };
  const amount = Number(m[1]);
  const start = Number(m[3]);
  const end = m[4] ? Number(m[4]) : start;
  return {
    name: '',
    raw: text,
    unit: m[2] as '年' | '月',
    years: m[2] === '年' ? amount : 0,
    start,
    end,
  };
}

export function parseEmperors(sheet: SheetReader): Emperor[] {
  const map = new Map<string, Emperor>();
  let index = 0;

  for (const range of EMPEROR_ROWS) {
    for (let row = range.from; row <= range.to; row += 1) {
      const templeName = sheet.get('T', row);
      const name = tidyName(sheet.get('U', row));
      const eraName = sheet.get('V', row);
      if (!templeName || !name || !TEMPLE_ID[templeName]) continue;

      const reignText = sheet.get('W', row);
      const reign = parseReign(reignText);
      const era: Era = {
        name: eraName,
        start: reign.start,
        end: reign.end,
        years: reign.years,
        raw: reignText,
      };

      const id = TEMPLE_ID[templeName];
      const exist = map.get(id);
      if (exist) {
        exist.eras.push(era);
        exist.reignText = `${exist.reignText}、${reignText}`;
        continue;
      }

      index += 1;
      map.set(id, {
        id,
        index,
        templeName,
        name,
        eras: [era],
        reignText,
        posthumousName: sheet.get('X', row),
        branch: range.branch,
      });
    }
  }

  return Array.from(map.values())
    .map((emperor) => {
      const starts = emperor.eras.map((e) => e.start).filter((n): n is number => typeof n === 'number');
      const ends = emperor.eras.map((e) => e.end).filter((n): n is number => typeof n === 'number');
      const years = emperor.eras.reduce((sum, e) => sum + (e.years ?? 0), 0);
      return {
        ...emperor,
        reignStart: starts.length ? Math.min(...starts) : undefined,
        reignEnd: ends.length ? Math.max(...ends) : undefined,
        reignYears: years || undefined,
      };
    })
    .sort((a, b) => a.index - b.index);
}

const ORDER_WORDS = ['长子', '次子', '世子'];

function parseChild(text: string): { orderLabel: string; order: number; name: string; title?: string; note?: string } | null {
  const raw = text.replace(/\s+/g, ' ').trim();
  if (!raw) return null;
  const tokens = raw.split(' ').filter(Boolean);
  if (!tokens.length) return null;

  let orderLabel = tokens[0] ?? '';
  if (!/子$/.test(orderLabel)) {
    // 少数单元格缺少齿序前缀，如直接写作「朱某某 某王」
    orderLabel = '';
  } else {
    tokens.shift();
  }

  let name = '';
  let title = '';
  let note = '';
  for (const token of tokens) {
    if (/^早(天|夭)$/.test(token)) {
      note = '早夭';
      continue;
    }
    if (/^朱/.test(token) && !name) {
      name = token;
      continue;
    }
    title = title ? `${title} ${token}` : token;
  }

  const orderMatch = orderLabel.match(/^([^子]+)子$/);
  const numeral = orderMatch ? orderMatch[1] : '';
  const order = ORDER_WORDS.indexOf(orderLabel) >= 0 ? ORDER_WORDS.indexOf(orderLabel) + 1 : cnToNumber(numeral);

  if (!name && !title && !note) return null;
  return {
    orderLabel: orderLabel || '子',
    order: order || 99,
    name: tidyName(name),
    title: title.replace(/&/g, '、').trim() || undefined,
    note: note || undefined,
  };
}

export function parsePrinces(sheet: SheetReader, emperors: Emperor[]): Prince[] {
  const byTemple = new Map(emperors.map((e) => [e.templeName, e]));
  const princes: Prince[] = [];
  let current: Emperor | null = null;

  for (let row = 1; row <= 48; row += 1) {
    const header = sheet.get('AC', row);
    if (/子嗣|无子/.test(header)) {
      const temple = TEMPLES.find((t) => header.startsWith(t));
      current = temple ? byTemple.get(temple) ?? null : null;
      continue;
    }
    if (!current) continue;

    for (const col of ['AC', 'AD', 'AE', 'AF']) {
      const cell = sheet.get(col, row);
      if (!cell || /子嗣|无子/.test(cell)) continue;
      const child = parseChild(cell);
      if (!child) continue;
      princes.push({
        id: `${current.id}-s${child.order}`,
        emperorId: current.id,
        emperorName: current.templeName,
        order: child.order,
        orderLabel: child.orderLabel,
        name: child.name,
        title: child.title,
        note: child.note,
      });
    }
  }

  const emperorNames = new Set(emperors.map((e) => e.name));
  for (const prince of princes) {
    if (prince.name && emperorNames.has(prince.name)) prince.isEmperor = true;
  }
  return princes;
}

export function buildRelations(emperors: Emperor[], princes: Prince[]): Relation[] {
  const relations: Relation[] = [];
  const idByTemple = new Map(emperors.map((e) => [e.templeName, e.id]));
  const idByEmperorName = new Map(emperors.map((e) => [e.name, e.id]));
  const princeKey = new Map(princes.map((p) => [`${p.emperorName}#${p.name}`, p.id]));

  SUCCESSION.forEach((item, i) => {
    const source = idByTemple.get(item.from);
    const target = idByTemple.get(item.to);
    if (!source || !target) return;
    relations.push({
      id: `r-succ-${i + 1}`,
      source,
      target,
      type: item.type,
      label: item.label,
    });
  });

  // 父子：皇帝 → 皇子（若皇子即皇帝，则直连两位皇帝）
  for (const prince of princes) {
    const target = prince.isEmperor ? idByEmperorName.get(prince.name) : prince.id;
    if (!target) continue;
    relations.push({
      id: `r-fs-${prince.id}`,
      source: prince.emperorId,
      target,
      type: 'father_son',
      label: prince.title ?? prince.orderLabel,
    });
  }

  // 表中未明示的父子（父为宗室亲王）
  PARENT_OVERRIDES.forEach((item, i) => {
    const source = princeKey.get(`${item.parentEmperor}#${item.parentPrince}`);
    const target = idByTemple.get(item.child);
    if (!source || !target) return;
    relations.push({
      id: `r-fs-extra-${i + 1}`,
      source,
      target,
      type: 'father_son',
      label: '父子',
    });
  });

  return relations;
}
