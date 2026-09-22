import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
}

export function StatCard({ label, value, hint, className }: StatCardProps) {
  return (
    <div className={cn('surface px-4 py-3', className)}>
      <p className="text-2xl font-semibold text-vermilion dark:text-vermilion-soft">{value}</p>
      <p className="mt-0.5 text-xs tracking-wide text-ink-soft dark:text-white/60">{label}</p>
      {hint ? <p className="mt-1 text-[11px] text-ink-faint dark:text-white/40">{hint}</p> : null}
    </div>
  );
}
