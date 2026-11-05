// Path: app/lib/collection-browse.ts
// Browse state <-> URL, using the same Liquid-style keys as Shopify themes and the Next.js storefront:
//   ?sort_by=price-ascending&filter.v.availability=1&filter.p.vendor=Aventon&filter.v.price.gte=500
// Parsing and serializing are ported from Hydrogen's collection URL helpers (2026.10 preview),
// which this Hydrogen version does not ship.
import type {ProductFilter} from '@shopify/hydrogen/storefront-api-types';

export const PRODUCTS_PER_PAGE = 48;

export const SORT_OPTIONS = [
  {value: 'manual', label: 'Best Matches'},
  {value: 'best-selling', label: 'Best Selling'},
  {value: 'title-ascending', label: 'Name: A-Z'},
  {value: 'title-descending', label: 'Name: Z-A'},
  {value: 'price-ascending', label: 'Price: Low to High'},
  {value: 'price-descending', label: 'Price: High to Low'},
  {value: 'created-ascending', label: 'Date: Old to New'},
  {value: 'created-descending', label: 'Date: New to Old'},
] as const;

// Storefront search() only sorts by RELEVANCE and PRICE.
export const SEARCH_SORT_EXCLUDE: string[] = [
  'best-selling',
  'created-ascending',
  'created-descending',
  'title-ascending',
  'title-descending',
];

export type CollectionSortKey =
  | 'COLLECTION_DEFAULT'
  | 'BEST_SELLING'
  | 'CREATED'
  | 'PRICE'
  | 'TITLE';

const SORT_KEYS: Record<string, CollectionSortKey> = {
  'best-selling': 'BEST_SELLING',
  title: 'TITLE',
  price: 'PRICE',
  created: 'CREATED',
};

export function parseSortBy(value?: string | null): {
  sortKey: CollectionSortKey;
  reverse: boolean;
} {
  if (!value || value === 'manual') return {sortKey: 'COLLECTION_DEFAULT', reverse: false};
  const match = value.match(/^(best-selling|title|price|created)(?:-(ascending|descending))?$/);
  if (!match) return {sortKey: 'COLLECTION_DEFAULT', reverse: false};
  return {sortKey: SORT_KEYS[match[1]], reverse: match[2] === 'descending'};
}

export type BrowseState = {filters: ProductFilter[]; sortBy: string};

export function parseBrowseParams(search: string | URLSearchParams): BrowseState {
  const params = typeof search === 'string' ? new URLSearchParams(search) : search;
  return {filters: parseProductFilters(params), sortBy: params.get('sort_by') || 'manual'};
}

export function serializeBrowseParams(state: BrowseState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.sortBy && state.sortBy !== 'manual') params.set('sort_by', state.sortBy);
  for (const filter of state.filters) appendFilter(params, filter);
  return params;
}

export function toBrowseHref(state: BrowseState): string {
  const query = serializeBrowseParams(state).toString();
  return query ? `?${query}` : '?';
}

function parseNumber(value: string): number {
  const parsed = Number(value.replace(/,/g, ''));
  return Number.isNaN(parsed) ? Number(value.replace(/[^\d.]/g, '')) || 0 : parsed;
}

function decodePart(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch {
    return value;
  }
}

