import {Await, redirect, useLoaderData} from 'react-router';
import {Suspense} from 'react';
import {ProductReviews, StarRating} from '~/@yotpo';
import {Money} from '@shopify/hydrogen';
import {SpecCarousel, TrustBadges} from '~/components/ProductHighlights';
import {StickyBuyBar} from '~/components/StickyBuyBar';
import {DeliveryEstimate} from '~/components/DeliveryEstimate';
import type {Route} from './+types/($locale).products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {Container} from '~/components/ui/container';
import {Page} from '~/components/ui/page';
import {Sections} from '~/components/ui/sections';
import {Breadcrumbs} from '~/components/product-detail/breadcrumbs';
import {BuyButtons} from '~/components/product-detail/buy-buttons';
import {FloatingBuyBlock} from '~/components/product-detail/floating-buy-block';
import {FrequentlyAskedQuestionsSection} from '~/components/product-detail/frequently-asked-questions-section';
import {PopularSearches} from '~/components/product-detail/popular-searches';
import {ProductFormOptions} from '~/components/product-detail/product-form';
import {ProductPrice} from '~/components/product-detail/product-price';
import {ProductResources} from '~/components/product-detail/product-resources';
import {TechnicalSpecsSection} from '~/components/product-detail/technical-specs-section';
import {getCollectionTrail} from '~/lib/breadcrumb-trail';
import {PRODUCT_QUERY} from '~/lib/product-fragments';
import specsCss from '~/styles/technical-specs.css?url';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {getLocaleFromRequest} from '~/lib/i18n';
import {parseDelivery, parsePopularSearches, parseSpecs, parseTrustBadges} from '~/lib/product';
import {ProductGallery} from '~/components/ProductGallery';

export const links = () => [{rel: 'stylesheet', href: specsCss}];

export const meta: Route.MetaFunction = ({data}) => {
  const product = data?.product;
  if (!product) return [{title: 'Product not found'}];
  const title = product.seo?.title || product.title;
  const description = product.seo?.description || product.description || '';
  const url = data.canonicalUrl;
  const image = product.featuredImage?.url;
  const price = product.priceRange.minVariantPrice;
  const inStock = product.availableForSale;
  return [
    {title},
    {name: 'description', content: description},
    {tagName: 'link', rel: 'canonical', href: url},
    {property: 'og:type', content: 'product'},
    {property: 'og:site_name', content: 'Ecombio'},
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
    {property: 'og:url', content: url},
    ...(image ? [{property: 'og:image', content: image}] : []),
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: title},
    {name: 'twitter:description', content: description},
    ...(image ? [{name: 'twitter:image', content: image}] : []),
    {property: 'og:price:amount', content: price.amount},
    {property: 'og:price:currency', content: price.currencyCode},
    {property: 'og:availability', content: inStock ? 'instock' : 'oos'},
    {property: 'product:price:amount', content: price.amount},
    {property: 'product:price:currency', content: price.currencyCode},
    {property: 'product:availability', content: inStock ? 'in stock' : 'out of stock'},
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        description: product.description,
        image: product.media.nodes.flatMap((m) =>
          'image' in m && m.image ? [m.image.url] : [],
        ),
        ...(product.vendor ? {brand: {'@type': 'Brand', name: product.vendor}} : {}),
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: price.currencyCode,
          lowPrice: price.amount,
          highPrice: product.priceRange.maxVariantPrice.amount,
          offerCount: product.variantsCount?.count ?? 1,
          availability: inStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          url,
        },
        sku: product.id,
      },
    },
    {'script:ld+json': data.breadcrumbLd},
  ];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const productId = criticalData.product.id.split('/').pop() ?? '';
  const reviews = args.context.yotpo.getProductReviews(productId);
  return {...deferredData, ...criticalData, reviews};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  const origin = new URL(request.url).origin;
  const prefix = getLocaleFromRequest(request).pathPrefix;
  const trail = await getCollectionTrail(storefront, product.collections.nodes);
  const crumbs = [
    {name: 'Home', path: '/'},
    ...trail.map((c) => ({name: c.title, path: `/collections/${c.handle}`})),
    {name: product.title, path: `/products/${product.handle}`},
  ];
  const abs = (p: string) => `${origin}${prefix}${p === '/' ? '' : p}`;

  return {
    canonicalUrl: origin + new URL(request.url).pathname,
    product,
    breadcrumbs: crumbs,
    breadcrumbLd: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [{name: 'Ecombio', path: '/'}, ...crumbs.slice(1)].map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        item: abs(c.path),
      })),
    },
    delivery: parseDelivery(product),
    popularSearches: parsePopularSearches(product.popularSearches),
    trustBadges: parseTrustBadges(product.trustBadges),
    specs: parseSpecs(product.specs),
    faqBody: product.faq?.reference?.body ?? null,
    techSpecsBody: product.techSpecs?.reference?.body ?? null,
    manualUrl: product.ownersManual?.reference?.url ?? null,
    assemblyVideoUrl: product.assemblyVideo?.value ?? null,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context, params}: Route.LoaderArgs) {
  return {};
}

