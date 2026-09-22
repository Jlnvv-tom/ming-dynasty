'use client';

import { LayoutList, Locate, Maximize2, Minimize2, Minus, Network, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { G6CanvasHandle } from './g6-canvas';

export interface FindOption {
  id: string;
  label: string;
  hint?: string;
}

interface Props {
  title: string;
  hint?: string;
  findPlaceholder: string;
  suggestions: FindOption[];
  onFindPick: (id: string) => void;
  handleRef?: React.MutableRefObject<G6CanvasHandle | null>;
  immersive?: boolean;
  onToggleImmersive?: () => void;
  listMode?: boolean;
  onToggleList?: () => void;
}

const BTN =
  'inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-ink/15 text-ink-soft transition-colors hover:border-vermilion/50 hover:text-vermilion dark:border-white/15 dark:text-white/65';

export default function GraphToolbar({
  title,
  hint,
  findPlaceholder,
  suggestions,
  onFindPick,
  handleRef,
  immersive = false,
  onToggleImmersive,
  listMode = false,
  onToggleList,
}: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const matched = query.trim()
    ? suggestions.filter((item) => `${item.label}${item.hint ?? ''}`.includes(query.trim())).slice(0, 6)
    : [];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div>
        <p className="font-serif text-sm font-semibold">{title}</p>
        {hint ? <p className="text-[11px] text-ink-faint dark:text-white/45">{hint}</p> : null}
      </div>

      <div className="relative ml-auto w-full sm:w-64">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          placeholder={findPlaceholder}
          className="w-full rounded-full border border-ink/15 bg-transparent py-1.5 pl-9 pr-3 text-xs outline-none transition-colors placeholder:text-ink-faint focus:border-vermilion/60 dark:border-white/15"
        />
        {open && matched.length ? (
          <ul className="surface absolute z-40 mt-1 w-full overflow-hidden p-1">
            {matched.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    onFindPick(item.id);
                    setQuery('');
                    setOpen(false);
                  }}
                  className="block w-full cursor-pointer rounded-md px-3 py-2 text-left text-xs transition-colors hover:bg-vermilion/10 hover:text-vermilion"
                >
                  {item.label}
                  {item.hint ? (
                    <span className="ml-2 text-ink-faint dark:text-white/45">{item.hint}</span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {onToggleList ? (
        <button
          type="button"
          onClick={onToggleList}
          className={cn('chip cursor-pointer gap-1.5 transition-colors', listMode && 'chip-active')}
        >
          {listMode ? <Network className="h-3 w-3" /> : <LayoutList className="h-3 w-3" />}
          {listMode ? '图谱视图' : '列表视图'}
        </button>
      ) : null}

      <div className="flex items-center gap-1">
        <button type="button" aria-label="放大" className={BTN} onClick={() => handleRef?.current?.zoomIn()}>
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button type="button" aria-label="缩小" className={BTN} onClick={() => handleRef?.current?.zoomOut()}>
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button type="button" aria-label="适应窗口" className={BTN} onClick={() => handleRef?.current?.fit()}>
          <Locate className="h-3.5 w-3.5" />
        </button>
        {onToggleImmersive ? (
          <button
            type="button"
            aria-label={immersive ? '退出全屏' : '全屏查看'}
            className={BTN}
            onClick={onToggleImmersive}
          >
            {immersive ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        ) : null}
      </div>
    </div>
  );
}
