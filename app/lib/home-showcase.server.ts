// Path: app/lib/home-showcase.server.ts
// Top products per collection for the homepage "Most wanted" tabs. Server only.
import type {Storefront} from '@shopify/hydrogen';
import type {YotpoClient} from '~/@yotpo/client.server';
import type {ProductCardData} from '~/components/product-card/types';
import {PRODUCT_CARD_FRAGMENT, toProductCardData} from '~/lib/product-card';
import {withRatings} from '~/lib/ratings.server';
import type {HomeShowcaseContent, HomeShowcaseTabContent} from '~/lib/home';

const SHOWCASE_PRODUCTS_QUERY = `#graphql
  query HomeShowcaseProducts($handle: String!, $first: Int!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      products(first: $first) {
        nodes {
          ...ProductCardItem
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

export const DEFAULT_SHOWCASE_TABS: HomeShowcaseTabContent[] = [
  {handle: 'electric-cargo-bikes', label: 'Cargo bikes'},
  {handle: 'electric-city-bikes', label: 'City bikes'},
  {handle: 'electric-fat-bikes', label: 'Fat bikes'},
  {handle: 'electric-folding-bikes', label: 'Folding bikes'},
  {handle: 'electric-mountain-bikes', label: 'Mountain bikes'},
];

export async function getShowcaseTabProducts(
  storefront: Storefront,
  handle: string,
  yotpo?: YotpoClient,
): Promise<ProductCardData[]> {
  if (!/^[a-z0-9-]{1,100}$/.test(handle)) return [];
  try {
    const {collection} = await storefront.query(SHOWCASE_PRODUCTS_QUERY, {
      variables: {handle, first: 10},
      cache: storefront.CacheLong(),
    });
    const nodes = collection?.products.nodes ?? [];
    if (!yotpo) return nodes.map((node) => toProductCardData(node));
    // Stars are a bonus: if Yotpo fails, show the cards without them.
    try {
      return await withRatings(yotpo, nodes);
    } catch (error) {
      console.error('getShowcaseTabProducts ratings failed', handle, error);
      return nodes.map((node) => toProductCardData(node));
    }
  } catch (error) {
    console.error('getShowcaseTabProducts failed', handle, error);
    return [];
  }
}

// Same rule as Next: check every tab, drop empty ones, pre-load the first.
export async function getShowcaseSection(
  storefront: Storefront,
  content?: HomeShowcaseContent,
  yotpo?: YotpoClient,
) {
  const tabs: HomeShowcaseTabContent[] = content?.tabs ?? DEFAULT_SHOWCASE_TABS;
  const results = await Promise.all(
    tabs.map(async (tab) => ({tab, products: await getShowcaseTabProducts(storefront, tab.handle, yotpo)})),
  );
  const filled = results.filter((r) => r.products.length > 0);
  const first = filled[0];
  if (!first) return null;
  return {
    title: content?.title ?? 'Most wanted',
    subtitle: content?.subtitle ?? (content ? undefined : 'Pick a category to preview its top picks.'),
    initialProducts: first.products,
    tabs: filled.map(({tab}) => ({
      id: tab.handle,
      label: tab.label,
      href: `/collections/${tab.handle}`,
      image: tab.image ?? content?.image,
    })),
  };
}
