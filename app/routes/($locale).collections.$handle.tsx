// Path: app/routes/($locale).collections.$handle.tsx
import {Analytics} from '@shopify/hydrogen';
import {cn} from 'cn';
import {redirect, useLoaderData, useLocation, useNavigation} from 'react-router';
import type {Route} from './+types/($locale).collections.$handle';
import {
  DealsSection,
  DeferredAfterItemList,
  ReviewsSection,
} from '~/components/collections/collection-sections';
import {CollectionHubPage} from '~/components/collections/hub-page';
import {CollectionTabs} from '~/components/collections/collection-tabs';
import {FilterSheet, FilterSidebar} from '~/components/collections/filter-sidebar';
import {InfiniteProductGrid} from '~/components/collections/infinite-product-grid';
import {SortSelect} from '~/components/collections/sort-select';
import {Container} from '~/components/ui/container';
import LocalizedLink from '~/components/ui/localized-link';
import {Page} from '~/components/ui/page';
import {Sections} from '~/components/ui/sections';
import {PRODUCTS_PER_PAGE, parseBrowseParams, parseSortBy} from '~/lib/collection-browse';
import {transformShopifyFilters} from '~/lib/collection-filters';
import {
  loadAfterItemPage,
  loadCollectionArticles,
  loadCollectionDeals,
  loadCollectionReviews,
} from '~/lib/collection-extras.server';
import {getCollectionLayout, loadHub} from '~/lib/collection-hub.server';
import {buildCollectionSeo} from '~/lib/collection-seo';
import {PRODUCT_CARD_FRAGMENT} from '~/lib/product-card';
import {withRatings} from '~/lib/ratings.server';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

const TRUST = ['1-year warranty', 'Free standard shipping', 'Free 30-day returns', 'Friendly support'];

export const meta: Route.MetaFunction = ({data}) => {
  const collection = data?.collection;
  if (!collection) return [{title: 'Collection not found'}];
  const title = collection.seo?.title || collection.title;
  const description = collection.seo?.description || collection.description || '';
  const image = collection.image?.url;
  return [
    {title},
    {name: 'description', content: description},
    {tagName: 'link', rel: 'canonical', href: data.canonicalUrl},
    {property: 'og:type', content: 'website'},
    {property: 'og:site_name', content: 'Ecombio'},
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
    {property: 'og:url', content: data.canonicalUrl},
    ...(image ? [{property: 'og:image', content: image}] : []),
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: title},
    {name: 'twitter:description', content: description},
    {'script:ld+json': data.collectionLd},
    {'script:ld+json': data.breadcrumbLd},
  ];
};

export async function loader({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  if (!handle) throw redirect('/collections');

  // custom.layout = hub selects the parent-category layout. A failed lookup falls back to the standard page.
  const layout = await getCollectionLayout(context.storefront, handle).catch(
    () => 'standard' as const,
  );
  if (layout === 'missing') {
    throw new Response(`Collection ${handle} not found`, {status: 404});
  }

  // Deferred sections. A failure hides that section, not the page.
  const deals = loadCollectionDeals(context, handle).catch(() => []);
  const reviews = loadCollectionReviews(context, handle).catch(() => null);

  if (layout === 'hub') {
    const hub = await loadHub(context, handle);
    if (!hub) throw new Response(`Collection ${handle} not found`, {status: 404});
    redirectIfHandleIsLocalized(request, {handle, data: hub.collection});
    const seo = buildCollectionSeo({request, collection: hub.collection});
    return {kind: 'hub' as const, ...hub, ...seo, deals, reviews};
  }

  const afterItemPage = loadAfterItemPage(context.storefront, handle).catch(() => null);

  const url = new URL(request.url);
  const {filters, sortBy} = parseBrowseParams(url.searchParams);
  const {reverse, sortKey} = parseSortBy(sortBy);
  const cursor = url.searchParams.get('cursor');

  const articlesPromise = loadCollectionArticles(context.storefront, handle).catch(() => []);
  const {collection} = await context.storefront.query(COLLECTION_BROWSE_QUERY, {
    variables: {
      handle,
      first: PRODUCTS_PER_PAGE,
      after: cursor,
      sortKey,
      reverse,
      filters: filters.length > 0 ? filters : undefined,
    },
  });

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {status: 404});
  }
  redirectIfHandleIsLocalized(request, {handle, data: collection});

  const products = await withRatings(context.yotpo, collection.products.nodes);
  const {filters: facets, priceRange} = transformShopifyFilters(collection.products.filters, {
    activeFilters: filters,
    currencyCode: products[0]?.price.currencyCode,
  });

  const parentRef = collection.parent?.reference;
  const parent = parentRef && 'handle' in parentRef ? {handle: parentRef.handle, title: parentRef.title} : null;
  const subCollections = (collection.subCollections?.references?.nodes ?? []).flatMap((node) =>
    'handle' in node ? [{handle: node.handle, title: node.title}] : [],
  );

  // No collection total in the Storefront API: sum the availability facet (in stock + out of stock), like Next.js.
  const availability = collection.products.filters.find((filter) => /availab/i.test(filter.id + ' ' + filter.label));
  const productCount = availability?.values.reduce((sum, value) => sum + value.count, 0) ?? 0;
  const articles = await articlesPromise;

  const seo = buildCollectionSeo({request, collection, parent});

  return {
    kind: 'standard' as const,
    ...seo,
    afterItemPage,
    articles,
    deals,
    productCount,
    reviews,
    collection,
    filters: facets,
    pageInfo: collection.products.pageInfo,
    parent,
    priceRange,
    products,
    subCollections,
  };
}

