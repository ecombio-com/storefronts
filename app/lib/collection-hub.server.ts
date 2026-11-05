// Path: app/lib/collection-hub.server.ts
import type {Storefront} from '@shopify/hydrogen';
import type {YotpoClient} from '~/@yotpo/client.server';
import type {ProductCardData} from '~/components/product-card/types';
import {
  toInternalPath,
  type HubArticle,
  type HubGuide,
  type HubHeroContent,
  type HubImage,
  type HubSubCollection,
} from '~/lib/collection-hub';
import {PRODUCT_CARD_FRAGMENT} from '~/lib/product-card';
import {withRatings} from '~/lib/ratings.server';

type HubContext = {storefront: Storefront; yotpo: YotpoClient};

export type CollectionLayout = 'hub' | 'standard' | 'missing';

const LAYOUT_QUERY = `#graphql
  query CollectionLayout(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      layout: metafield(namespace: "custom", key: "layout") {
        value
      }
    }
  }
` as const;

// Small and cached, so the standard page can ask it first without noticeable cost.
export async function getCollectionLayout(
  storefront: Storefront,
  handle: string,
): Promise<CollectionLayout> {
  const {collection} = await storefront.query(LAYOUT_QUERY, {
    variables: {handle},
    cache: storefront.CacheLong(),
  });
  if (!collection) return 'missing';
  return collection.layout?.value === 'hub' ? 'hub' : 'standard';
}

type RawImage = {url: string; altText?: string | null} | null | undefined;

function toImage(image: RawImage, fallbackAlt = ''): HubImage | undefined {
  return image?.url ? {src: image.url, alt: image.altText || fallbackAlt} : undefined;
}

function imageFromReference(reference: object | null | undefined, alt = '') {
  return reference && 'image' in reference
    ? toImage((reference as {image?: RawImage}).image, alt)
    : undefined;
}

function toArticle(node: {
  id: string;
  handle: string;
  title: string;
  excerpt?: string | null;
  image?: RawImage;
}): HubArticle {
  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    excerpt: node.excerpt ?? '',
    image: toImage(node.image, node.title),
  };
}

const HUB_QUERY = `#graphql
  query CollectionHub(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      updatedAt
      seo {
        title
        description
      }
      image {
        url
        altText
        width
        height
      }
      hero: metafield(namespace: "custom", key: "hub_hero") {
        reference {
          ... on Metaobject {
            fields {
              key
              value
              reference {
                __typename
                ... on MediaImage {
                  image {
                    url
                    altText
                    width
                    height
                  }
                }
                ... on Product {
                  ...ProductCardItem
                }
              }
            }
          }
        }
      }
      guides: metafield(namespace: "custom", key: "hub_guides") {
        references(first: 20) {
          nodes {
            ... on Article {
              id
              title
              handle
              blog {
                handle
              }
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
      subCollections: metafield(namespace: "custom", key: "sub_collections") {
        references(first: 20) {
          nodes {
            ... on Collection {
              id
              handle
              title
              image {
                url
                altText
                width
                height
              }
              products(first: 1) {
                nodes {
                  id
                  featuredImage {
                    url
                    altText
                    width
                    height
                  }
                }
              }
            }
          }
        }
      }
      posts: metafield(namespace: "custom", key: "posts") {
        references(first: 3) {
          nodes {
            ... on Article {
              id
              handle
              title
              excerpt
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
      afterItem: metafield(namespace: "custom", key: "after_item_lists") {
        reference {
          ... on Page {
            id
            title
            body
          }
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

const LATEST_ARTICLES_QUERY = `#graphql
  query LatestArticles($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    articles(first: 3, sortKey: PUBLISHED_AT, reverse: true) {
      nodes {
        id
        handle
        title
        excerpt
        image {
          url
          altText
          width
          height
        }
      }
    }
  }
` as const;

async function fetchLatestArticles(storefront: Storefront): Promise<HubArticle[]> {
  const {articles} = await storefront.query(LATEST_ARTICLES_QUERY, {
    cache: storefront.CacheLong(),
  });
  return articles.nodes.map(toArticle);
}

export async function loadHub({storefront, yotpo}: HubContext, handle: string) {
  const {collection} = await storefront.query(HUB_QUERY, {
    variables: {handle},
    cache: storefront.CacheLong(),
  });
  if (!collection) return null;

  const heroReference = collection.hero?.reference;
  const heroFields = heroReference && 'fields' in heroReference ? heroReference.fields : [];
  const field = Object.fromEntries(heroFields.map((entry) => [entry.key, entry]));
  const headline = field.headline?.value;

  const hero: HubHeroContent | undefined = headline
    ? {
        eyebrow: field.eyebrow?.value || undefined,
        title: headline,
        body: field.subhead?.value || undefined,
        ctaLabel: field.button_label?.value || 'Shop now',
        href: toInternalPath(field.button_link?.value) ?? `/collections/${collection.handle}`,
        image: imageFromReference(field.image?.reference, headline),
      }
    : undefined;

  const featuredReference = field.featured_product?.reference;
  const featuredNode = featuredReference?.__typename === 'Product' ? featuredReference : null;
  const featured: Promise<ProductCardData | null> = featuredNode
    ? withRatings(yotpo, [featuredNode])
        .then(([card]) => card ?? null)
        .catch(() => null)
    : Promise.resolve(null);

  const subCollections: HubSubCollection[] = (
    collection.subCollections?.references?.nodes ?? []
  ).flatMap((node) => {
    if (!('handle' in node)) return [];
    const productImage = toImage(node.products.nodes[0]?.featuredImage, node.title);
    return [
      {
        handle: node.handle,
        title: node.title,
        image: toImage(node.image, node.title) ?? productImage,
        productImage,
      },
    ];
  });

  const guides: HubGuide[] = (collection.guides?.references?.nodes ?? []).flatMap((node) =>
    'handle' in node && node.title && node.handle && node.blog?.handle
      ? [
          {
            id: node.id,
            title: node.title,
            href: `/blogs/articles/${node.handle}`,
            image: toImage(node.image, node.title),
          },
        ]
      : [],
  );

  // Linked posts win; otherwise show the latest articles from every blog.
  const linked = (collection.posts?.references?.nodes ?? []).flatMap((node) =>
    'handle' in node ? [toArticle(node)] : [],
  );
  const articles: Promise<HubArticle[]> =
    linked.length > 0
      ? Promise.resolve(linked)
      : fetchLatestArticles(storefront).catch(() => [] as HubArticle[]);

  const afterReference = collection.afterItem?.reference;
  const afterItemPage =
    afterReference && 'body' in afterReference
      ? {id: afterReference.id, title: afterReference.title, body: afterReference.body}
      : null;

  return {
    afterItemPage,
    articles,
    collection: {
      description: collection.description,
      handle: collection.handle,
      id: collection.id,
      image: collection.image,
      seo: collection.seo,
      title: collection.title,
      updatedAt: collection.updatedAt,
    },
    featured,
    guides,
    hero,
    subCollections,
  };
}
