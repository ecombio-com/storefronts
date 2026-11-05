import {cn} from 'cn';
import {ArrowRight, X} from 'lucide-react';
import {type ReactNode, useEffect, useState} from 'react';

import {ChevronLeftIcon, ChevronRightIcon} from '~/components/ui/icons';
import LocalizedLink from '~/components/ui/localized-link';
import {
  announcementConfig,
  type AnnouncementItem,
  type Countdown,
  type Device,
  type Variant,
} from '~/lib/announcements';

const STORAGE_KEY = 'announcement-dismissed';
const CLOSE_MS = 300;

const VARIANTS: Record<Variant, string> = {
  lime: 'bg-(--color-brand-primary) text-foreground',
  lavender: 'bg-(--color-brand-secondary) text-foreground',
  dark: 'bg-primary text-primary-foreground',
};

function endTime(id: string, c: Countdown): number {
  if (c.type === 'fixed') return new Date(c.ends).getTime();
  const span = c.hours * 3600000;
  try {
    const key = `announcement-evergreen-${id}`;
    const saved = Number(localStorage.getItem(key));
    if (saved > Date.now()) return saved;
    const end = Date.now() + span;
    localStorage.setItem(key, String(end));
    return end;
  } catch {
    return Date.now() + span;
  }
}

function format(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const pad = (n: number) => String(n).padStart(2, '0');
  const clock = `${pad(Math.floor((s % 86400) / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  return d > 0 ? `${d}d ${clock}` : clock;
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

export function Announcement() {
  if (!announcementConfig.enabled) return null;
  const {campaignId, dismissible, autoRotate, intervalMs, labels, items} = announcementConfig;
  return (
    <AnnouncementBar
      campaignId={campaignId}
      dismissible={dismissible}
      intervalMs={autoRotate ? intervalMs : 0}
      labels={labels}
      items={items}
    />
  );
}

function AnnouncementBar({
  campaignId,
  items,
  dismissible = true,
  intervalMs = 6000,
  labels,
}: {
  campaignId: string;
  items: AnnouncementItem[];
  dismissible?: boolean;
  intervalMs?: number; // 0 turns auto-rotate off
  labels: {dismiss: string; previous: string; next: string};
}) {
  const [phase, setPhase] = useState<'open' | 'closing' | 'gone'>('open');
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [ends, setEnds] = useState<Record<string, number>>({});
  const [now, setNow] = useState<number | null>(null);
  const [device, setDevice] = useState<Device | null>(null);

  useEffect(() => {
    if (!dismissible) return;
    try {
      if (localStorage.getItem(STORAGE_KEY) === campaignId) setPhase('gone');
    } catch {
      /* storage unavailable */
    }
  }, [campaignId, dismissible]);

  useEffect(() => {
    const e: Record<string, number> = {};
    for (const i of items) if (i.countdown) e[i.id] = endTime(i.id, i.countdown);
    setEnds(e);
    setNow(Date.now());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

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

  const hasTimer = Object.keys(ends).length > 0;
  useEffect(() => {
    if (!hasTimer) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [hasTimer]);

  // Items for other devices, or whose countdown has run out, are skipped.
  const list = items.filter((i) => {
    if (i.devices && (device === null || !i.devices.includes(device))) return false;
    const e = ends[i.id];
    return !(i.countdown && now !== null && e !== undefined && e <= now);
  });
  const count = list.length;

  useEffect(() => {
    if (count < 2 || paused || phase !== 'open' || intervalMs <= 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), intervalMs);
    return () => clearInterval(timer);
  }, [count, paused, phase, intervalMs]);

  const current = list[index % Math.max(count, 1)];
  if (phase === 'gone' || !current) return null;

  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);
  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, campaignId);
    } catch {
      /* storage unavailable */
    }
    setPhase('closing');
    window.setTimeout(() => setPhase('gone'), CLOSE_MS);
  };

  const underline = 'underline underline-offset-2';
  const arrowBtn = 'shrink-0 rounded-full p-0.5 hover:opacity-70';
  const end = ends[current.id];
  const remaining = current.countdown && now !== null && end !== undefined ? end - now : null;

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
            VARIANTS[current.variant ?? 'lavender'],
          )}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          {count > 1 && (
            <button type="button" onClick={() => go(-1)} aria-label={labels.previous} className={arrowBtn}>
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
            <button type="button" onClick={() => go(1)} aria-label={labels.next} className={arrowBtn}>
              <ChevronRightIcon className="size-5" aria-hidden="true" />
            </button>
          )}
          {dismissible && (
            <button
              type="button"
              onClick={dismiss}
              aria-label={labels.dismiss}
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
