// Path: app/components/collections/hub-page.tsx
// Parent-category ("hub") layout, selected by the collection metafield custom.layout = hub.
// Order matches Next.js: tiles, hero, trust bar, deals, articles, reel reviews, guides, reviews, after-item page.
// Lifestyle tabs are parked (see Status).
import {Analytics} from '@shopify/hydrogen';
import {Suspense} from 'react';
import {Await} from 'react-router';
import type {YotpoCollectionReviews} from '~/@yotpo';
import type {ProductCardData} from '~/components/product-card/types';
import {Container} from '~/components/ui/container';
import LocalizedLink from '~/components/ui/localized-link';
import {Page} from '~/components/ui/page';
import {Sections} from '~/components/ui/sections';
import type {
  AfterItemPage,
  HubArticle,
  HubGuide,
  HubHeroContent,
  HubSubCollection,
} from '~/lib/collection-hub';
import {shopifyImageSrcSet, shopifyImageUrl} from '~/lib/image-url';
import {AfterItemList, DealsSection, ReviewsSection} from './collection-sections';
import {HubArticles} from './hub-articles';
import {HubGuides} from './hub-guides';
import {HubHero} from './hub-hero';
import {HubReviews} from './hub-reviews';
import {HubTrustBar} from './hub-trust-bar';

const COPY = {
  home: 'Home',
  shopByType: 'Shop by type',
  trust: ['1-year warranty', 'Free standard shipping', 'Free 30-day returns', 'Friendly support'],
};

function HubTiles({collections}: {collections: HubSubCollection[]}) {
  if (collections.length === 0) return null;
  return (
    <nav aria-label={COPY.shopByType}>
      <h2 className="font-display text-2xl font-semibold tracking-tight">{COPY.shopByType}</h2>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {collections.map((collection) => (
          <li key={collection.handle}>
            <LocalizedLink href={`/collections/${collection.handle}`} className="group block">
              <div className="relative aspect-square overflow-hidden rounded-ds-lg bg-secondary">
                {collection.image ? (
                  <img
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                    decoding="async"
                    loading="lazy"
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                    src={shopifyImageUrl(collection.image.src, 400)}
                    srcSet={shopifyImageSrcSet(collection.image.src, [200, 400, 600])}
                  />
                ) : null}
              </div>
              <span className="mt-2 block text-ds-regular font-medium leading-tight">
                {collection.title}
              </span>
            </LocalizedLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function CollectionHubPage({
  afterItemPage,
  articles,
  collection,
  deals,
  featured,
  guides,
  hero,
  reviews,
  subCollections,
}: {
  afterItemPage: AfterItemPage | null;
  articles: Promise<HubArticle[]>;
  collection: {id: string; handle: string; title: string; description: string};
  deals: Promise<ProductCardData[]>;
  featured: Promise<ProductCardData | null>;
  guides: HubGuide[];
  hero?: HubHeroContent;
  reviews: Promise<YotpoCollectionReviews | null>;
  subCollections: HubSubCollection[];
}) {
  return (
    <Page className="pt-2.5 pb-10 md:pt-10">
      <Container>
        <Sections className="gap-10">
          <div>
            <nav aria-label="Breadcrumb" className="text-ds-regular text-muted-foreground">
              <LocalizedLink href="/" className="hover:text-foreground">
                {COPY.home}
              </LocalizedLink>
              <span aria-hidden="true" className="mx-2">
                /
              </span>
              <span aria-current="page">{collection.title}</span>
            </nav>
            <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight sm:text-5xl md:text-[56px] md:leading-[1.14]">
              {collection.title}
            </h1>
            {collection.description ? (
              <p className="mt-3 max-w-2xl leading-6 text-foreground">{collection.description}</p>
            ) : null}
          </div>

          <HubTiles collections={subCollections} />
          {hero ? (
            <HubHero featured={featured} hero={hero} subCollections={subCollections} />
          ) : null}

          <HubTrustBar items={COPY.trust} />

          <DealsSection deals={deals} title={collection.title} />

          <Suspense fallback={null}>
            <Await resolve={articles} errorElement={null}>
              {(items) => <HubArticles articles={items} />}
            </Await>
          </Suspense>

          <HubReviews reviews={reviews} />
          <HubGuides guides={guides} />
          <ReviewsSection reviews={reviews} title={collection.title} />
          <AfterItemList page={afterItemPage} />
        </Sections>
      </Container>
      <Analytics.CollectionView
        data={{collection: {id: collection.id, handle: collection.handle}}}
      />
    </Page>
  );
}
