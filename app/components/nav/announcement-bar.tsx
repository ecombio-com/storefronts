import {cn} from 'cn';
import {ArrowRight, X} from 'lucide-react';
import {type ReactNode, useEffect, useState} from 'react';

import {ChevronLeftIcon, ChevronRightIcon} from '~/components/ui/icons';
import LocalizedLink from '~/components/ui/localized-link';
import type {AnnouncementBarData, Device, Variant} from '~/lib/announcements';

// Button labels only. The messages come from Shopify (announcement_bar/main).
const COPY = {
  dismiss: 'Dismiss announcement',
  next: 'Next announcement',
  previous: 'Previous announcement',
};

const CLOSE_MS = 300;

const VARIANTS: Record<Variant, string> = {
  dark: 'bg-primary text-primary-foreground',
  lavender: 'bg-(--color-brand-secondary) text-foreground',
  lime: 'bg-(--color-brand-primary) text-foreground',
};

function format(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const pad = (n: number) => String(n).padStart(2, '0');
  const clock = `${pad(Math.floor((s % 86400) / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  return d > 0 ? `${d}d ${clock}` : clock;
}

function toTime(iso?: string): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : t;
}

function SmartLink({href, className, children}: {href: string; className?: string; children: ReactNode}) {
  return href.startsWith('/') ? (
    <LocalizedLink href={href} className={className}>
      {children}
    </LocalizedLink>
  ) : (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

// Closing hides the bar until the next page load; nothing is saved.
export function Announcement({bar}: {bar: AnnouncementBarData | null}) {
  if (!bar) return null;
  return <AnnouncementBar {...bar} />;
}

function AnnouncementBar({autoRotate, dismissible, intervalMs, items}: AnnouncementBarData) {
  const [phase, setPhase] = useState<'open' | 'closing' | 'gone'>('open');
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const [device, setDevice] = useState<Device | null>(null);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  useEffect(() => {
    const tablet = window.matchMedia('(min-width: 768px) and (max-width: 1023px)');
    const desktop = window.matchMedia('(min-width: 1024px)');
    const read = () => setDevice(desktop.matches ? 'desktop' : tablet.matches ? 'tablet' : 'mobile');
    read();
    tablet.addEventListener('change', read);
    desktop.addEventListener('change', read);
    return () => {
      tablet.removeEventListener('change', read);
      desktop.removeEventListener('change', read);
    };
  }, []);

  const hasTimer = items.some((i) => i.countdownEnds);
  useEffect(() => {
    if (!hasTimer) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [hasTimer]);

  // Messages for other devices, or whose countdown has run out, are skipped.
  const list = items.filter((i) => {
    if (i.devices && (device === null || !i.devices.includes(device))) return false;
    const end = toTime(i.countdownEnds);
    return !(end !== null && now !== null && end <= now);
  });
  const count = list.length;
  const rotateMs = autoRotate ? intervalMs : 0;

  useEffect(() => {
    if (count < 2 || paused || phase !== 'open' || rotateMs <= 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), rotateMs);
    return () => clearInterval(timer);
  }, [count, paused, phase, rotateMs]);

  const current = list[index % Math.max(count, 1)];
  if (phase === 'gone' || !current) return null;

  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);
  const dismiss = () => {
    setPhase('closing');
    window.setTimeout(() => setPhase('gone'), CLOSE_MS);
  };

  const underline = 'underline underline-offset-2';
  const arrowBtn = 'shrink-0 rounded-full p-0.5 hover:opacity-70';
  const end = toTime(current.countdownEnds);
  const remaining = end !== null && now !== null ? end - now : null;

  return (
    <div
      className={cn(
        'grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none',
        phase === 'closing' ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100',
      )}
    >
      <div className="overflow-hidden">
        <div
          className={cn(
            'relative flex items-center justify-center gap-2 py-2 pl-3 text-center text-ds-small transition-colors duration-500 md:py-2.5 md:text-ds-regular lg:py-2',
            dismissible ? 'pr-10' : 'pr-3',
            VARIANTS[current.variant],
          )}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          {count > 1 && (
            <button type="button" onClick={() => go(-1)} aria-label={COPY.previous} className={arrowBtn}>
              <ChevronLeftIcon className="size-5" aria-hidden="true" />
            </button>
          )}
          <p aria-live={paused ? 'polite' : 'off'}>
            {current.text}{' '}
            {current.code &&
              (current.href ? (
                <SmartLink href={current.href} className={underline}>
                  {current.code}
                </SmartLink>
              ) : (
                <span className={underline}>{current.code}</span>
              ))}
            {remaining !== null && <span className="font-mono tabular-nums">{format(remaining)}</span>}
            {current.cta && current.href && (
              <SmartLink
                href={current.href}
                className="ml-2 inline-flex items-center gap-1 font-medium hover:opacity-70"
              >
                {current.cta}
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </SmartLink>
            )}
          </p>
          {count > 1 && (
            <button type="button" onClick={() => go(1)} aria-label={COPY.next} className={arrowBtn}>
              <ChevronRightIcon className="size-5" aria-hidden="true" />
            </button>
          )}
          {dismissible && (
            <button
              type="button"
              onClick={dismiss}
              aria-label={COPY.dismiss}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:opacity-70"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
