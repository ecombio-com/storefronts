import {Analytics, getPaginationVariables} from '@shopify/hydrogen';
import {cn} from 'cn';
import {useLoaderData, useLocation, useNavigation} from 'react-router';
import type {
  PredictiveSearchQuery,
  RegularSearchQuery,
} from 'storefrontapi.generated';
import type {Route} from './+types/($locale).search';
import {
  isAlgoliaReady,
  toPublicAlgoliaConfig,
  TrackSearchClicks,
  type PublicAlgoliaConfig,
} from '~/@algolia';
import {FilterSheet, FilterSidebar} from '~/components/collections/filter-sidebar';
import {InfiniteProductGrid} from '~/components/collections/infinite-product-grid';
import {SortSelect} from '~/components/collections/sort-select';
import type {ProductCardData} from '~/components/product-card/types';
import {Container} from '~/components/ui/container';
import {Page} from '~/components/ui/page';
import {Sections} from '~/components/ui/sections';
import {
  PRODUCTS_PER_PAGE,
  SEARCH_SORT_EXCLUDE,
  parseBrowseParams,
  parseSortBy,
} from '~/lib/collection-browse';
import {
  transformShopifyFilters,
  type Filter,
  type PriceRange,
} from '~/lib/collection-filters';
import {PRODUCT_CARD_FRAGMENT, toProductCardData} from '~/lib/product-card';
import {
  getEmptyPredictiveSearchResult,
  type PredictiveSearchReturn,
  type RegularSearchReturn,
} from '~/lib/search';
import {parseAlgoliaCursor, searchViaAlgolia} from '~/lib/search-algolia.server';

export const meta: Route.MetaFunction = ({data}) => {
  const term = data?.type === 'browse' ? data.term : '';
  return [
    {title: term ? `Search results for "${term}"` : 'Search'},
    {
      name: 'description',
      content: term
        ? `Find products matching "${term}"`
        : 'Search for products in our store',
    },
    {name: 'robots', content: 'noindex, nofollow'},
  ];
};

type BrowseSearchData = {
  type: 'browse';
  term: string;
  total: number;
  products: ProductCardData[];
  pageInfo: {hasNextPage: boolean; endCursor: string | null};
  filters: Filter[];
  priceRange?: PriceRange;
  tracking: {
    config: PublicAlgoliaConfig;
    queryID?: string;
    firstPageCount: number;
  } | null;
};

export async function loader({request, context}: Route.LoaderArgs) {
  const url = new URL(request.url);
  // The header search modal loads this route with ?predictive=true.
  if (url.searchParams.has('predictive')) {
    return predictiveSearch({request, context});
  }
  return browseSearch({request, context});
}

