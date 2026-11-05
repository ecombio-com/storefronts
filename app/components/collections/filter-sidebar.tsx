// Path: app/components/collections/filter-sidebar.tsx
import type {ProductFilter} from '@shopify/hydrogen/storefront-api-types';
import {cn} from 'cn';
import {CheckIcon, SlidersHorizontalIcon, XIcon} from 'lucide-react';
import {useState, type ReactNode} from 'react';
import {Link, useNavigate, useSearchParams} from 'react-router';
import {ChevronDownIcon} from '~/components/ui/icons';
import {Input} from '~/components/ui/input';
import {Sheet, SheetContent, SheetTitle, SheetTrigger} from '~/components/ui/sheet';
import {Swatch} from '~/components/ui/swatch';
import {
  getPriceFilter,
  isFilterInputActive,
  parseBrowseParams,
  setPriceFilter,
  toBrowseHref,
  toggleFilterInput,
} from '~/lib/collection-browse';
import {getActiveFilterBadges, type Filter, type PriceRange} from '~/lib/collection-filters';

const BADGE =
  'inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-ds-small font-semibold transition-colors';

function Section({title, children}: {title: string; children: ReactNode}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="flex flex-col gap-2.5">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex cursor-pointer items-center justify-between gap-2 text-left text-ds-regular font-semibold text-muted-foreground"
      >
        <span>{title}</span>
        <ChevronDownIcon
          aria-hidden="true"
          className={cn('size-5 shrink-0 transition-transform', !open && '-rotate-90')}
        />
      </button>
      {open ? children : null}
    </div>
  );
}

function PriceInputs({
  max,
  min,
  onApply,
}: {
  max: number | null;
  min: number | null;
  onApply: (min: number | null, max: number | null) => void;
}) {
  const [low, setLow] = useState(min?.toString() ?? '');
  const [high, setHigh] = useState(max?.toString() ?? '');
  const toNumber = (value: string) => {
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) || parsed < 0 ? null : parsed;
  };
  const field = 'flex h-8 flex-1 items-center rounded-ds-md border border-border bg-card px-2.5';
  const input =
    'h-auto border-0 bg-transparent px-1 shadow-none outline-none focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';
  return (
    <div className="flex items-center gap-2">
      <div className={field}>
        <span className="text-ds-regular text-muted-foreground">$</span>
        <Input type="number" step="0.01" min="0" placeholder="From" value={low} onChange={(e) => setLow(e.target.value)} className={input} />
      </div>
      <span className="text-muted-foreground">–</span>
      <div className={field}>
        <span className="text-ds-regular text-muted-foreground">$</span>
        <Input type="number" step="0.01" min="0" placeholder="To" value={high} onChange={(e) => setHigh(e.target.value)} className={input} />
      </div>
      <button
        type="button"
        aria-label="Apply price"
        onClick={() => onApply(toNumber(low), toNumber(high))}
        className="flex size-8 cursor-pointer items-center justify-center rounded-ds-md bg-foreground text-background transition-opacity hover:opacity-80"
      >
        <CheckIcon className="size-4" />
      </button>
    </div>
  );
}

export function FilterSidebar({filters, priceRange}: {filters: Filter[]; priceRange?: PriceRange}) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const state = parseBrowseParams(searchParams);
  const badges = getActiveFilterBadges(filters, state.filters);
  const price = getPriceFilter(state.filters);
  const activeCount = badges.length + (price ? 1 : 0);
  const hrefFor = (next: ProductFilter[]) => toBrowseHref({...state, filters: next});
  const priceLabel = price
    ? price.min != null && price.max != null
      ? `$${price.min} - $${price.max}`
      : price.min != null
        ? `From $${price.min}`
        : `Up to $${price.max ?? 0}`
    : '';

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <h2 className="text-ds-medium text-foreground">
          Filters{activeCount > 0 ? <span className="ml-1">({activeCount})</span> : null}
        </h2>
        {activeCount > 0 ? (
          <Link to={hrefFor([])} preventScrollReset className={cn(BADGE, 'bg-foreground/60 text-background hover:bg-foreground/70')}>
            Reset
          </Link>
        ) : null}
      </div>

      {activeCount > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {badges.map((badge) => (
            <Link
              key={`${badge.paramKey}-${badge.value}`}
              to={hrefFor(toggleFilterInput(state.filters, badge.input))}
              preventScrollReset
              className={cn(BADGE, 'bg-primary/15 text-primary hover:bg-primary/25')}
            >
              {badge.label}
              <XIcon className="size-3" />
            </Link>
          ))}
          {price ? (
            <Link
              to={hrefFor(setPriceFilter(state.filters, null, null))}
              preventScrollReset
              className={cn(BADGE, 'bg-primary/15 text-primary hover:bg-primary/25')}
            >
              {priceLabel}
              <XIcon className="size-3" />
            </Link>
          ) : null}
        </div>
      ) : null}

      {priceRange ? (
        <Section title="Price">
          <PriceInputs
            key={`${price?.min ?? ''}:${price?.max ?? ''}`}
            min={price?.min ?? null}
            max={price?.max ?? null}
            onApply={(min, max) =>
              navigate(hrefFor(setPriceFilter(state.filters, min, max)), {preventScrollReset: true})
            }
          />
        </Section>
      ) : null}

      {filters.map((filter) =>
        filter.values.length === 0 ? null : (
          <Section key={filter.id} title={filter.label}>
            {filter.presentation === 'swatch' ? (
              <div className="flex flex-wrap gap-2.5">
                {filter.values.map((value, index) => {
                  const selected = isFilterInputActive(state.filters, value.input);
                  return (
                    <Link
                      key={`${value.id}-${index}`}
                      to={hrefFor(toggleFilterInput(state.filters, value.input))}
                      preventScrollReset
                      aria-label={`Filter by ${filter.label}: ${value.label}`}
                      aria-pressed={selected}
                      className="block cursor-pointer"
                    >
                      <Swatch color={value.swatch?.color} image={value.swatch?.image} label={value.label} selected={selected} />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {filter.values.map((value, index) => {
                  const selected = isFilterInputActive(state.filters, value.input);
                  return (
                    <Link
                      key={`${value.id}-${index}`}
                      to={hrefFor(toggleFilterInput(state.filters, value.input))}
                      preventScrollReset
                      data-selected={selected}
                      className="flex items-center justify-between text-left text-ds-regular text-muted-foreground transition-colors hover:text-foreground data-[selected=true]:font-medium"
                    >
                      <span>
                        {value.label}
                        <span className="text-muted-foreground"> ({value.count})</span>
                      </span>
                      {selected ? <CheckIcon className="size-3.5" /> : null}
                    </Link>
                  );
                })}
              </div>
            )}
          </Section>
        ),
      )}
    </div>
  );
}

export function FilterSheet({children, count}: {children: ReactNode; count: number}) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 rounded-full bg-secondary px-4 py-2 text-ds-regular font-medium hover:bg-secondary/70"
          >
            <SlidersHorizontalIcon className="size-4" />
            <span>Filters</span>
            {count > 0 ? (
              <span className="flex size-5 items-center justify-center rounded-full bg-foreground text-ds-small text-background">
                {count}
              </span>
            ) : null}
          </button>
        }
      />
      <SheetContent side="left" className="gap-0 overflow-y-auto px-5 pb-5">
        <div className="flex h-16 shrink-0 items-center">
          <SheetTitle className="text-ds-medium font-semibold">Filters</SheetTitle>
        </div>
        {children}
      </SheetContent>
    </Sheet>
  );
}
