import type { LegendItem } from './tones';

export default function GraphLegend({ items }: { items: LegendItem[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-1 py-2 text-xs">
      <span className="label-key">图例</span>
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span
            className={
              item.shape === 'circle'
                ? 'h-3 w-3 rounded-full border-2'
                : 'h-2.5 w-4 rounded-[3px] border-2'
            }
            style={{
              borderColor: item.color,
              borderStyle: item.dashed ? 'dashed' : 'solid',
            }}
          />
          <span className="text-ink-soft dark:text-white/60">{item.label}</span>
        </span>
      ))}
    </div>
  );
}
