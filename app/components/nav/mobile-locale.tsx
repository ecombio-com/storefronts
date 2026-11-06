import {cn} from 'cn';
import {Check} from 'lucide-react';
import {useState} from 'react';
import {useLocation} from 'react-router';

import {Flag} from '~/components/nav/locale-bar';
import {ChevronDownIcon} from '~/components/ui/icons';
import {
  languageLabel,
  localeFromPath,
  localeHref,
  MARKETS,
  primaryLocale,
  regionName,
} from '~/lib/locale-switch';

// All visible text in one place, ready to move into use-intl.
const COPY = {
  language: 'Language',
};

export function MobileLocale() {
  const {hash, pathname, search} = useLocation();
  const current = localeFromPath(pathname);
  const [open, setOpen] = useState(false);

  const market = MARKETS.find((m) => m.locales.includes(current)) ?? MARKETS[0];
  if (!market) return null;

  const hrefFor = (locale: string) => localeHref(locale, pathname, search, hash);
  const others = MARKETS.filter((m) => m !== market).sort((a, b) =>
    regionName(a.code).localeCompare(regionName(b.code)),
  );
  const canExpand = others.length > 0;
  const label = (
    <>
      <Flag code={market.code} />
      <span className="flex-1 text-ds-regular font-medium">{regionName(market.code)}</span>
    </>
  );
  const box = 'flex w-full items-center gap-3 rounded-ds-md border border-border px-3 py-3 text-left';

  return (
    <div className="flex flex-col gap-3">
      {canExpand ? (
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-country-list"
          onClick={() => setOpen((v) => !v)}
          className={box}
        >
          {label}
          <ChevronDownIcon
            className={cn('size-5 transition-transform duration-200 motion-reduce:transition-none', open && 'rotate-180')}
            aria-hidden="true"
          />
        </button>
      ) : (
        <div className={box}>{label}</div>
      )}

      {open && canExpand && (
        <ul id="mobile-country-list" className="max-h-60 overflow-y-auto overscroll-contain rounded-ds-md border border-border">
          {others.map((m) => (
            <li key={m.code} className="border-b border-border last:border-b-0">
              <a
                href={hrefFor(primaryLocale(m))}
                hrefLang={primaryLocale(m)}
                className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-muted"
              >
                <Flag code={m.code} />
                <span className="flex-1">{regionName(m.code)}</span>
                <span className="text-muted-foreground" lang={primaryLocale(m)}>
                  {languageLabel(primaryLocale(m))}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}

      {market.locales.length > 1 && (
        <div role="group" aria-label={COPY.language} className="flex flex-wrap gap-2">
          {market.locales.map((locale) => {
            const pill = 'flex items-center gap-1.5 rounded-full border px-4 py-2 text-ds-regular';
            return locale === current ? (
              <span
                key={locale}
                lang={locale}
                aria-current="true"
                className={cn(pill, 'border-foreground bg-foreground text-background')}
              >
                <Check className="size-3.5" aria-hidden="true" />
                {languageLabel(locale)}
              </span>
            ) : (
              <a
                key={locale}
                href={hrefFor(locale)}
                hrefLang={locale}
                lang={locale}
                className={cn(pill, 'border-border hover:bg-muted')}
              >
                {languageLabel(locale)}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