export default function Product() {
  const {
    product,
    breadcrumbs,
    delivery,
    popularSearches,
    faqBody,
    techSpecsBody,
    manualUrl,
    assemblyVideoUrl,
    trustBadges,
    specs,
    reviews,
  } = useLoaderData<typeof loader>();

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;
  const {minVariantPrice: pMin, maxVariantPrice: pMax} = product.priceRange;
  const {minVariantPrice: cMin, maxVariantPrice: cMax} = product.compareAtPriceRange;
  const uniform =
    pMin.amount === pMax.amount &&
    pMin.currencyCode === pMax.currencyCode &&
    cMin.amount === cMax.amount;
  const hasOptions = productOptions.some((o) => o.optionValues.length > 1);

  return (
    <Page className="pt-0">
      <Container className="bg-background pt-6 md:pt-8">
        <Sections>
          <Breadcrumbs items={breadcrumbs} className="pb-4 md:pb-6" />
          <div className="grid gap-ds-large lg:grid-cols-10 lg:items-start lg:gap-5">
            <ProductGallery
              key={selectedVariant?.id}
              media={product.media.nodes}
              title={title}
              activeUrl={selectedVariant?.image?.url}
              className="lg:sticky lg:top-20 lg:col-span-6 lg:self-start"
            />
            <div className="grid gap-10 lg:col-span-4">
              <div
                className="grid data-[uniform-price=true]:gap-10"
                data-uniform-price={uniform}
              >
                <div data-slot="product-info-header">
                  <h1 className="text-foreground text-ds-h3 font-semibold leading-tight">
                    {title}
                  </h1>
                  {product.vendor ? (
                    <p className="mt-ds-xxsmall text-ds-regular text-muted-foreground">
                      {product.vendor}
                    </p>
                  ) : null}
                  <div className="mt-ds-xsmall min-h-5">
                    <Suspense fallback={<div className="h-5" aria-hidden />}>
                      <Await resolve={reviews}>
                        {(data) => (
                          <StarRating
                            summary={
                              data
                                ? {
                                    averageScore: data.bottomline.average_score,
                                    totalReviews: data.bottomline.total_review,
                                  }
                                : null
                            }
                          />
                        )}
                      </Await>
                    </Suspense>
                  </div>
                  {uniform ? (
                    <ProductPrice
                      amount={pMin.amount}
                      currencyCode={pMin.currencyCode}
                      compareAtAmount={cMin.amount}
                    />
                  ) : null}
                  <DeliveryEstimate delivery={delivery} />
                </div>
                <div className="grid gap-10">
                  {!uniform && selectedVariant ? (
                    <div data-slot="product-info-price">
                      <ProductPrice
                        amount={selectedVariant.price.amount}
                        currencyCode={selectedVariant.price.currencyCode}
                        compareAtAmount={selectedVariant.compareAtPrice?.amount}
                      />
                    </div>
                  ) : null}
                  {hasOptions ? <ProductFormOptions options={productOptions} /> : null}
                  <FloatingBuyBlock>
                    <BuyButtons
                      selectedVariant={selectedVariant}
                      availableForSale={product.availableForSale}
                    />
                  </FloatingBuyBlock>
                </div>
              </div>
              <TrustBadges badges={trustBadges} />
              <SpecCarousel specs={specs} />
            </div>
          </div>

          {descriptionHtml ? (
            <div className="mt-ds-large grid gap-10 [&_*]:max-w-none">
              <div data-slot="product-info-description">
                <div
                  className="prose prose-sm text-foreground/80"
                  dangerouslySetInnerHTML={{__html: descriptionHtml}}
                />
              </div>
            </div>
          ) : null}

          <div id="reviews" className="scroll-mt-24">
            <Suspense fallback={<div className="min-h-64" aria-hidden />}>
              <Await resolve={reviews}>
                {(data) => (
                  <ProductReviews
                    data={data}
                    handle={product.handle}
                    productTitle={product.title}
                  />
                )}
              </Await>
            </Suspense>
          </div>
          <FrequentlyAskedQuestionsSection html={faqBody} />
          <PopularSearches terms={popularSearches} />
          <TechnicalSpecsSection html={techSpecsBody} />
          <ProductResources manualUrl={manualUrl} videoUrl={assemblyVideoUrl} />
        </Sections>
      </Container>

      <StickyBuyBar
        targetId="primary-buy-buttons"
        title={product.title}
        imageUrl={selectedVariant?.image?.url ?? product.featuredImage?.url}
        price={selectedVariant?.price ? <Money data={selectedVariant.price} /> : null}
      />
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </Page>
  );
}