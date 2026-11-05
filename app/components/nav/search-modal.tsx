import {Dialog as DialogPrimitive} from '@base-ui/react/dialog';
import {Image, Money} from '@shopify/hydrogen';
import {cn} from 'cn';
import {ArrowLeft, ArrowUpLeft, RotateCw, X} from 'lucide-react';
import {
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import {useFetcher, useLocation, useNavigate} from 'react-router';

import {Dialog, DialogTitle, DialogTrigger} from '~/components/ui/dialog';
import {SearchIcon} from '~/components/ui/icons';
import {useUrlLocale} from '~/components/ui/locale-context';
import {quickAccess} from '~/lib/quick-access';
import type {PredictiveSearchReturn} from '~/lib/search';
import {trendingSearches} from '~/lib/trending-searches';

// All visible text in one place, ready to move into use-intl.
const COPY = {
  search: 'Search',
  searchFor: 'Search for',
  lookingFor: 'What are you looking for?',
  recent: 'Recent searches',
  clearRecent: 'Clear all',
  removeRecent: 'Remove',
  trending: 'Trending',
  quickAccess: 'Quick access',
  suggested: 'Suggested',
  products: 'Products',
  viewAll: 'View all results',
  noResults: (q: string) => `No results for "${q}"`,
  noResultsTry: 'Try another word, or browse everything.',
  browseCatalog: 'Browse all products',
  clear: 'Clear',
  back: 'Back',
  close: 'Close',
};
const TERMS: string[] = ['electric bikes', 'electric scooters', 'electric skateboards', 'accessories'];

const LIMIT = 4; // suggestions and products shown (fills the 2x2 product grid)
const DEBOUNCE_MS = 300;
const TYPE_MS = 70;
const DELETE_MS = 20;
const HOLD_MS = 1800;
// Color of the last, 2nd-last and 3rd-last letter while typing or deleting.
const TRAIL = [
  'var(--color-secondary-300)',
  'var(--color-secondary-500)',
  'var(--color-secondary-700)',
];
const RECENT_KEY = 'recent-searches';
const LABEL = 'text-ds-small font-medium text-muted-foreground';

type PredictiveItems = PredictiveSearchReturn['result']['items'];
type PredictiveProduct = PredictiveItems['products'][number];

/* ---------- Helpers ---------- */

function usePrefix() {
  const locale = useUrlLocale();
  return locale ? `/${locale}` : '';
}

function useMediaQuery(query: string): boolean | null {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    },
    [query],
  );
  return useSyncExternalStore<boolean | null>(
    subscribe,
    () => window.matchMedia(query).matches,
    () => null,
  );
}

function withTracking(path: string, trackingParameters?: string | null) {
  return trackingParameters ? `${path}?${trackingParameters}` : path;
}

function searchPath(term: string) {
  return `/search?q=${encodeURIComponent(term)}`;
}

// iOS only opens the keyboard inside a tap, so focus a throwaway input first.
function primeKeyboard() {
  if (!window.matchMedia('(max-width: 47.99rem)').matches) return;
  const el = document.createElement('input');
  el.setAttribute('aria-hidden', 'true');
  el.style.cssText = 'position:fixed;top:0;left:0;opacity:0;width:0;height:0;font-size:16px;';
  document.body.appendChild(el);
  el.focus();
  setTimeout(() => el.remove(), 1200);
}

function readRecent(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const list: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(list)
      ? list.filter((v): v is string => typeof v === 'string').slice(0, 5)
      : [];
  } catch {
    return [];
  }
}

function writeRecent(list: string[]) {
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 5)));
  } catch {
    /* storage unavailable */
  }
}

function saveRecent(term: string) {
  writeRecent([term, ...readRecent().filter((v) => v.toLowerCase() !== term.toLowerCase())]);
}

/* ---------- Header search ---------- */

