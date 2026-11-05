import {cn} from 'cn';
import {useEffect, useId, useState} from 'react';

import {ChevronLeftIcon, ChevronRightIcon} from '~/components/ui/icons';
import type {ProductSpec} from '~/lib/product';

const COPY = {
  title: 'At a glance',
  previous: 'Previous specs',
  next: 'Next specs',
};

const CARD =
  'flex h-full min-h-28 flex-col justify-between gap-ds-small rounded-ds-lg bg-[linear-gradient(135deg,var(--color-secondary-100),var(--color-secondary-200))] p-ds-regular text-left';

const NAV_BUTTON =
  'flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:bg-muted disabled:text-foreground/40';

function SpecCard({spec}: {spec: ProductSpec}) {
  const body = (
    <>
      {spec.iconUrl ? (
        <img
          src={spec.iconUrl}
          alt={spec.iconAlt || ''}
          className="size-8 shrink-0 object-contain"
          loading="lazy"
        />
      ) : null}
      <span className="block">
        <span className="block text-ds-small text-foreground/70">{spec.label}</span>
        <span className="block text-ds-regular font-semibold leading-snug text-foreground">
          {spec.value}
        </span>
      </span>
    </>
  );

  return (
    <li className="w-44 shrink-0 snap-start" title={spec.tooltip}>
      {spec.href ? (
        <a
          href={spec.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(CARD, 'transition-opacity hover:opacity-80')}
        >
          {body}
        </a>
      ) : (
        <div className={CARD}>{body}</div>
      )}
    </li>
  );
}

export function SpecCarousel({
  specs,
  title = COPY.title,
  subtitle,
  className,
}: {
  specs?: ProductSpec[];
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  const titleId = useId();
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
  const [edges, setEdges] = useState({atStart: true, atEnd: true});

  useEffect(() => {
    if (!scroller) return;
    const sync = () => {
      const max = scroller.scrollWidth - scroller.clientWidth;
      setEdges({atStart: scroller.scrollLeft <= 1, atEnd: scroller.scrollLeft >= max - 1});
    };
    sync();
    scroller.addEventListener('scroll', sync, {passive: true});
    const observer = new ResizeObserver(sync);
    observer.observe(scroller);
    if (scroller.firstElementChild) observer.observe(scroller.firstElementChild);
    return () => {
      scroller.removeEventListener('scroll', sync);
      observer.disconnect();
    };
  }, [scroller]);

  if (!specs || specs.length === 0) return null;

  const overflowing = !(edges.atStart && edges.atEnd);
  const page = (direction: 1 | -1) => {
    if (!scroller) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    scroller.scrollBy({
      left: direction * scroller.clientWidth * 0.8,
      behavior: reduce ? 'auto' : 'smooth',
    });
  };

  return (
    <div data-slot="spec-carousel" className={cn('grid gap-ds-regular', className)}>
      <div className="flex items-end justify-between gap-ds-regular">
        <div className="min-w-0">
          <h2 id={titleId} className="text-ds-medium font-semibold text-foreground">
            {title}
          </h2>
          {subtitle ? <p className="text-ds-regular text-muted-foreground">{subtitle}</p> : null}
        </div>
        <div className={cn('hidden shrink-0 gap-ds-small md:flex', !overflowing && 'invisible')}>
          <button
            type="button"
            aria-label={COPY.previous}
            disabled={edges.atStart}
            onClick={() => page(-1)}
            className={NAV_BUTTON}
          >
            <ChevronLeftIcon className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={COPY.next}
            disabled={edges.atEnd}
            onClick={() => page(1)}
            className={NAV_BUTTON}
          >
            <ChevronRightIcon className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={setScroller}
        role="region"
        aria-roledescription="carousel"
        aria-labelledby={titleId}
        tabIndex={0}
        className="scrollbar-hide snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-ds-lg focus-visible:ring-2 focus-visible:ring-foreground"
      >
        <ul className="flex w-max gap-ds-small">
          {specs.map((spec) => (
            <SpecCard key={spec.label} spec={spec} />
          ))}
        </ul>
      </div>
    </div>
  );
}
