// Path: app/components/blog/card-row.tsx
import {Children, useCallback, useEffect, useRef, useState, type ReactNode} from 'react';

const ARROW =
  'inline-flex size-9 items-center justify-center rounded-full bg-(--color-text-dark) text-(--color-text-light) transition-opacity disabled:opacity-30';

export function CardRow({
  action,
  children,
  id,
  title,
}: {
  /** Rendered under the row, right-aligned (e.g. a "View all" link). */
  action?: ReactNode;
  children: ReactNode;
  id: string;
  title: string;
}) {
  const track = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({end: false, overflow: false, start: true});

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdges({
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1,
      overflow: el.scrollWidth > el.clientWidth + 1,
      start: el.scrollLeft <= 1,
    });
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  const page = (direction: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({behavior: 'smooth', left: direction * el.clientWidth * 0.9});
  };

  return (
    <section aria-labelledby={`${id}-title`} className="py-(--spacer-large)" id={id}>
      <div className="flex items-center justify-between gap-(--spacer-regular)">
        <h2 className="font-semibold text-ds-medium" id={`${id}-title`}>
          {title}
        </h2>
        {edges.overflow ? (
          <div className="flex gap-(--spacer-xsmall)">
            <button
              aria-label={`Previous ${title} articles`}
              className={ARROW}
              disabled={edges.start}
              onClick={() => page(-1)}
              type="button"
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              aria-label={`Next ${title} articles`}
              className={ARROW}
              disabled={edges.end}
              onClick={() => page(1)}
              type="button"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        ) : null}
      </div>
      <ul
        className="mt-(--spacer-regular) flex snap-x snap-mandatory gap-(--grid-gutter) overflow-x-auto py-(--spacer-xsmall) [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={measure}
        ref={track}
      >
        {Children.toArray(children).map((child, index) => (
          <li
            className="flex w-64 shrink-0 snap-start sm:w-72 lg:w-[calc((100%_-_3*var(--grid-gutter))_/_4)] [&>article]:w-full"
            key={index}
          >
            {child}
          </li>
        ))}
      </ul>
      {action ? <div className="mt-(--spacer-regular) flex justify-end">{action}</div> : null}
    </section>
  );
}

export function LoadMoreGrid({
  className,
  items,
  pageSize = 6,
}: {
  className?: string;
  items: ReactNode[];
  pageSize?: number;
}) {
  const [visible, setVisible] = useState(pageSize);
  const shown = Math.min(visible, items.length);
  return (
    <>
      <div className={className}>{items.slice(0, visible)}</div>
      {items.length > 0 ? (
        <div className="grid justify-items-center gap-3">
          {visible < items.length ? (
            <button
              className="bg-foreground px-6 py-3 font-medium text-background text-ds-small"
              onClick={() => setVisible((count) => count + pageSize)}
              type="button"
            >
              Load More
            </button>
          ) : null}
          <p className="text-muted-foreground text-ds-small">
            Viewing 1 - {shown} of {items.length} articles
          </p>
        </div>
      ) : null}
    </>
  );
}
