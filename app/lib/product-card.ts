import type {ProductCardColor, ProductCardData} from '~/components/product-card/types';

// Use this fragment in any Storefront query that renders product cards.
export const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment ProductCardItem on Product {
    id
    handle
    title
    vendor
    tags
    availableForSale
    featuredImage {
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    compareAtPriceRange {
      minVariantPrice { amount currencyCode }
    }
    cardBadge: metafield(namespace: "custom", key: "card_badge") {
      value
    }
    cardSpecsText: metafield(namespace: "custom", key: "card_specs") {
      value
    }
    cardSpecs: metafield(namespace: "custom", key: "product_specs") {
      references(first: 4) {
        nodes {
          ... on Metaobject {
            fields {
              key
              value
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant {
      id
      availableForSale
      selectedOptions { name value }
    }
    options {
      name
      optionValues {
        name
        swatch {
          color
          image { previewImage { url } }
        }
      }
    }
  }
` as const;

type Money = {amount: string; currencyCode: string};

type SpecsMetafield = {
  references?: {
    nodes?: Array<{
      fields?: Array<{key: string; value?: string | null}> | null;
    } | null> | null;
  } | null;
} | null;

type CardSource = {
  id: string;
  handle: string;
  title: string;
  vendor?: string | null;
  tags?: string[] | null;
  availableForSale: boolean;
  featuredImage?: ProductCardData['featuredImage'];
  priceRange: {minVariantPrice: Money; maxVariantPrice: Money};
  compareAtPriceRange?: {minVariantPrice: Money} | null;
  cardBadge?: {value?: string | null} | null;
  cardSpecsText?: {value?: string | null} | null;
  cardSpecs?: SpecsMetafield;
  selectedOrFirstAvailableVariant?: {
    id: string;
    selectedOptions: Array<{name: string; value: string}>;
  } | null;
  options?: Array<{
    name: string;
    optionValues: Array<{
      name: string;
      swatch?: {
        color?: string | null;
        image?: {previewImage?: {url: string} | null} | null;
      } | null;
    }>;
  }> | null;
};

// Same rule as Next.js: the `card_specs` text (a JSON list) wins, then the first 3 `product_specs` values.
function pickCardSpecs(
  textValue: string | null | undefined,
  specs: SpecsMetafield | undefined,
): string[] {
  if (textValue) {
    try {
      const parsed: unknown = JSON.parse(textValue);
      if (Array.isArray(parsed)) {
        const list = parsed
          .filter((s): s is string => typeof s === 'string')
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 3);
        if (list.length > 0) return list;
      }
    } catch {
      // fall back to product_specs below
    }
  }
  const values: string[] = [];
  for (const node of specs?.references?.nodes ?? []) {
    const fields = Object.fromEntries((node?.fields ?? []).map((f) => [f.key, f.value]));
    if (!fields.label || !fields.value) continue;
    values.push(fields.value.replace(/\*+$/, '').trim());
  }
  return values.slice(0, 3);
}

function pickLabel(p: CardSource): string | null {
  const badge = p.cardBadge?.value?.trim();
  if (badge) return badge;
  const tag = (p.tags ?? []).find((t) => t.toLowerCase().startsWith('label:'));
  return tag?.slice(6).trim() || null;
}

export function toProductCardData(
  p: CardSource,
  extra: Pick<ProductCardData, 'rating'> = {},
): ProductCardData {
  const colors: ProductCardColor[] = (p.options ?? [])
    .filter((o) => /^colou?r$/i.test(o.name))
    .flatMap((o) => o.optionValues)
    .map((v) => ({
      name: v.name,
      color: v.swatch?.color ?? null,
      imageUrl: v.swatch?.image?.previewImage?.url ?? null,
    }));
  const compareAt = p.compareAtPriceRange?.minVariantPrice;
  const variant = p.selectedOrFirstAvailableVariant;
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    vendor: p.vendor,
    availableForSale: p.availableForSale,
    featuredImage: p.featuredImage,
    price: p.priceRange.minVariantPrice,
    maxPrice: p.priceRange.maxVariantPrice,
    compareAtPrice: compareAt && Number(compareAt.amount) > 0 ? compareAt : null,
    defaultVariantId: variant?.id ?? null,
    defaultVariantSelectedOptions: variant?.selectedOptions ?? [],
    colors,
    cardSpecs: pickCardSpecs(p.cardSpecsText?.value, p.cardSpecs),
    label: pickLabel(p),
    ...extra,
  };
}