function parseProductFilters(params: URLSearchParams): ProductFilter[] {
  const filters: ProductFilter[] = [];

  const price: {min?: number; max?: number} = {};
  const min = params.get('filter.v.price.gte');
  const max = params.get('filter.v.price.lte');
  if (min) price.min = parseNumber(min);
  if (max) price.max = parseNumber(max);
  if (price.min !== undefined || price.max !== undefined) filters.push({price});

  const availability = params.getAll('filter.v.availability');
  const inStock = availability.includes('1');
  const outOfStock = availability.includes('0');
  if (inStock && !outOfStock) filters.push({available: true});
  if (outOfStock && !inStock) filters.push({available: false});

  for (const productType of params.getAll('filter.p.product_type')) {
    if (productType) filters.push({productType});
  }
  for (const productVendor of params.getAll('filter.p.vendor')) {
    if (productVendor) filters.push({productVendor});
  }
  for (const tag of params.getAll('filter.p.tag')) {
    if (tag) filters.push({tag});
  }

  params.forEach((value, key) => {
    if (!value) return;
    let match: RegExpMatchArray | null;
    if ((match = key.match(/^filter\.v\.option\.(.+)$/))) {
      filters.push({variantOption: {name: decodePart(match[1]), value}});
    } else if ((match = key.match(/^filter\.p\.m\.([^.]+)\.(.+)$/))) {
      filters.push({
        productMetafield: {namespace: decodePart(match[1]), key: decodePart(match[2]), value},
      });
    } else if ((match = key.match(/^filter\.v\.m\.([^.]+)\.(.+)$/))) {
      filters.push({
        variantMetafield: {namespace: decodePart(match[1]), key: decodePart(match[2]), value},
      });
    } else if ((match = key.match(/^filter\.v\.t\.([^.]+)\.(.+)$/))) {
      filters.push({
        taxonomyMetafield: {namespace: decodePart(match[1]), key: decodePart(match[2]), value},
      });
    }
  });

  return filters;
}

function appendFilter(params: URLSearchParams, filter: ProductFilter) {
  if (filter.available != null) {
    params.append('filter.v.availability', filter.available ? '1' : '0');
  }
  if (filter.price) {
    if (filter.price.min != null) params.append('filter.v.price.gte', String(filter.price.min));
    if (filter.price.max != null) params.append('filter.v.price.lte', String(filter.price.max));
  }
  if (filter.productType != null) params.append('filter.p.product_type', filter.productType);
  if (filter.productVendor != null) params.append('filter.p.vendor', filter.productVendor);
  if (filter.tag != null) params.append('filter.p.tag', filter.tag);
  if (filter.variantOption) {
    params.append(
      `filter.v.option.${encodeURIComponent(filter.variantOption.name)}`,
      filter.variantOption.value ?? '',
    );
  }
  if (filter.productMetafield) {
    const {namespace, key, value} = filter.productMetafield;
    params.append(
      `filter.p.m.${encodeURIComponent(namespace)}.${encodeURIComponent(key)}`,
      value ?? '',
    );
  }
  if (filter.variantMetafield) {
    const {namespace, key, value} = filter.variantMetafield;
    params.append(
      `filter.v.m.${encodeURIComponent(namespace)}.${encodeURIComponent(key)}`,
      value ?? '',
    );
  }
  if (filter.taxonomyMetafield) {
    const {namespace, key, value} = filter.taxonomyMetafield;
    params.append(`filter.v.t.${encodeURIComponent(namespace)}.${encodeURIComponent(key)}`, value);
  }
}

export function parseFilterInput(input: string): ProductFilter | undefined {
  try {
    const value: unknown = JSON.parse(input);
    return value && typeof value === 'object' ? (value as ProductFilter) : undefined;
  } catch {
    return undefined;
  }
}

function stable(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']';
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return (
      '{' +
      Object.keys(record)
        .sort()
        .map((key) => JSON.stringify(key) + ':' + stable(record[key]))
        .join(',') +
      '}'
    );
  }
  return JSON.stringify(value);
}

export function filterEquals(a: ProductFilter, b: ProductFilter): boolean {
  return stable(a) === stable(b);
}

export function isFilterInputActive(filters: ProductFilter[], input: string): boolean {
  const target = parseFilterInput(input);
  return target ? filters.some((filter) => filterEquals(filter, target)) : false;
}

export function toggleFilterInput(filters: ProductFilter[], input: string): ProductFilter[] {
  const target = parseFilterInput(input);
  if (!target) return filters;
  return filters.some((filter) => filterEquals(filter, target))
    ? filters.filter((filter) => !filterEquals(filter, target))
    : [...filters, target];
}

export function getPriceFilter(filters: ProductFilter[]) {
  return filters.find((filter) => filter.price)?.price;
}

export function setPriceFilter(
  filters: ProductFilter[],
  min: number | null,
  max: number | null,
): ProductFilter[] {
  const next = filters.filter((filter) => !filter.price);
  if (min !== null || max !== null) {
    next.push({price: {...(min !== null ? {min} : {}), ...(max !== null ? {max} : {})}});
  }
  return next;
}
