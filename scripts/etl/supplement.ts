import fs from 'node:fs';
import path from 'node:path';
import type { Emperor, InstitutionNote, Prince, SourceRef } from '../../src/types/index';

/** 编者注：帝王 */
export interface EmperorSupplement {
  emperorId: string;
  birthYear?: number;
  deathYear?: number;
  birthDate?: string;
  mausoleum?: string;
  mausoleumNote?: string;
  summary?: string;
  sources?: SourceRef[];
}

/** 编者注：宗室皇子 */
export interface PrinceSupplement {
  princeId: string;
  life?: string;
  fief?: string;
  detail?: string;
  sources?: SourceRef[];
}

/** 编者注：制度释义 */
export interface InstitutionsSupplement {
  notes?: InstitutionNote[];
}

export interface SupplementPayload {
  emperors: EmperorSupplement[];
  princes: PrinceSupplement[];
  notes: InstitutionNote[];
  /** 各文件是否存在，用于构建日志 */
  present: { emperors: boolean; princes: boolean; institutions: boolean };
}

function readJson<T>(dir: string, file: string): { data: T | null; present: boolean } {
  const target = path.join(dir, file);
  if (!fs.existsSync(target)) return { data: null, present: false };
  return { data: JSON.parse(fs.readFileSync(target, 'utf8')) as T, present: true };
}

/** 读取编者注；目录或文件缺失时静默跳过，保证站点仍可构建 */
export function loadSupplement(dir: string): SupplementPayload {
  const emperorsFile = readJson<EmperorSupplement[]>(dir, 'emperors.json');
  const princesFile = readJson<PrinceSupplement[]>(dir, 'princes.json');
  const notesFile = readJson<InstitutionsSupplement>(dir, 'institutions.json');

  return {
    emperors: emperorsFile.data ?? [],
    princes: princesFile.data ?? [],
    notes: notesFile.data?.notes ?? [],
    present: {
      emperors: emperorsFile.present,
      princes: princesFile.present,
      institutions: notesFile.present,
    },
  };
}

export function applyEmperorSupplement(emperors: Emperor[], items: EmperorSupplement[]): Emperor[] {
  const byId = new Map(items.map((item) => [item.emperorId, item]));
  return emperors.map((emperor) => {
    const extra = byId.get(emperor.id);
    if (!extra) return emperor;
    return {
      ...emperor,
      birthYear: extra.birthYear,
      deathYear: extra.deathYear,
      birthDate: extra.birthDate,
      mausoleum: extra.mausoleum,
      mausoleumNote: extra.mausoleumNote,
      summary: extra.summary,
      sources: extra.sources,
    };
  });
}

export function applyPrinceSupplement(princes: Prince[], items: PrinceSupplement[]): Prince[] {
  const byId = new Map(items.map((item) => [item.princeId, item]));
  return princes.map((prince) => {
    const extra = byId.get(prince.id);
    if (!extra) return prince;
    return {
      ...prince,
      life: extra.life,
      fief: extra.fief,
      detail: extra.detail,
      sources: extra.sources,
    };
  });
}

export interface SupplementCoverage {
  emperors: { total: number; covered: number };
  princes: { total: number; covered: number };
  notes: number;
}

export function coverage(
  emperors: Emperor[],
  princes: Prince[],
  payload: SupplementPayload,
): SupplementCoverage {
  const emperorIds = new Set(emperors.map((emperor) => emperor.id));
  const princeIds = new Set(princes.map((prince) => prince.id));
  return {
    emperors: {
      total: emperors.length,
      covered: payload.emperors.filter((item) => emperorIds.has(item.emperorId)).length,
    },
    princes: {
      total: princes.length,
      covered: payload.princes.filter((item) => princeIds.has(item.princeId)).length,
    },
    notes: payload.notes.length,
  };
}
