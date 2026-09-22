/**
 * 领域模型：明朝帝王世系 & 官职品级
 * ETL 脚本与前端共用，保持「只读数据 + 纯函数访问」的边界。
 */

/** 官僚体系：中央 / 地方 / 军事 / 派驻地方官 */
export type System = 'central' | 'local' | 'military' | 'field';

export const SYSTEM_LABEL: Record<System, string> = {
  central: '中央官制',
  local: '地方行政',
  military: '军事机构',
  field: '派驻地方官',
};

/** 品级 */
export interface Rank {
  /** 稳定 key，如 zheng-1 */
  key: string;
  /** 原始文案，如 正一品 */
  label: string;
  /** 1-9，0 表示超品 / 未入流 / 无品级 */
  level: number;
  /** 是否为「从」品 */
  secondary: boolean;
  /** 排序权重，越小越尊 */
  sort: number;
}

/** 官职 */
export interface Post {
  id: string;
  /** 官职名 */
  name: string;
  /** 品级原始文案 */
  rankLabel: string;
  /** 排序权重 */
  rankSort: number;
  /** 品级 1-9，0 表示特殊 */
  rankLevel: number;
  secondary: boolean;
  /** 员额，如 一人 / 二人 / 无定员 */
  headcount?: string;
  /** 隶属（原始） */
  office: string;
  /** 所属衙门（由隶属归并） */
  org: string;
  /** 体系 */
  system: System;
  /** 职事 */
  duty?: string;
}

/** 年号与在位区间 */
export interface Era {
  name: string;
  start?: number;
  end?: number;
  years?: number;
  raw: string;
}

/** 史料出处 */
export interface SourceRef {
  /** 书名，如《明史》 */
  book: string;
  /** 卷次篇目，如「卷一·太祖本纪」 */
  chapter?: string;
  /** 可核验的在线链接；无法核实者留空，不臆造 */
  url?: string;
}

/** 皇帝 */
export interface Emperor {
  id: string;
  /** 序位，从 1 开始 */
  index: number;
  /** 庙号 */
  templeName: string;
  /** 名讳 */
  name: string;
  /** 年号（英宗有正统、天顺两段） */
  eras: Era[];
  /** 在位原始文案 */
  reignText: string;
  /** 谥号 */
  posthumousName: string;
  /** 大明 / 南明 */
  branch: 'ming' | 'nanming';
  reignStart?: number;
  reignEnd?: number;
  reignYears?: number;
  /* ----- 以下为编者注（来自 data/supplement） ----- */
  /** 生年 */
  birthYear?: number;
  /** 卒年 */
  deathYear?: number;
  /** 生卒农历日期补充，如「八月八日」 */
  birthDate?: string;
  /** 陵寝 */
  mausoleum?: string;
  /** 陵寝备注（如「葬处无考」「后追葬」） */
  mausoleumNote?: string;
  /** 生平概述（100–200 字） */
  summary?: string;
  /** 出处 */
  sources?: SourceRef[];
}

/** 皇子（宗室子嗣） */
export interface Prince {
  id: string;
  emperorId: string;
  /** 父帝庙号 */
  emperorName: string;
  /** 齿序 */
  order: number;
  /** 长子 / 次子 / 世子 ... */
  orderLabel: string;
  /** 名讳 */
  name: string;
  /** 封号，如 懿文太子 / 秦王 */
  title?: string;
  /** 备注，如 早夭 / 未封王 */
  note?: string;
  /** 是否后来即位为帝 */
  isEmperor?: boolean;
  /* ----- 以下为编者注（来自 data/supplement） ----- */
  /** 生卒年，如「1355 — 1392」；无明确记载者留空 */
  life?: string;
  /** 封国，如「秦」「周」 */
  fief?: string;
  /** 事迹补注 */
  detail?: string;
  /** 出处 */
  sources?: SourceRef[];
}

/** 关系类型 */
export type RelationType =
  | 'succession'
  | 'father_son'
  | 'brother'
  | 'uncle_nephew'
  | 'grandparent'
  | 'cousin'
  | 'restoration'
  | 'clan';

export const RELATION_LABEL: Record<RelationType, string> = {
  succession: '继统',
  father_son: '父子',
  brother: '兄弟',
  uncle_nephew: '叔侄',
  grandparent: '祖孙',
  cousin: '堂兄弟',
  restoration: '复辟',
  clan: '同宗',
};

/** 关系边：节点为皇帝 id 或皇子 id */
export interface Relation {
  id: string;
  source: string;
  target: string;
  type: RelationType;
  label?: string;
}

/** 散阶（文 / 武） */
export interface GradeRow {
  rankLabel: string;
  rankSort: number;
  initial?: string;
  promote?: string;
  add?: string;
}

/** 科举子阶段 */
export interface ExamStep {
  name: string;
  place?: string;
  time?: string;
  outcome?: string;
}

/** 科举阶段 */
export interface ExamStage {
  id: string;
  name: string;
  order: number;
  place?: string;
  time?: string;
  grade?: string;
  outcomes: string[];
  steps?: ExamStep[];
}

/** 皇室字辈 */
export interface GenerationPoem {
  house: string;
  poem: string;
}

/** 宗室封爵序列 */
export interface TitleChain {
  label: string;
  chain: string[];
}

/** 制度释义（编者注） */
export interface InstitutionNote {
  id: string;
  /** 归属板块：jue / san / xun / keju / zibei */
  section: 'jue' | 'san' | 'xun' | 'keju' | 'zibei';
  title: string;
  body: string;
  sources: SourceRef[];
}

/** 制度附录 */
export interface Institutions {
  titles: TitleChain[];
  civilGrades: GradeRow[];
  militaryGrades: GradeRow[];
  civilMerits: { rankLabel: string; name: string }[];
  militaryMerits: { rankLabel: string; name: string }[];
  exams: ExamStage[];
  poems: GenerationPoem[];
  /** 术语释义与制度背景 */
  notes: InstitutionNote[];
}

/** 数据元信息 */
export interface DatasetMeta {
  source: string;
  generatedAt: string;
  counts: {
    emperors: number;
    princes: number;
    relations: number;
    posts: number;
  };
}

/** 检索文档 */
export interface SearchDoc {
  id: string;
  type: 'emperor' | 'prince' | 'post' | 'exam' | 'poem';
  title: string;
  subtitle: string;
  text: string;
  url: string;
}
