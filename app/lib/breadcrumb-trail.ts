import type {Storefront} from '@shopify/hydrogen';

export interface TrailCollection {
  handle: string;
  title: string;
}

const GENERIC = new Set(['all', 'frontpage', 'best-sellers']);
const MAX_DEPTH = 3;

const PARENT_QUERY = `#graphql
  query CollectionParent($handle: String!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      metafield(namespace: "custom", key: "parent_collection") {
        reference { ... on Collection { handle title } }
      }
    }
  }
` as const;

type ParentResult = {
  collection?: {
    metafield?: {reference?: {handle?: string; title?: string} | null} | null;
  } | null;
};

async function parentOf(storefront: Storefront, handle: string) {
  try {
    const data = (await storefront.query(PARENT_QUERY, {
      variables: {handle},
      cache: storefront.CacheLong(),
    })) as unknown as ParentResult;
    const ref = data.collection?.metafield?.reference;
    return ref?.handle ? {handle: ref.handle, title: ref.title ?? ref.handle} : undefined;
  } catch {
    return undefined;
  }
}

// Longest custom.parent_collection chain (root first); ties keep Shopify's order.
export async function getCollectionTrail(
  storefront: Storefront,
  collections: TrailCollection[],
): Promise<TrailCollection[]> {
  const chains = await Promise.all(
    collections
      .filter((c) => !GENERIC.has(c.handle))
      .map(async (start) => {
        const chain: TrailCollection[] = [start];
        const seen = new Set([start.handle]);
        let current = start;
        for (let i = 0; i < MAX_DEPTH; i++) {
          const parent = await parentOf(storefront, current.handle);
          if (!parent || seen.has(parent.handle)) break;
          seen.add(parent.handle);
          chain.unshift(parent);
          current = parent;
        }
        return chain;
      }),
  );
  return chains.reduce<TrailCollection[]>((b, c) => (c.length > b.length ? c : b), []);
}