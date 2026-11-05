import {
  BadgeCheck,
  ChevronRight,
  RotateCcw,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from 'lucide-react';

import type {ProductSpec, TrustBadge} from '~/lib/product';

const COPY = {
  warranty: '2 Year Warranty',
  safety: 'UL Safety Certified',
  returns: '30-Day Returns',
  shipping: 'Fast Shipping',
};

// Shown until custom.trust_badges returns data.
const FALLBACK_BADGES: {icon: LucideIcon; label: string}[] = [
  {icon: ShieldCheck, label: COPY.warranty},
  {icon: BadgeCheck, label: COPY.safety},
  {icon: RotateCcw, label: COPY.returns},
  {icon: Truck, label: COPY.shipping},
];

const CARD =
  'flex w-full items-center gap-ds-regular rounded-ds-lg bg-[#dce4ff] px-ds-regular py-ds-small text-left';

const CARD_LINK = `${CARD} transition hover:brightness-95`;

const SPEC_ROW = 'flex items-start gap-3';

function BadgeCard({badge}: {badge: TrustBadge}) {
  const content = (
    <>
      <span className="flex size-10 shrink-0 items-center justify-center">
        {badge.iconUrl ? (
          <img
            src={badge.iconUrl}
            alt={badge.iconAlt || ''}
            className="size-8 object-contain"
            loading="lazy"
          />
        ) : (
          <BadgeCheck aria-hidden="true" className="size-6" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-ds-regular font-semibold leading-snug text-foreground">
          {badge.title}
        </span>
        {badge.tooltip ? (
          <span className="mt-ds-xxsmall line-clamp-2 block text-ds-small leading-snug text-foreground/70">
            {badge.tooltip}
          </span>
        ) : null}
      </span>
      {badge.href ? <ChevronRight aria-hidden="true" className="size-5 shrink-0" /> : null}
    </>
  );

  return (
    <li>
      {badge.href ? (
        <a href={badge.href} target="_blank" rel="noopener noreferrer" className={CARD_LINK}>
          {content}
        </a>
      ) : (
        <div className={CARD}>{content}</div>
      )}
    </li>
  );
}

function SpecItem({spec}: {spec: ProductSpec}) {
  const content = (
    <>
      {spec.iconUrl ? (
        <img
          src={spec.iconUrl}
          alt={spec.iconAlt || ''}
          className="mt-0.5 size-7 shrink-0 object-contain"
          loading="lazy"
        />
      ) : null}
      <div className="min-w-0">
        <p className="text-muted-foreground text-ds-tiny tracking-wide uppercase">{spec.label}</p>
        <p className="text-foreground text-ds-regular font-semibold">{spec.value}</p>
      </div>
    </>
  );

  return (
    <li title={spec.tooltip}>
      {spec.href ? (
        <a
          href={spec.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${SPEC_ROW} hover:opacity-80`}
        >
          {content}
        </a>
      ) : (
        <div className={SPEC_ROW}>{content}</div>
      )}
    </li>
  );
}

export function ProductHighlights({
  badges,
  specs,
  part = 'all',
}: {
  badges?: TrustBadge[];
  specs?: ProductSpec[];
  part?: 'all' | 'badges' | 'specs';
}) {
  const hasBadges = !!badges && badges.length > 0;
  const showSpecs = part !== 'badges' && !!specs && specs.length > 0;
  const showBadges = part !== 'specs';
  if (!showSpecs && !showBadges) return null;

  return (
    <div className={part === 'badges' ? 'grid gap-ds-regular' : 'mt-ds-large grid gap-ds-large'}>
      {showSpecs ? (
        <ul className="grid grid-cols-2 gap-x-ds-regular gap-y-ds-medium sm:grid-cols-3 lg:grid-cols-6">
          {specs.map((spec) => (
            <SpecItem key={spec.label} spec={spec} />
          ))}
        </ul>
      ) : null}

      {showBadges ? (
        <ul className="grid gap-ds-small">
          {hasBadges
            ? badges.map((badge) => <BadgeCard key={badge.title} badge={badge} />)
            : FALLBACK_BADGES.map(({icon: Icon, label}) => (
                <li key={label}>
                  <div className={CARD}>
                    <span className="flex size-10 shrink-0 items-center justify-center">
                      <Icon className="size-6" aria-hidden="true" />
                    </span>
                    <span className="text-ds-regular font-semibold leading-snug text-foreground">
                      {label}
                    </span>
                  </div>
                </li>
              ))}
        </ul>
      ) : null}
    </div>
  );
}
