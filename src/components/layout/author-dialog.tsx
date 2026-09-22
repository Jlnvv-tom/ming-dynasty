'use client';

import { UserRound, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AUTHOR } from '@/lib/site';

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function AuthorDialog() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // 打开时：锁定滚动、聚焦关闭按钮、接管 ESC 与 Tab
  useEffect(() => {
    if (!open) return;
    const lastFocused = document.activeElement as HTMLElement | null;
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (item) => !item.hasAttribute('disabled'),
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      (lastFocused ?? trigger)?.focus();
    };
  }, [close, open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-xs text-ink-soft transition-colors hover:border-vermilion/50 hover:text-vermilion dark:border-white/15 dark:text-white/65 dark:hover:text-vermilion-soft"
      >
        <UserRound className="h-3.5 w-3.5" />
        关于作者 · {AUTHOR.name}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
          <div
            className="animate-fade-in absolute inset-0 bg-ink/45 backdrop-blur-sm dark:bg-night/70"
            onClick={close}
            aria-hidden="true"
          />

          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="author-dialog-title"
            className="surface animate-fade-up relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-b-none p-6 sm:max-w-3xl sm:rounded-b-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="label-key">关于作者</p>
                <h2 id="author-dialog-title" className="mt-1 font-serif text-2xl font-semibold">
                  {AUTHOR.name}
                </h2>
                <p className="mt-1 text-xs text-ink-faint dark:text-white/45">{AUTHOR.tagline}</p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="关闭弹窗"
                className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-ink/15 text-ink-soft transition-colors hover:border-vermilion/50 hover:text-vermilion dark:border-white/15 dark:text-white/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-ink-soft dark:text-white/65">
              {AUTHOR.intro}
            </p>

            <div className="gold-rule my-5" />

            <div className="flex flex-wrap justify-center gap-5">
              {AUTHOR.channels.map((channel) => (
                <figure
                  key={channel.id}
                  className="flex w-[200px] max-w-full flex-col items-center text-center"
                >
                  <div className="rounded-2xl bg-white p-3 shadow-card ring-1 ring-ink/10">
                    <Image
                      src={channel.src}
                      alt={channel.alt}
                      width={channel.width}
                      height={channel.height}
                      className="h-auto w-full object-contain"
                    />
                  </div>
                  <figcaption className="mt-3">
                    <p className="font-serif text-sm font-semibold">{channel.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-faint dark:text-white/45">
                      {channel.hint}
                    </p>
                    {channel.note ? (
                      <p className="mt-2 rounded-md bg-clay/10 px-2 py-1 text-[11px] leading-relaxed text-clay">
                        {channel.note}
                      </p>
                    ) : null}
                  </figcaption>
                </figure>
              ))}
            </div>

            <p className="mt-5 text-center text-[11px] text-ink-faint dark:text-white/40">
              微信内长按识别，或用相机 / 扫一扫对准二维码 · 群二维码会定期更新
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
