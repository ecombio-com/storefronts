import type {ProductSpec, TrustBadge} from '~/lib/product';

const FALLBACK = ['2 Year Warranty', 'UL Safety Certified', '30-Day Returns', 'Fast Shipping'];

export function TrustBadges({badges}: {badges: TrustBadge[]}) {
  const items = badges.length ? badges : FALLBACK.map((title) => ({title}) as TrustBadge);
  return (
    <ul className="grid gap-2">
      {items.map((b) => {
        const body = (
          <>
            {b.iconUrl ? (
              <img src={b.iconUrl} alt={b.iconAlt || ''} loading="lazy" className="size-8 shrink-0 object-contain" />
            ) : (
              <span aria-hidden className="grid size-8 shrink-0 place-items-center">✓</span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block text-base font-semibold leading-snug">{b.title}</span>
              {b.tooltip ? (
                <span className="line-clamp-2 block text-sm leading-snug opacity-70">{b.tooltip}</span>
              ) : null}
            </span>
          </>
        );
        const cls = 'flex w-full items-center gap-4 rounded-lg bg-[#dce4ff] px-4 py-3 text-left';
        return (
          <li key={b.title}>
            {b.href ? (
              <a href={b.href} target="_blank" rel="noopener noreferrer" className={`${cls} hover:brightness-95`}>
                {body}
              </a>
            ) : (
              <div className={cls}>{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function SpecCarousel({specs}: {specs: ProductSpec[]}) {
  if (!specs.length) return null;
  return (
    <section className="grid gap-3" aria-label="At a glance">
      <div>
        <h2 className="text-lg font-semibold">At a glance</h2>
        <p className="text-sm text-muted-foreground">Full details in Technical Specifications below</p>
      </div>
      <ul className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2">
        {specs.map((s) => {
          const body = (
            <>
              {s.iconUrl ? (
                <img src={s.iconUrl} alt={s.iconAlt || ''} loading="lazy" className="size-8 shrink-0 object-contain" />
              ) : null}
              <span className="block">
                <span className="block text-sm opacity-70">{s.label}</span>
                <span className="block text-base font-semibold leading-snug">{s.value}</span>
              </span>
            </>
          );
          const cls = 'flex h-full min-h-28 flex-col justify-between gap-2 rounded-lg bg-[linear-gradient(135deg,#eef1ff,#dce4ff)] p-4';
          return (
            <li key={s.label} title={s.tooltip} className="w-44 shrink-0 snap-start">
              {s.href ? (
                <a href={s.href} target="_blank" rel="noopener noreferrer" className={`${cls} hover:opacity-80`}>
                  {body}
                </a>
              ) : (
                <div className={cls}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
