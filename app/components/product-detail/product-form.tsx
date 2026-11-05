import type {MappedProductOptions} from '@shopify/hydrogen';
import {ProductInfoOptions} from './product-info';
import type {OptionGroupState} from './types';

// Hydrogen's getProductOptions() output -> the same state shape the Next.js pickers consume.
export function toOptionGroups(options: MappedProductOptions[]): OptionGroupState[] {
  return options.map((option) => ({
    name: option.name,
    values: option.optionValues.map((v) => ({
      available: v.available,
      crossProduct: v.isDifferentProduct,
      exists: v.exists,
      href: v.isDifferentProduct
        ? `/products/${v.handle}?${v.variantUriQuery}`
        : `?${v.variantUriQuery}`,
      image: v.firstSelectableVariant?.image?.url ?? undefined,
      name: v.name,
      selected: v.selected,
      swatch: v.swatch
        ? {
            color: v.swatch.color ?? undefined,
            image: v.swatch.image?.previewImage?.url ?? undefined,
          }
        : undefined,
    })),
  }));
}

export function ProductFormOptions({options}: {options: MappedProductOptions[]}) {
  return <ProductInfoOptions options={toOptionGroups(options)} />;
}