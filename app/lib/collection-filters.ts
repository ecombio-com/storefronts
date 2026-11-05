// Path: app/lib/collection-filters.ts
// Turns Storefront API collection filters into the shape the sidebar renders.
import type {ProductFilter} from '@shopify/hydrogen/storefront-api-types';
import {isFilterInputActive, parseFilterInput} from '~/lib/collection-browse';

export type FilterValue = {
  count: number;
  id: string;
  input: string;
  label: string;
  swatch?: {color?: string; image?: string};
  value: string;
};

export type Filter = {
  id: string;
  label: string;
  paramKey: string;
  presentation?: 'image' | 'swatch' | 'text';
  type: 'boolean' | 'list' | 'price';
  values: FilterValue[];
};

export type PriceRange = {currencyCode?: string; max: number; min: number};

export type ActiveFilterBadge = {
  filterLabel: string;
  input: string;
  label: string;
  paramKey: string;
  value: string;
};

type RawFilterValue = {
  count: number;
  id: string;
  input: unknown;
  label: string;
  swatch?: {
    color?: string | null;
    image?: {previewImage?: {url: string} | null} | null;
  } | null;
};

export type RawFilter = {
  id: string;
  label: string;
  presentation?: string | null;
  type: string;
  values: RawFilterValue[];
};

function toInputString(input: unknown): string {
  return typeof input === 'string' ? input : JSON.stringify(input ?? {});
}

function parseValue(inputJson: string): string | null {
  const input = parseFilterInput(inputJson);
  if (!input) return null;
  if (input.variantOption) return input.variantOption.value ?? null;
  if (input.productVendor) return input.productVendor;
  if (input.productType) return input.productType;
  if (input.available !== undefined && input.available !== null) {
    return input.available ? '1' : '0';
  }
  if (input.tag) return input.tag;
  if (input.productMetafield) return input.productMetafield.value ?? null;
  if (input.taxonomyMetafield) return input.taxonomyMetafield.value ?? null;
  return null;
}

function mapPresentation(value?: string | null): Filter['presentation'] {
  if (value === 'IMAGE') return 'image';
  if (value === 'SWATCH') return 'swatch';
  if (value === 'TEXT') return 'text';
  return undefined;
}

function transformFilter(filter: RawFilter): Filter {
  const values: FilterValue[] = [];
  for (const raw of filter.values) {
    const input = toInputString(raw.input);
    const value = parseValue(input);
    if (!value) continue;
    const color = raw.swatch?.color ?? undefined;
    const image = raw.swatch?.image?.previewImage?.url ?? undefined;
    values.push({
      count: raw.count,
      id: raw.id,
      input,
      label: raw.label,
      ...(color || image ? {swatch: {...(color ? {color} : {}), ...(image ? {image} : {})}} : {}),
      value,
    });
  }
  const presentation = mapPresentation(filter.presentation);
  return {
    id: filter.id,
    label: filter.label,
    paramKey: filter.id.toLowerCase(),
    ...(presentation ? {presentation} : {}),
    type: filter.type === 'PRICE_RANGE' ? 'price' : filter.type === 'BOOLEAN' ? 'boolean' : 'list',
    values,
  };
}

function extractPriceRange(filter: RawFilter, currencyCode?: string): PriceRange {
  for (const value of filter.values) {
    const input = parseFilterInput(toInputString(value.input));
    if (input?.price) {
      return {
        ...(currencyCode ? {currencyCode} : {}),
        max: input.price.max ?? 1000,
        min: input.price.min ?? 0,
      };
    }
  }
  return {...(currencyCode ? {currencyCode} : {}), max: 1000, min: 0};
}

export function transformShopifyFilters(
  raw: RawFilter[],
  options: {activeFilters?: ProductFilter[]; currencyCode?: string} = {},
): {filters: Filter[]; priceRange?: PriceRange} {
  const {activeFilters = [], currencyCode} = options;
  const priceFilter = raw.find((f) => f.type === 'PRICE_RANGE');

  let filters = raw
    .filter((f) => f.type === 'LIST')
    .map(transformFilter)
    .filter((f) => !f.paramKey.includes('category') && !f.paramKey.includes('price'));

  // Hide empty values, but keep an active one so the shopper can still clear it.
  filters = filters
    .map((f) => ({
      ...f,
      values: f.values.filter((v) => v.count > 0 || isFilterInputActive(activeFilters, v.input)),
    }))
    .filter((f) => f.values.length > 0)
    .filter(
      (f) =>
        f.values.length > 1 || f.values.some((v) => isFilterInputActive(activeFilters, v.input)),
    );

  return {
    filters,
    priceRange: priceFilter ? extractPriceRange(priceFilter, currencyCode) : undefined,
  };
}

export function getActiveFilterBadges(
  filters: Filter[],
  activeFilters: ProductFilter[],
): ActiveFilterBadge[] {
  const badges: ActiveFilterBadge[] = [];
  for (const filter of filters) {
    for (const value of filter.values) {
      if (!isFilterInputActive(activeFilters, value.input)) continue;
      badges.push({
        filterLabel: filter.label,
        input: value.input,
        label: value.label,
        paramKey: filter.paramKey,
        value: value.value,
      });
    }
  }
  return badges;
}