function escapeQuery(value: string) {
  return value.replace(/'/g, "\\'");
}

// Same rule as Next: text AND collection scope, "*" when there is neither.
function buildSearchQuery(term: string, collection?: string): string {
  const parts: string[] = [];
  if (term) parts.push(term);
  if (collection) parts.push(`collection:'${escapeQuery(collection)}'`);
  return parts.length > 0 ? parts.join(' AND ') : '*';
}

// Storefront search sorts by RELEVANCE or PRICE only.
function toSearchSort(sortBy?: string | null) {
  const {sortKey, reverse} = parseSortBy(sortBy);
  return sortKey === 'PRICE'
    ? {sortKey: 'PRICE' as const, reverse}
    : {sortKey: 'RELEVANCE' as const, reverse: false};
}

async function browseSearch({
  request,
  context,
}: Pick<Route.LoaderArgs, 'request' | 'context'>): Promise<BrowseSearchData> {
  const {storefront, algolia} = context;
  const url = new URL(request.url);
  const term = (url.searchParams.get('q') ?? '').trim();
  const collection = url.searchParams.get('collection') || undefined;
  const cursor = url.searchParams.get('cursor') || undefined;
  const {filters, sortBy} = parseBrowseParams(url.searchParams);
  const query = buildSearchQuery(term, collection);
  const productFilters = filters.length > 0 ? filters : undefined;
  // null = a Shopify cursor, 0 = first page, N = an "algolia:N" cursor.
  const algoliaPage = cursor ? parseAlgoliaCursor(cursor) : 0;
  const empty: BrowseSearchData = {
    type: 'browse',
    term,
    total: 0,
    products: [],
    pageInfo: {hasNextPage: false, endCursor: null},
    filters: [],
    priceRange: undefined,
    tracking: null,
  };

  // Algolia ranks plain text searches (no filters applied). Anything else, or any failure,
  // runs the Shopify search below. The filter sidebar always comes from Shopify facets.
  const useAlgolia =
    isAlgoliaReady(algolia.config) &&
    term !== '' &&
    filters.length === 0 &&
    algoliaPage !== null;
  if (useAlgolia) {
    const [ranked, facets] = await Promise.all([
      searchViaAlgolia(algolia, storefront, {
        collection,
        hitsPerPage: PRODUCTS_PER_PAGE,
        page: algoliaPage ?? 0,
        query: term,
        sortBy,
      }),
      cursor
        ? null
        : storefront.query(SEARCH_FACETS_QUERY, {
            variables: {query, productFilters},
          }),
    ]);
    if (ranked) {
      const transformed = facets
        ? transformShopifyFilters(facets.search.productFilters, {
            activeFilters: filters,
            currencyCode: ranked.products[0]?.price.currencyCode,
          })
        : {filters: [] as Filter[], priceRange: undefined};
      const config = toPublicAlgoliaConfig(algolia.config);
      return {
        ...empty,
        total: ranked.total,
        products: ranked.products,
        pageInfo: {
          hasNextPage: ranked.pageInfo.hasNextPage,
          endCursor: ranked.pageInfo.endCursor,
        },
        filters: transformed.filters,
        priceRange: transformed.priceRange,
        tracking: config
          ? {
              config,
              queryID: ranked.queryID,
              firstPageCount: ranked.products.length,
            }
          : null,
      };
    }
  }

  // An "algolia:N" cursor can't be continued on Shopify.
  if (cursor && algoliaPage !== null) return empty;

  const {reverse, sortKey} = toSearchSort(sortBy);
  const {search} = await storefront.query(SEARCH_BROWSE_QUERY, {
    variables: {
      query,
      first: PRODUCTS_PER_PAGE,
      after: cursor,
      productFilters,
      sortKey,
      reverse,
    },
  });
  const products = search.nodes.flatMap((node) =>
    node.__typename === 'Product' ? [toProductCardData(node)] : [],
  );
  const transformed = transformShopifyFilters(search.productFilters, {
    activeFilters: filters,
    currencyCode: products[0]?.price.currencyCode,
  });
  return {
    ...empty,
    total: search.totalCount,
    products,
    pageInfo: {
      hasNextPage: search.pageInfo.hasNextPage,
      endCursor: search.pageInfo.endCursor ?? null,
    },
    filters: transformed.filters,
    priceRange: transformed.priceRange,
  };
}

export default function SearchPage() {
  const data = useLoaderData<typeof loader>();
  const location = useLocation();
  const navigation = useNavigation();
  if (data.type === 'predictive') return null;

  const {filters, pageInfo, priceRange, products, term, total, tracking} = data;
  const pending =
    navigation.state === 'loading' &&
    navigation.location?.pathname === location.pathname;
  const activeCount = parseBrowseParams(location.search).filters.length;
  const countLabel = `${total.toLocaleString('en-US')} ${total === 1 ? 'Item' : 'Items'}`;

  return (
    <Page className="pt-2.5 pb-10 md:pt-10">
      <Container>
        <Sections className="gap-5">
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl md:text-[56px] md:leading-[1.14]">
            Search{term ? ` for "${term}"` : ''}
          </h1>

          <div className="flex flex-col gap-5">
            <div className="sticky top-[calc(var(--header-offset,0px)_+_0.75rem)] z-20 flex items-center gap-3 rounded-2xl border border-border-subtle bg-card px-4 py-3 [transition:var(--header-offset-transition,none)] sm:gap-5">
              <div className="lg:hidden">
                <FilterSheet count={activeCount}>
                  <FilterSidebar filters={filters} priceRange={priceRange} />
                </FilterSheet>
              </div>
              <div className="ml-auto flex min-w-0 items-center gap-3 sm:gap-5">
                {total > 0 ? (
                  <span className="hidden text-ds-regular text-muted-foreground sm:block">
                    {countLabel}
                  </span>
                ) : null}
                <SortSelect exclude={SEARCH_SORT_EXCLUDE} />
              </div>
            </div>

            <div className="lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
              <aside className="hidden rounded-2xl border border-border-subtle bg-card p-4 lg:sticky lg:top-[calc(var(--header-offset,0px)_+_5.25rem)] lg:block lg:max-h-[calc(100vh_-_var(--header-offset,0px)_-_5.5rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain lg:[scrollbar-width:thin]">
                <FilterSidebar filters={filters} priceRange={priceRange} />
              </aside>
              <div
                className={cn(
                  'min-w-0 transition-opacity duration-200',
                  pending && 'pointer-events-none opacity-50',
                )}
              >
                {products.length === 0 ? (
                  <div className="py-10 text-center">
                    <h2 className="mb-2 text-2xl">No products found</h2>
                    <p className="text-muted-foreground">
                      {term
                        ? `We couldn't find any products matching "${term}"`
                        : 'No products available'}
                    </p>
                  </div>
                ) : (
                  <InfiniteProductGrid
                    key={location.search}
                    initialProducts={products}
                    initialPageInfo={pageInfo}
                    variant="default"
                    showSale
                  />
                )}
              </div>
            </div>
          </div>
        </Sections>
      </Container>
      {tracking ? (
        <TrackSearchClicks
          config={tracking.config}
          queryID={tracking.queryID}
          firstPageCount={tracking.firstPageCount}
        />
      ) : null}
      {term ? (
        <Analytics.SearchView
          data={{searchTerm: term, searchResults: {total, items: {products}}}}
        />
      ) : null}
    </Page>
  );
}

const SEARCH_FILTER_FRAGMENT = `#graphql
  fragment SearchFilterFields on Filter {
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
` as const;

const SEARCH_BROWSE_QUERY = `#graphql
  query SearchBrowse(
    $query: String!
    $first: Int!
    $after: String
    $productFilters: [ProductFilter!]
    $sortKey: SearchSortKeys
    $reverse: Boolean
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    search(
      query: $query
      first: $first
      after: $after
      productFilters: $productFilters
      sortKey: $sortKey
      reverse: $reverse
      types: PRODUCT
    ) {
      totalCount
      nodes {
        __typename
        ... on Product {
          ...ProductCardItem
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      productFilters {
        ...SearchFilterFields
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
  ${SEARCH_FILTER_FRAGMENT}
` as const;

const SEARCH_FACETS_QUERY = `#graphql
  query SearchFacets(
    $query: String!
    $productFilters: [ProductFilter!]
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    search(
      query: $query
      first: 1
      productFilters: $productFilters
      types: PRODUCT
    ) {
      totalCount
      productFilters {
        ...SearchFilterFields
      }
    }
  }
  ${SEARCH_FILTER_FRAGMENT}
` as const;
/**
 * Regular search query and fragments
 * (adjust as needed)
 */
const SEARCH_PRODUCT_FRAGMENT = `#graphql
  fragment SearchProduct on Product {
    __typename
    handle
    id
    publishedAt
    title
    trackingParameters
    vendor
    selectedOrFirstAvailableVariant(
      selectedOptions: []
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      id
      image {
        url
        altText
        width
        height
      }
      price {
        amount
        currencyCode
      }
      compareAtPrice {
        amount
        currencyCode
      }
      selectedOptions {
        name
        value
      }
      product {
        handle
        title
      }
    }
  }
` as const;

const SEARCH_PAGE_FRAGMENT = `#graphql
  fragment SearchPage on Page {
     __typename
     handle
    id
    title
    trackingParameters
  }
` as const;

const SEARCH_ARTICLE_FRAGMENT = `#graphql
  fragment SearchArticle on Article {
    __typename
    handle
    id
    title
    trackingParameters
  }
` as const;

const PAGE_INFO_FRAGMENT = `#graphql
  fragment PageInfoFragment on PageInfo {
    hasNextPage
    hasPreviousPage
    startCursor
    endCursor
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/search
export const SEARCH_QUERY = `#graphql
  query RegularSearch(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $term: String!
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    articles: search(
      query: $term,
      types: [ARTICLE],
      first: $first,
    ) {
      nodes {
        ...on Article {
          ...SearchArticle
        }
      }
    }
    pages: search(
      query: $term,
      types: [PAGE],
      first: $first,
    ) {
      nodes {
        ...on Page {
          ...SearchPage
        }
      }
    }
    products: search(
      after: $endCursor,
      before: $startCursor,
      first: $first,
      last: $last,
      query: $term,
      sortKey: RELEVANCE,
      types: [PRODUCT],
      unavailableProducts: HIDE,
    ) {
      nodes {
        ...on Product {
          ...SearchProduct
        }
      }
      pageInfo {
        ...PageInfoFragment
      }
    }
  }
  ${SEARCH_PRODUCT_FRAGMENT}
  ${SEARCH_PAGE_FRAGMENT}
  ${SEARCH_ARTICLE_FRAGMENT}
  ${PAGE_INFO_FRAGMENT}
` as const;

/**
 * Regular search fetcher
 */
export async function regularSearch({
  request,
  context,
}: Pick<
  Route.LoaderArgs,
  'request' | 'context'
>): Promise<RegularSearchReturn> {
  const {storefront} = context;
  const url = new URL(request.url);
  const variables = getPaginationVariables(request, {pageBy: 8});
  const term = String(url.searchParams.get('q') || '');

  // Search articles, pages, and products for the `q` term
  const {
    errors,
    ...items
  }: {errors?: Array<{message: string}>} & RegularSearchQuery =
    await storefront.query(SEARCH_QUERY, {
      variables: {...variables, term},
    });

  if (!items) {
    throw new Error('No search data returned from Shopify API');
  }

  const total = Object.values(items).reduce(
    (acc: number, {nodes}: {nodes: Array<unknown>}) => acc + nodes.length,
    0,
  );

  const error = errors
    ? errors.map(({message}: {message: string}) => message).join(', ')
    : undefined;

  return {type: 'regular', term, error, result: {total, items}};
}

/**
 * Predictive search query and fragments
 * (adjust as needed)
 */
const PREDICTIVE_SEARCH_ARTICLE_FRAGMENT = `#graphql
  fragment PredictiveArticle on Article {
    __typename
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
    trackingParameters
  }
` as const;

const PREDICTIVE_SEARCH_COLLECTION_FRAGMENT = `#graphql
  fragment PredictiveCollection on Collection {
    __typename
    id
    title
    handle
    image {
      url
      altText
      width
      height
    }
    trackingParameters
  }
` as const;

const PREDICTIVE_SEARCH_PAGE_FRAGMENT = `#graphql
  fragment PredictivePage on Page {
    __typename
    id
    title
    handle
    trackingParameters
  }
` as const;

const PREDICTIVE_SEARCH_PRODUCT_FRAGMENT = `#graphql
  fragment PredictiveProduct on Product {
    __typename
    id
    title
    handle
    trackingParameters
    selectedOrFirstAvailableVariant(
      selectedOptions: []
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      id
      image {
        url
        altText
        width
        height
      }
      price {
        amount
        currencyCode
      }
    }
  }
` as const;

const PREDICTIVE_SEARCH_QUERY_FRAGMENT = `#graphql
  fragment PredictiveQuery on SearchQuerySuggestion {
    __typename
    text
    styledText
    trackingParameters
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/predictiveSearch
const PREDICTIVE_SEARCH_QUERY = `#graphql
  query PredictiveSearch(
    $country: CountryCode
    $language: LanguageCode
    $limit: Int!
    $limitScope: PredictiveSearchLimitScope!
    $term: String!
    $types: [PredictiveSearchType!]
  ) @inContext(country: $country, language: $language) {
    predictiveSearch(
      limit: $limit,
      limitScope: $limitScope,
      query: $term,
      types: $types,
    ) {
      articles {
        ...PredictiveArticle
      }
      collections {
        ...PredictiveCollection
      }
      pages {
        ...PredictivePage
      }
      products {
        ...PredictiveProduct
      }
      queries {
        ...PredictiveQuery
      }
    }
  }
  ${PREDICTIVE_SEARCH_ARTICLE_FRAGMENT}
  ${PREDICTIVE_SEARCH_COLLECTION_FRAGMENT}
  ${PREDICTIVE_SEARCH_PAGE_FRAGMENT}
  ${PREDICTIVE_SEARCH_PRODUCT_FRAGMENT}
  ${PREDICTIVE_SEARCH_QUERY_FRAGMENT}
` as const;

/**
 * Predictive search fetcher
 */
async function predictiveSearch({
  request,
  context,
}: Pick<
  Route.ActionArgs,
  'request' | 'context'
>): Promise<PredictiveSearchReturn> {
  const {storefront} = context;
  const url = new URL(request.url);
  const term = String(url.searchParams.get('q') || '').trim();
  const limit = Number(url.searchParams.get('limit') || 10);
  const type = 'predictive';

  if (!term) return {type, term, result: getEmptyPredictiveSearchResult()};

  // Predictively search articles, collections, pages, products, and queries (suggestions)
  const {
    predictiveSearch: items,
    errors,
  }: PredictiveSearchQuery & {errors?: Array<{message: string}>} =
    await storefront.query(PREDICTIVE_SEARCH_QUERY, {
      variables: {
        // customize search options as needed
        limit,
        limitScope: 'EACH',
        term,
      },
    });

  if (errors) {
    throw new Error(
      `Shopify API errors: ${errors.map(({message}: {message: string}) => message).join(', ')}`,
    );
  }

  if (!items) {
    throw new Error('No predictive search data returned from Shopify API');
  }

  const total = Object.values(items).reduce(
    (acc: number, item: Array<unknown>) => acc + item.length,
    0,
  );

  return {type, term, result: {items, total}};
}
