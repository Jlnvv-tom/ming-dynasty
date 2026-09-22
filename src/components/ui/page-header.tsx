import { cn } from '@/lib/utils';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, description, className, children }: PageHeaderProps) {
  return (
    <section className={cn('mx-auto max-w-7xl px-4 pt-10 pb-6', className)}>
      {eyebrow ? <p className="label-key mb-3">{eyebrow}</p> : null}
      <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
      {description ? (
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-soft dark:text-white/65 sm:text-base">
          {description}
        </p>
      ) : null}
      {children}
    </section>
  );
}

interface SectionTitleProps {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}

export function SectionTitle({ title, hint, action }: SectionTitleProps) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold sm:text-2xl">{title}</h2>
        {hint ? <p className="mt-1 text-sm text-ink-soft dark:text-white/60">{hint}</p> : null}
      </div>
      {action}
    </div>
  );
}
