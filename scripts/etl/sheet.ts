import XLSX from 'xlsx';
import type { CellObject, WorkSheet } from 'xlsx';

export interface SheetReader {
  /** 读取单元格（行号从 1 开始，列用字母） */
  get: (col: string, row: number) => string;
  /** 读取单元格，若处于合并区则返回合并区左上角的值 */
  getMerged: (col: string, row: number) => string;
  maxRow: number;
}

export function loadSheet(file: string, sheetName?: string): SheetReader {
  const wb = XLSX.readFile(file, { cellDates: false });
  const name = sheetName ?? wb.SheetNames[0];
  const ws: WorkSheet = wb.Sheets[name];
  const merges = (ws['!merges'] ?? []) as {
    s: { r: number; c: number };
    e: { r: number; c: number };
  }[];
  const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');

  const readCell = (r: number, c: number): string => {
    const addr = XLSX.utils.encode_cell({ r, c });
    const cell = ws[addr] as CellObject | undefined;
    if (!cell || cell.v === undefined || cell.v === null) return '';
    return String(cell.v).replace(/\s+/g, ' ').trim();
  };

  const get = (col: string, row: number): string =>
    readCell(row - 1, XLSX.utils.decode_col(col));

  const getMerged = (col: string, row: number): string => {
    const c = XLSX.utils.decode_col(col);
    const r = row - 1;
    const hit = merges.find(
      (m) => m.s.c <= c && c <= m.e.c && m.s.r <= r && r <= m.e.r,
    );
    if (!hit) return readCell(r, c);
    return readCell(hit.s.r, hit.s.c);
  };

  return { get, getMerged, maxRow: range.e.r + 1 };
}
