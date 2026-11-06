import {cn} from 'cn';
import {Search, X} from 'lucide-react';
import {Fragment, useEffect, useRef, useState} from 'react';
import {useLocation} from 'react-router';

import {ChevronDownIcon} from '~/components/ui/icons';
import {
  languageLabel,
  localeFromPath,
  localeHref,
  type Market,
  MARKETS,
  primaryLocale,
  regionName,
} from '~/lib/locale-switch';
import {flagUrl} from '~/lib/zip/countries';

// All visible text in one place, ready to move into use-intl.
const COPY = {
  changeWarning:
    'Changing your location might affect your delivery address options, price, product availability, and currency.',
  chooseLocation: 'Choose location',
  clearSearch: 'Clear search',
  close: 'Close',
  currentCountryLanguage: 'Current country & language',
  language: 'Language',
  noResults: 'No matches',
  resultsCount: (n: number) => `${n} ${n === 1 ? 'country' : 'countries'} found`,
  searchPlaceholder: 'Search country or language',
};

const ROW =
  'flex w-full items-center gap-2 rounded-ds-md px-2 py-2.5 text-left hover:bg-muted focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30';

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export function Flag({code}: {code: string}) {
  return (
    <img src={flagUrl(code)} alt="" width={20} height={14} className="h-3.5 w-5 shrink-0 object-cover" />
  );
}

export function LanguageLinks({
  current,
  hrefFor,
  locales,
}: {
  current: string;
  hrefFor: (locale: string) => string;
  locales: string[];
}) {
  return (
    <div role="group" aria-label={COPY.language} className="flex items-center gap-2">
      {locales.map((locale, i) => (
        <Fragment key={locale}>
          {i > 0 && <span className="h-4 w-px bg-border" aria-hidden="true" />}
          {locale === current ? (
            <span aria-current="true" lang={locale} className="font-semibold underline underline-offset-2">
              {languageLabel(locale)}
            </span>
          ) : (
            <a
              href={hrefFor(locale)}
              hrefLang={locale}
              lang={locale}
              className="underline underline-offset-2 hover:opacity-70"
            >
              {languageLabel(locale)}
            </a>
          )}
        </Fragment>
      ))}
    </div>
  );
}

export function LocaleBar() {
  const {hash, pathname, search} = useLocation();
  const current = localeFromPath(pathname);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    // The header hides on scroll, so the panel closes with it.
    const onScroll = () => setOpen(false);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll);
    };
  }, [open]);

  const market = MARKETS.find((m) => m.locales.includes(current)) ?? MARKETS[0];
  if (!market) return null;

  const hrefFor = (locale: string) => localeHref(locale, pathname, search, hash);
  const multiLanguage = market.locales.length > 1;
  const needle = normalize(query.trim());
  const matches = (m: Market) =>
    normalize([regionName(m.code), m.code, ...m.locales.map(languageLabel)].join(' ')).includes(needle);
  const others = MARKETS.filter((m) => m !== market && matches(m)).sort((a, b) =>
    regionName(a.code).localeCompare(regionName(b.code)),
  );
  const resultCount = others.length + (matches(market) ? 1 : 0);

  return (
    <div ref={rootRef} className="relative flex items-center gap-3">
      <button
        ref={triggerRef}
        type="button"
        aria-label={COPY.chooseLocation}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="location-panel"
        onClick={() => {
          setQuery('');
          setOpen((v) => !v);
        }}
        className="flex items-center gap-1 rounded-ds-md p-1 transition-opacity hover:opacity-70"
      >
        <Flag code={market.code} />
        <ChevronDownIcon
          className={cn('size-3.5 transition-transform motion-reduce:transition-none', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {multiLanguage && <LanguageLinks current={current} hrefFor={hrefFor} locales={market.locales} />}

      {open && (
        <div
          id="location-panel"
          role="dialog"
          aria-label={COPY.chooseLocation}
          className="absolute right-0 top-full z-50 mt-2 w-88 max-w-[calc(100vw-2rem)] rounded-ds-lg border border-border bg-popover text-ds-regular font-normal shadow-ds-drop-md"
        >
          <div className="relative flex items-center justify-center px-6 pt-5">
            <h2 className="text-ds-regular font-bold">{COPY.chooseLocation}</h2>
            <button
              type="button"
              aria-label={COPY.close}
              onClick={() => {
                setOpen(false);
                triggerRef.current?.focus();
              }}
              className="absolute right-4 top-3 flex size-9 items-center justify-center rounded-full hover:bg-muted"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="px-6 pb-2 pt-4">
            <p className="text-muted-foreground">{COPY.changeWarning}</p>
            <div className="relative mt-4">
              <input
                ref={searchRef}
                type="text"
                role="searchbox"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  const first = others[0];
                  if (e.key === 'Enter' && first) {
                    e.preventDefault();
                    window.location.assign(hrefFor(primaryLocale(first)));
                  }
                }}
                placeholder={COPY.searchPlaceholder}
                aria-label={COPY.searchPlaceholder}
                autoComplete="off"
                className="h-11 w-full rounded-ds-md border border-border bg-popover pl-3 pr-11 text-ds-regular placeholder:text-foreground/60 focus:border-foreground focus:outline-none"
              />
              {query ? (
                <button
                  type="button"
                  aria-label={COPY.clearSearch}
                  onClick={() => {
                    setQuery('');
                    searchRef.current?.focus();
                  }}
                  className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              ) : (
                <Search
                  className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
            </div>
            <p className="sr-only" aria-live="polite">
              {query ? COPY.resultsCount(resultCount) : ''}
            </p>
          </div>

          <div className="px-6 pt-3">
            <p className="mb-2 font-bold">{COPY.currentCountryLanguage}</p>
            <div className="flex items-center gap-2 py-2" aria-current="true">
              <Flag code={market.code} />
              <span className="flex-1">{regionName(market.code)}</span>
              {multiLanguage ? (
                <LanguageLinks current={current} hrefFor={hrefFor} locales={market.locales} />
              ) : (
                <span className="text-foreground/70" lang={current}>
                  {languageLabel(current)}
                </span>
              )}
            </div>
            <hr className="my-2 border-border" />
          </div>

          <div className="px-6 pb-4">
            <ul className="-ml-2 -mr-4 max-h-72 overflow-y-auto overscroll-contain pr-1">
              {others.map((m) => (
                <li key={m.code}>
                  <a href={hrefFor(primaryLocale(m))} hrefLang={primaryLocale(m)} className={ROW}>
                    <Flag code={m.code} />
                    <span className="flex-1">{regionName(m.code)}</span>
                    <span className="text-foreground/70" lang={primaryLocale(m)}>
                      {languageLabel(primaryLocale(m))}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            {query && resultCount === 0 && <p className="py-2.5 text-muted-foreground">{COPY.noResults}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