export default function Collection() {
  const data = useLoaderData<typeof loader>();
  const location = useLocation();
  const navigation = useNavigation();
  const pending =
    navigation.state === 'loading' && navigation.location?.pathname === location.pathname;
  const activeCount = parseBrowseParams(location.search).filters.length;

  if (data.kind === 'hub') {
    return (
      <CollectionHubPage
        afterItemPage={data.afterItemPage}
        articles={data.articles}
        collection={data.collection}
        deals={data.deals}
        featured={data.featured}
        guides={data.guides}
        hero={data.hero}
        reviews={data.reviews}
        subCollections={data.subCollections}
      />
    );
  }

  const {
    afterItemPage,
    articles,
    collection,
    deals,
    filters,
    pageInfo,
    parent,
    priceRange,
    productCount,
    products,
    reviews,
    subCollections,
  } = data;

  return (
    <Page className="pt-2.5 pb-10 md:pt-10">
      <Container>
        <Sections className="gap-5">
          <div>
            {parent ? (
              <nav aria-label="Breadcrumb" className="mb-4 text-ds-regular text-muted-foreground">
                <LocalizedLink href="/" className="hover:text-foreground">Home</LocalizedLink>
                <span aria-hidden="true" className="mx-2">/</span>
                <LocalizedLink href={`/collections/${parent.handle}`} className="hover:text-foreground">
                  {parent.title}
                </LocalizedLink>
                <span aria-hidden="true" className="mx-2">/</span>
                <span aria-current="page">{collection.title}</span>
              </nav>
            ) : null}
            <div className="grid gap-4 rounded-ds-lg bg-muted px-6 py-5 text-ds-regular font-medium sm:grid-cols-2 lg:grid-cols-4">
              {TRUST.map((text) => (
                <span key={text} className="flex items-center gap-3">
                  <span className="size-2 rounded-full bg-highlight" />
                  {text}
                </span>
              ))}
            </div>
            <h1 className="mt-10 font-display text-4xl font-semibold tracking-tight sm:text-5xl md:text-[56px] md:leading-[1.14]">
              {collection.title}
            </h1>
            {collection.description ? (
              <p className="mt-3 max-w-2xl leading-6 text-foreground">{collection.description}</p>
            ) : null}
          </div>

          {subCollections.length > 0 ? (
            <nav aria-label="Shop by type" className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {subCollections.map((sub) => (
                <LocalizedLink
                  key={sub.handle}
                  href={`/collections/${sub.handle}`}
                  className="shrink-0 whitespace-nowrap rounded-full bg-secondary px-4 py-3 text-ds-regular font-medium transition-colors hover:bg-input"
                >
                  {sub.title}
                </LocalizedLink>
              ))}
            </nav>
          ) : null}

          <CollectionTabs articles={articles} productCount={productCount}>
          <div className="flex flex-col gap-5">
            <div className="sticky top-[calc(var(--header-offset,0px)_+_0.75rem)] z-20 flex items-center gap-3 rounded-2xl border border-border-subtle bg-card px-4 py-3 [transition:var(--header-offset-transition,none)] sm:gap-5">
              <div className="lg:hidden">
                <FilterSheet count={activeCount}>
                  <FilterSidebar filters={filters} priceRange={priceRange} />
                </FilterSheet>
              </div>
              <div className="ml-auto">
                <SortSelect />
              </div>
            </div>

            <div className="lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
              <aside className="hidden rounded-2xl border border-border-subtle bg-card p-4 lg:sticky lg:top-[calc(var(--header-offset,0px)_+_5.25rem)] lg:block lg:max-h-[calc(100vh_-_var(--header-offset,0px)_-_5.5rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain lg:[scrollbar-width:thin]">
                <FilterSidebar filters={filters} priceRange={priceRange} />
              </aside>
              <div className={cn('min-w-0 transition-opacity duration-200', pending && 'pointer-events-none opacity-50')}>
                <DealsSection deals={deals} title={collection.title} />
                {products.length === 0 ? (
                  <div className="py-10 text-center">
                    <h2 className="mb-2 text-2xl">No products found</h2>
                    <p className="text-muted-foreground">Try removing a filter.</p>
                  </div>
                ) : (
                  <InfiniteProductGrid
                    key={location.search}
                    initialProducts={products}
                    initialPageInfo={pageInfo}
                  />
                )}
              </div>
            </div>
          </div>
          </CollectionTabs>

          <ReviewsSection reviews={reviews} title={collection.title} />
          <DeferredAfterItemList page={afterItemPage} />
        </Sections>
      </Container>
      <Analytics.CollectionView
        data={{collection: {id: collection.id, handle: collection.handle}}}
      />
    </Page>
  );
}

// Unused here. Kept until #13 Cleanup so codegen still emits ProductItemFragment for ProductItem.tsx.
const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
  }
` as const;

const COLLECTION_BROWSE_QUERY = `#graphql
  query CollectionBrowse(
    $handle: String!
    $first: Int!
    $after: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $filters: [ProductFilter!]
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
      parent: metafield(namespace: "custom", key: "parent_collection") {
        reference {
          ... on Collection {
            handle
            title
          }
        }
      }
      subCollections: metafield(namespace: "custom", key: "sub_collections") {
        references(first: 20) {
          nodes {
            ... on Collection {
              handle
              title
            }
          }
        }
      }
      products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, filters: $filters) {
        filters {
          id
          label
          type
          presentation
          values {
            id
            label
            count
            input
            swatch {
              color
              image {
                previewImage {
                  url
                }
              }
            }
          }
        }
        nodes {
          ...ProductCardItem
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
