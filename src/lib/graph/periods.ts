import { getEmperor } from '@/lib/data';
import type { Emperor } from '@/types/index';

export interface Period {
  id: string;
  name: string;
  /** 年份区间文案 */
  era: string;
  start: number;
  end: number;
  /** 该期帝王 id（按继统顺序） */
  emperorIds: string[];
  summary: string;
  events: string[];
}

/** 大明十六帝 + 南明五帝，按历史分期聚为 8 组，覆盖全部 21 帝且互不重叠 */
export const PERIODS: Period[] = [
  {
    id: 'kaiguo',
    name: '开国靖难',
    era: '1368 — 1424',
    start: 1368,
    end: 1424,
    emperorIds: ['taizu', 'huidi', 'chengzu'],
    summary: '布衣起兵定天下，削藩引发靖难，叔夺侄位后迁都北京。',
    events: ['洪武开国', '建文削藩', '靖难之役', '永乐迁都'],
  },
  {
    id: 'renxuan',
    name: '仁宣之治',
    era: '1424 — 1435',
    start: 1424,
    end: 1435,
    emperorIds: ['renzong', 'xuanzong'],
    summary: '休养生息、罢采买、宽刑狱，史称「仁宣之治」，为明之极盛。',
    events: ['罢下西洋', '内阁票拟渐成', '弃交趾'],
  },
  {
    id: 'tumu',
    name: '土木复辟',
    era: '1435 — 1464',
    start: 1435,
    end: 1464,
    emperorIds: ['yingzong', 'daizong'],
    summary: '英宗亲征被俘，弟代宗即位；八年后夺门复辟，兄弟两度易位。',
    events: ['土木之变', '北京保卫战', '夺门之变'],
  },
  {
    id: 'chenghong',
    name: '成化弘治',
    era: '1464 — 1521',
    start: 1464,
    end: 1521,
    emperorIds: ['xianzong', 'xiaozong', 'wuzong'],
    summary: '成化设西厂、弘治勤政称治，武宗游乐豹房，国势由治转怠。',
    events: ['设西厂', '弘治中兴', '武宗南巡'],
  },
  {
    id: 'jiajing',
    name: '嘉靖',
    era: '1521 — 1567',
    start: 1521,
    end: 1567,
    emperorIds: ['shizong'],
    summary: '以藩王入继大统，大礼议定尊号，后期崇道罢朝，内阁倾轧。',
    events: ['大礼议', '壬寅宫变', '严嵩当国'],
  },
  {
    id: 'longwan',
    name: '隆万',
    era: '1567 — 1620',
    start: 1567,
    end: 1620,
    emperorIds: ['muzong', 'shenzong'],
    summary: '隆庆开关、张居正改革催生万历中兴，其后国本之争与怠政并行。',
    events: ['隆庆开关', '张居正改革', '万历三大征', '国本之争'],
  },
  {
    id: 'qizhen',
    name: '末代启祯',
    era: '1620 — 1644',
    start: 1620,
    end: 1644,
    emperorIds: ['guangzong', 'xizong', 'sizong'],
    summary: '一月天子泰昌，熹宗任阉党、思宗力图振作而终殉社稷。',
    events: ['红丸案', '魏忠贤乱政', '崇祯殉国'],
  },
  {
    id: 'nanming',
    name: '南明',
    era: '1644 — 1662',
    start: 1644,
    end: 1662,
    emperorIds: ['anzong', 'shaozong', 'wenzong', 'jingzong', 'zhaozong'],
    summary: '北京既陷，宗室相继监国称帝，十八年间诸政权分立而终。',
    events: ['弘光立国', '隆武绍兴', '永历入滇'],
  },
];

export function getPeriodById(id: string): Period | undefined {
  return PERIODS.find((period) => period.id === id);
}

export function getPeriodOfEmperor(emperorId: string): Period | undefined {
  return PERIODS.find((period) => period.emperorIds.includes(emperorId));
}

/** 某期是否跨入南明 */
export function isNanmingPeriod(period: Period): boolean {
  return period.emperorIds.some((id) => getEmperor(id)?.branch === 'nanming');
}

export function periodEmperors(period: Period): Emperor[] {
  return period.emperorIds
    .map((id) => getEmperor(id))
    .filter((emperor): emperor is Emperor => Boolean(emperor));
}
