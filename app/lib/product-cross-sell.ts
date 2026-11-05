import type {Storefront} from '@shopify/hydrogen';
import type {ProductCardData} from '~/components/product-card/types';
import {PRODUCT_CARD_FRAGMENT, toProductCardData} from '~/lib/product-card';

export type FrequentlyBoughtItem = {
  handle: string;
  hasMultipleVariants: boolean;
  id: string;
  imageAlt?: string;
  imageUrl?: string;
  price: {amount: string; currencyCode: string};
  title: string;
  variantId: string;
};

export type CrossSell = {
  frequentlyBought: FrequentlyBoughtItem[];
  complementary: ProductCardData[];
  related: ProductCardData[];
};

const EMPTY: CrossSell = {frequentlyBought: [], complementary: [], related: []};

const CROSS_SELL_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query ProductCrossSell(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      frequentlyBought: metafield(namespace: "custom", key: "frequently_bought_together") {
        references(first: 4) {
          nodes {
            ... on Product {
              id
              handle
              title
              featuredImage { url altText }
              variants(first: 2) { nodes { id } }
              selectedOrFirstAvailableVariant(ignoreUnknownOptions: true) {
                id
                availableForSale
                price { amount currencyCode }
              }
            }
          }
        }
      }
    }
    complementary: productRecommendations(productHandle: $handle, intent: COMPLEMENTARY) {
      ...ProductCardItem
    }
    related: productRecommendations(productHandle: $handle, intent: RELATED) {
      ...ProductCardItem
    }
  }
` as const;

// Never throws: the sections are optional, so any failure just hides them.
export async function loadCrossSell(storefront: Storefront, handle: string): Promise<CrossSell> {
  try {
    const data = await storefront.query(CROSS_SELL_QUERY, {variables: {handle}});

    const frequentlyBought: FrequentlyBoughtItem[] = [];
    for (const node of data.product?.frequentlyBought?.references?.nodes ?? []) {
      if (!node || !('handle' in node)) continue;
      const variant = node.selectedOrFirstAvailableVariant;
      if (!variant || !variant.availableForSale) continue;
      frequentlyBought.push({
        handle: node.handle,
        hasMultipleVariants: (node.variants?.nodes?.length ?? 0) > 1,
        id: node.id,
        imageAlt: node.featuredImage?.altText ?? undefined,
        imageUrl: node.featuredImage?.url,
        price: variant.price,
        title: node.title,
        variantId: variant.id,
      });
    }

    // Anything already shown in "Frequently bought together" is left out of "Pairs well with".
    const shown = new Set(frequentlyBought.map((item) => item.handle));
    return {
      frequentlyBought,
      complementary: (data.complementary ?? [])
        .filter((p) => !shown.has(p.handle))
        .map((p) => toProductCardData(p)),
      related: (data.related ?? []).map((p) => toProductCardData(p)),
    };
  } catch {
    return EMPTY;
  }
}