export function SearchModal() {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const currentTerm = location.pathname.endsWith('/search')
    ? (new URLSearchParams(location.search).get('q') ?? '')
    : '';

  useEffect(() => {
    function onShortcut(event: KeyboardEvent) {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener('keydown', onShortcut);
    return () => document.removeEventListener('keydown', onShortcut);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <SearchTrigger term={currentTerm} />
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-60 transition-opacity duration-200 data-starting-style:opacity-0 data-ending-style:opacity-0 md:bg-scrim md:backdrop-blur-(--scrim-blur)" />
        <DialogPrimitive.Popup
          aria-describedby={undefined}
          initialFocus={inputRef}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          className="fixed inset-0 z-60 flex flex-col bg-popover outline-none transition-opacity duration-200 data-starting-style:opacity-0 data-ending-style:opacity-0 md:block md:bg-transparent"
        >
          <DialogTitle className="sr-only">{COPY.search}</DialogTitle>
          <SearchPanel inputRef={inputRef} initialTerm={currentTerm} onClose={close} />
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}

function SearchTrigger({term}: {term: string}) {
  return (
    <DialogTrigger
      render={
        <button
          type="button"
          onClick={primeKeyboard}
          className="flex h-11 w-full items-center gap-3 rounded-full bg-muted/70 px-5 text-ds-regular text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <SearchIcon className="size-5 shrink-0" />
          <SearchPlaceholder term={term} />
          <span className="sr-only">{COPY.search}</span>
        </button>
      }
    />
  );
}

function SearchPlaceholder({term}: {term: string}) {
  const isDesktop = useMediaQuery('(min-width: 48rem)');

  if (term) {
    return (
      <span aria-hidden="true" className="min-w-0 truncate">
        {term}
      </span>
    );
  }
  if (isDesktop === true) return <RotatingPlaceholder />;
  if (isDesktop === false) {
    return (
      <span aria-hidden="true" className="min-w-0 truncate">
        {COPY.lookingFor}
      </span>
    );
  }
  // Server render and first paint: CSS picks the text until the screen width is known.
  return (
    <>
      <span aria-hidden="true" className="min-w-0 truncate md:hidden">
        {COPY.lookingFor}
      </span>
      <span aria-hidden="true" className="hidden min-w-0 items-center md:flex">
        <span className="mr-1 shrink-0">{COPY.searchFor}</span>
        <span className="truncate">{TERMS[0]}</span>
      </span>
    </>
  );
}

type TypePhase = 'typing' | 'holding' | 'deleting';

// "Search for" stays fixed; only the term after it types, holds, deletes, and swaps.
function RotatingPlaceholder() {
  const [termIndex, setTermIndex] = useState(0);
  const [charCount, setCharCount] = useState((TERMS[0] ?? '').length);
  const [phase, setPhase] = useState<TypePhase>('holding');
  const term = TERMS[termIndex] ?? '';

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (phase === 'holding') {
      timer = setTimeout(() => setPhase('deleting'), HOLD_MS);
    } else if (phase === 'deleting') {
      timer =
        charCount > 0
          ? setTimeout(() => setCharCount(charCount - 1), DELETE_MS)
          : setTimeout(() => {
              setTermIndex((termIndex + 1) % TERMS.length);
              setPhase('typing');
            }, 250);
    } else if (charCount < term.length) {
      timer = setTimeout(() => setCharCount(charCount + 1), TYPE_MS);
    } else {
      timer = setTimeout(() => setPhase('holding'), 0);
    }
    return () => clearTimeout(timer);
  }, [phase, termIndex, charCount, term]);

  const chars = term.slice(0, charCount).split('');
  const moving = phase !== 'holding';

  return (
    <span aria-hidden="true" className="flex min-w-0 items-center">
      <span className="mr-1 shrink-0">{COPY.searchFor}</span>
      <span className="truncate whitespace-pre">
        {chars.map((char, i) => (
          <span
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className={moving ? undefined : 'transition-colors duration-300'}
            style={{color: moving ? TRAIL[chars.length - 1 - i] : undefined}}
          >
            {char}
          </span>
        ))}
      </span>
    </span>
  );
}

/* ---------- Panel ---------- */

function SearchPanel({
  inputRef,
  initialTerm,
  onClose,
}: {
  inputRef: RefObject<HTMLInputElement>;
  initialTerm: string;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const prefix = usePrefix();
  const fetcher = useFetcher<PredictiveSearchReturn>({key: 'search-modal'});
  const load = fetcher.load;
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const [query, setQueryState] = useState(initialTerm);
  const [activeIndex, setActiveIndex] = useState(-1);

  const setQuery = useCallback(
    (next: string) => {
      setQueryState(next);
      setActiveIndex(-1);
      clearTimeout(timer.current);
      const q = next.trim();
      if (!q) return;
      timer.current = setTimeout(() => {
        const params = new URLSearchParams({q, predictive: 'true', limit: String(LIMIT)});
        void load(`${prefix}/search?${params.toString()}`);
      }, DEBOUNCE_MS);
    },
    [load, prefix],
  );

  useEffect(() => {
    if (initialTerm) {
      setQuery(initialTerm);
      requestAnimationFrame(() => inputRef.current?.select());
    }
    return () => clearTimeout(timer.current);
    // Run once per open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = useCallback(
    (path: string) => {
      onClose();
      void navigate(`${prefix}${path}`);
    },
    [navigate, onClose, prefix],
  );

  function goToSearch(value: string) {
    const q = value.trim();
    if (!q) return;
    saveRecent(q);
    go(searchPath(q));
  }

  // Results count only when they match what is typed now, so stale results never flash.
  const term = query.trim();
  const data =
    fetcher.data?.type === 'predictive' && fetcher.data.term === term
      ? fetcher.data.result.items
      : null;
  const queries = data ? data.queries.filter(Boolean).slice(0, LIMIT) : [];
  const products = data ? data.products.slice(0, LIMIT) : [];
  const visibleItems = queries.length + products.length;
  const showResults = term.length > 0;

  const productHref = (p: PredictiveProduct) =>
    withTracking(`/products/${p.handle}`, p.trackingParameters);

  function pickSuggestion(text: string) {
    setQuery(text);
    inputRef.current?.focus();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    goToSearch(query);
  }

  function handleKeyDown(e: ReactKeyboardEvent) {
    if (e.key === 'ArrowDown' && visibleItems > 0) {
      e.preventDefault();
      setActiveIndex(Math.min(activeIndex + 1, visibleItems - 1));
    } else if (e.key === 'ArrowUp' && visibleItems > 0) {
      e.preventDefault();
      setActiveIndex(Math.max(activeIndex - 1, -1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      const suggestion = queries[activeIndex];
      if (suggestion) {
        pickSuggestion(suggestion.text);
        return;
      }
      const product = products[activeIndex - queries.length];
      if (product) go(productHref(product));
    }
  }

  return (
    <div className="h-full w-full md:absolute md:inset-x-0 md:top-0 md:h-auto md:max-h-[85vh] md:overflow-y-auto md:bg-popover md:shadow-ds-drop-lg">
      <div className="h-full overflow-y-auto bg-popover md:mx-auto md:h-auto md:max-w-(--container-max) md:overflow-visible md:px-ds-global md:pb-ds-large">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 px-4 py-3 max-md:sticky max-md:top-0 max-md:z-10 max-md:bg-muted md:px-0 md:py-5"
        >
          <DialogPrimitive.Close className="-ml-1 flex size-9 shrink-0 items-center justify-center rounded-full md:hidden">
            <ArrowLeft className="size-6" aria-hidden="true" />
            <span className="sr-only">{COPY.back}</span>
          </DialogPrimitive.Close>
          <div className="relative flex min-w-0 flex-1 items-center md:h-12 md:rounded-full md:bg-muted md:px-4">
            <SearchIcon
              className="mr-3 hidden size-5 shrink-0 text-muted-foreground md:block"
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              type="search"
              name="q"
              role="combobox"
              placeholder={COPY.lookingFor}
              enterKeyHint="search"
              maxLength={100}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-expanded={showResults && visibleItems > 0}
              aria-controls="search-modal-results"
              aria-activedescendant={
                activeIndex >= 0 ? `search-modal-item-${activeIndex}` : undefined
              }
              autoComplete="off"
              className="w-full min-w-0 flex-1 bg-transparent text-ds-regular text-foreground placeholder:text-muted-foreground focus:outline-none max-md:h-11 max-md:pr-3 md:h-12 [&::-webkit-search-cancel-button]:hidden"
            />
          </div>
          {term && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="shrink-0 rounded-full px-2 text-ds-regular text-muted-foreground transition-colors hover:text-foreground"
            >
              {COPY.clear}
            </button>
          )}
          <DialogPrimitive.Close className="hidden size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:flex">
            <X className="size-5" aria-hidden="true" />
            <span className="sr-only">{COPY.close}</span>
          </DialogPrimitive.Close>
        </form>

        {!showResults && (
          <div className="md:grid md:grid-cols-4 md:gap-ds-large md:pt-2">
            <div className="md:col-span-1">
              <RecentSearches onSelect={goToSearch} />
              {trendingSearches.length > 0 && (
                <div className="px-4 pt-3 md:px-0 md:pt-6">
                  <p className={cn(LABEL, 'mb-3')}>{COPY.trending}</p>
                  <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
                    {trendingSearches.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => goToSearch(t)}
                        className="shrink-0 rounded-full bg-muted px-4 py-2 text-ds-small transition-colors hover:bg-accent hover:text-accent-foreground md:text-ds-regular"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {quickAccess.length > 0 && (
              <div className="hidden md:col-span-3 md:block">
                <p className={cn(LABEL, 'mb-3')}>{COPY.quickAccess}</p>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {quickAccess.slice(0, 4).map((item) => (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => go(item.href)}
                      className="group relative aspect-[4/5] overflow-hidden rounded-ds-md bg-muted text-left"
                    >
                      {item.image ? (
                        <>
                          <img
                            src={item.image}
                            alt=""
                            loading="lazy"
                            className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <span className="absolute inset-x-0 bottom-0 bg-overlay-dark/55 p-3 text-ds-regular font-semibold text-overlay-light">
                            {item.title}
                          </span>
                        </>
                      ) : (
                        <span className="absolute inset-0 flex items-end p-3 text-ds-regular font-semibold">
                          {item.title}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {showResults && (
          <div
            id="search-modal-results"
            role="listbox"
            className="overflow-y-auto overscroll-contain border-t border-border-subtle md:grid md:grid-cols-4 md:gap-ds-large md:overflow-visible md:border-0 md:pt-2"
          >
            {!data && (
              <div className="md:col-span-4">
                <LoadingSkeleton />
              </div>
            )}

            {data && queries.length > 0 && (
              <div className="px-4 pb-2 pt-3 md:col-span-1 md:px-0 md:pt-0">
                <p className={cn(LABEL, 'mb-1 hidden md:block')}>{COPY.suggested}</p>
                {queries.map((s, i) => (
                  <button
                    key={s.text}
                    id={`search-modal-item-${i}`}
                    type="button"
                    role="option"
                    aria-selected={activeIndex === i}
                    onClick={() => pickSuggestion(s.text)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-full px-3 py-2.5 text-left text-ds-regular transition-colors hover:bg-accent/50 max-md:px-0',
                      activeIndex === i && 'bg-accent/50',
                    )}
                  >
                    <SearchIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate">{s.text}</span>
                    <ArrowUpLeft
                      className="size-4 shrink-0 text-muted-foreground md:hidden"
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
            )}

            {data && products.length > 0 && (
              <div className={queries.length > 0 ? 'md:col-span-3' : 'md:col-span-4'}>
                <p className={cn(LABEL, 'px-4 pb-1.5 pt-3 md:px-0 md:pt-0')}>{COPY.products}</p>
                <div className="grid grid-cols-2 gap-3 px-4 md:gap-x-4 md:gap-y-2 md:px-0">
                  {products.map((product, i) => {
                    const index = queries.length + i;
                    return (
                      <ProductResult
                        key={product.id}
                        id={`search-modal-item-${index}`}
                        product={product}
                        active={activeIndex === index}
                        onSelect={() => go(productHref(product))}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {data && visibleItems === 0 && (
              <div className="px-4 py-6 text-ds-regular md:col-span-4 md:px-0">
                <p className="text-foreground">{COPY.noResults(term)}</p>
                <p className="mt-2 text-muted-foreground">{COPY.noResultsTry}</p>
                <button
                  type="button"
                  onClick={() => go('/collections/all')}
                  className="mt-4 rounded-full bg-muted px-5 py-2 text-ds-regular transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {COPY.browseCatalog}
                </button>
              </div>
            )}

            {data && visibleItems > 0 && (
              <div className="flex justify-center px-4 py-3 md:col-span-4 md:pt-6">
                <button
                  type="button"
                  onClick={() => goToSearch(term)}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-8 text-ds-regular font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {COPY.viewAll}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RecentSearches({onSelect}: {onSelect: (term: string) => void}) {
  const [items, setItems] = useState<string[]>([]);
  useEffect(() => {
    setItems(readRecent());
  }, []);
  if (items.length === 0) return null;

  return (
    <div className="px-4 pt-4 md:px-0 md:pt-0">
      <div className="mb-1 flex items-center justify-between">
        <p className={LABEL}>{COPY.recent}</p>
        <button
          type="button"
          onClick={() => {
            writeRecent([]);
            setItems([]);
          }}
          className="text-ds-small text-foreground underline underline-offset-4 hover:opacity-70"
        >
          {COPY.clearRecent}
        </button>
      </div>
      <ul>
        {items.map((t) => (
          <li key={t} className="flex items-center gap-3 py-2.5">
            <RotateCw className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <button
              type="button"
              onClick={() => onSelect(t)}
              className="min-w-0 flex-1 truncate text-left text-ds-regular"
            >
              {t}
            </button>
            <button
              type="button"
              aria-label={`${COPY.removeRecent} ${t}`}
              onClick={() => {
                const next = items.filter((v) => v !== t);
                writeRecent(next);
                setItems(next);
              }}
              className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProductResult({
  id,
  product,
  active,
  onSelect,
}: {
  id: string;
  product: PredictiveProduct;
  active: boolean;
  onSelect: () => void;
}) {
  const variant = product.selectedOrFirstAvailableVariant;
  const image = variant?.image;
  return (
    <button
      id={id}
      type="button"
      role="option"
      aria-selected={active}
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-3 rounded-ds-md px-2 py-2.5 text-left transition-colors hover:bg-accent/50 max-md:flex-col max-md:items-stretch max-md:gap-2 max-md:px-0 max-md:py-0',
        active && 'bg-accent/50',
      )}
    >
      {image ? (
        <Image
          src={image.url}
          alt={image.altText ?? ''}
          width={160}
          height={160}
          sizes="(min-width: 48rem) 80px, 50vw"
          className="size-14 shrink-0 rounded-ds-md bg-muted object-cover max-md:aspect-square max-md:h-auto max-md:w-full md:size-20"
        />
      ) : (
        <div className="size-14 shrink-0 rounded-ds-md bg-muted max-md:aspect-square max-md:h-auto max-md:w-full md:size-20" />
      )}
      <div className="min-w-0 flex-1">
        <div className="line-clamp-2 text-ds-regular text-foreground">{product.title}</div>
        {variant?.price && (
          <Money data={variant.price} className="text-ds-regular text-muted-foreground" />
        )}
      </div>
    </button>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 px-4 py-3 md:px-0">
      <div className="h-4 w-24 animate-pulse rounded-full bg-muted" />
      {['s1', 's2', 's3'].map((key) => (
        <div key={key} className="flex items-center gap-3 py-2.5">
          <div className="size-14 shrink-0 animate-pulse rounded-ds-md bg-muted" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-3/4 animate-pulse rounded-full bg-muted" />
            <div className="h-3 w-1/3 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
