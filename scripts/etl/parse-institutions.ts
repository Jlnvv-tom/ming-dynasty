import type { ExamStage, GradeRow, Institutions } from '../../src/types/index';
import type { SheetReader } from './sheet';
import { parseRank, splitChain } from './util';

/** 散阶 / 勋级条目解析 */
function parseGradeRow(text: string): { rankLabel: string; rankSort: number; rest: string } | null {
  const raw = text.replace(/\s+/g, '').trim();
  const m = raw.match(/^(正|从)([一二三四五六七八九])品/);
  if (!m) return null;
  const rankLabel = m[0];
  return { rankLabel, rankSort: parseRank(rankLabel).sort, rest: raw.slice(rankLabel.length) };
}

function parseGrades(sheet: SheetReader, col: string, from: number, to: number): GradeRow[] {
  const rows: GradeRow[] = [];
  for (let row = from; row <= to; row += 1) {
    const text = sheet.get(col, row);
    if (!text) continue;
    const parsed = parseGradeRow(text);
    if (!parsed) continue;
    const rowData: GradeRow = { rankLabel: parsed.rankLabel, rankSort: parsed.rankSort };
    for (const part of parsed.rest.split(/[，,]/)) {
      const p = part.trim();
      if (!p) continue;
      if (p.startsWith('初授')) rowData.initial = p.slice(2);
      else if (p.startsWith('升授')) rowData.promote = p.slice(2);
      else if (p.startsWith('加授')) rowData.add = p.slice(2);
    }
    rows.push(rowData);
  }
  return rows.sort((a, b) => a.rankSort - b.rankSort);
}

function parseMerits(sheet: SheetReader, col: string, from: number, to: number) {
  const rows: { rankLabel: string; name: string }[] = [];
  for (let row = from; row <= to; row += 1) {
    const text = sheet.get(col, row);
    if (!text) continue;
    const parsed = parseGradeRow(text);
    if (!parsed) continue;
    rows.push({ rankLabel: parsed.rankLabel, name: parsed.rest.trim() });
  }
  return rows.sort((a, b) => parseRank(a.rankLabel).sort - parseRank(b.rankLabel).sort);
}

/** 科举取士：L-Q 列（固定小表，按行定位） */
function parseExams(sheet: SheetReader): ExamStage[] {
  const clean = (text: string) => text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

  const palace = clean(sheet.get('L', 29));
  const metropolitan = clean(sheet.get('L', 36));
  const provincial = clean(sheet.get('L', 39));
  const child = clean(sheet.get('L', 43));

  const stages: ExamStage[] = [
    {
      id: 'exam-child',
      name: '童试',
      order: 1,
      place: clean(sheet.get('M', 43)),
      time: clean(sheet.get('N', 43)),
      grade: clean(sheet.get('O', 43)),
      outcomes: [43, 44, 45].map((r) => clean(sheet.get('Q', r))).filter(Boolean),
      steps: [
        {
          name: '县试',
          place: clean(sheet.get('M', 47)),
          time: clean(sheet.get('N', 47)),
          outcome: clean(sheet.get('Q', 47)),
        },
        {
          name: '府试',
          place: clean(sheet.get('M', 46)),
          time: clean(sheet.get('N', 46)),
          outcome: clean(sheet.get('Q', 46)),
        },
        {
          name: '院试',
          place: clean(sheet.get('M', 43)),
          time: clean(sheet.get('N', 43)),
          outcome: clean(sheet.get('Q', 43)),
        },
      ],
    },
    {
      id: 'exam-provincial',
      name: '乡试',
      order: 2,
      place: clean(sheet.get('M', 39)),
      time: clean(sheet.get('N', 39)),
      grade: clean(sheet.get('O', 39)),
      outcomes: [39, 40].map((r) => clean(sheet.get('Q', r))).filter(Boolean),
    },
    {
      id: 'exam-metropolitan',
      name: '会试',
      order: 3,
      place: clean(sheet.get('M', 36)),
      time: clean(sheet.get('N', 36)),
      grade: clean(sheet.get('O', 36)),
      outcomes: [clean(sheet.get('Q', 36))].filter(Boolean),
    },
    {
      id: 'exam-palace',
      name: '殿试',
      order: 4,
      place: clean(sheet.get('M', 29)),
      time: clean(sheet.get('N', 29)),
      grade: [29, 32, 34].map((r) => clean(sheet.get('O', r))).filter(Boolean).join(' / '),
      outcomes: [29, 30, 31, 32, 34].map((r) => clean(sheet.get('Q', r))).filter(Boolean),
    },
  ];

  // 补充题注（如「廷试·定进士名次」）
  const notes: Record<string, string> = {
    'exam-child': child,
    'exam-provincial': provincial,
    'exam-metropolitan': metropolitan,
    'exam-palace': palace,
  };
  for (const stage of stages) {
    const note = notes[stage.id] ?? '';
    const m = note.match(/[：:]\s*([^（(]+)/);
    if (m && m[1].trim()) stage.name = m[1].trim();
  }
  return stages;
}

/** 解析制度附录的结构部分；`notes` 由编者注在 build 阶段合并 */
export function parseInstitutions(sheet: SheetReader): Omit<Institutions, 'notes'> {
  // 宗室封爵
  const titles = [
    { label: '皇子', chain: splitChain(sheet.get('H', 12)) },
    { label: '皇女', chain: splitChain(sheet.get('H', 13)) },
  ].filter((item) => item.chain.length > 0);

  // 散阶：文（G 列）/ 武（J 列），正一品 ~ 从九品
  const civilGrades = parseGrades(sheet, 'G', 16, 33);
  const militaryGrades = parseGrades(sheet, 'J', 16, 33);

  // 勋级：文勋十级（G 列）/ 武勋十二级（J 列）
  const civilMerits = parseMerits(sheet, 'G', 36, 45);
  const militaryMerits = parseMerits(sheet, 'J', 36, 47);

  // 皇室字辈：T 列
  const poems: { house: string; poem: string }[] = [];
  for (let row = 31; row <= 53; row += 1) {
    const text = sheet.get('T', row).replace(/\s+/g, '').trim();
    if (!text) continue;
    const idx = text.indexOf('：');
    if (idx < 0) continue;
    poems.push({ house: text.slice(0, idx), poem: text.slice(idx + 1) });
  }

  return {
    titles,
    civilGrades,
    militaryGrades,
    civilMerits,
    militaryMerits,
    exams: parseExams(sheet),
    poems,
  };
}
