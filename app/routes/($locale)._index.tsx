// Path: app/routes/($locale)._index.tsx
import {useLoaderData} from 'react-router';
import type {Route} from './+types/($locale)._index';
import {CategoryCarousel} from '~/components/home/category-carousel';
import {FeatureSplit} from '~/components/home/feature-split';
import {Hero} from '~/components/home/hero';
import {VideoFeature} from '~/components/home/video-feature';
import {HomeShowcaseTabs} from '~/components/home/home-showcase-tabs';
import {NewsletterSection} from '~/components/home/newsletter-section';
import {PopularCategories} from '~/components/home/popular-categories';
import {StudyCarousel} from '~/components/home/study-carousel';
import {VideoCarousel} from '~/components/home/video-carousel';
import {Container} from '~/components/ui/container';
import {Page} from '~/components/ui/page';
import {Sections} from '~/components/ui/sections';
import {buildMeta} from '~/lib/blog';
import {getUrls} from '~/lib/blog.server';
import {communityStories, heroSlides, shopCategories} from '~/lib/home';
import {getShowcaseSection} from '~/lib/home-showcase.server';
import {
  getHomeCategorySections,
  getHomeCmsContent,
  getHomeShopCategories,
  getHomeShowcaseContent,
  getHomeVideo,
  type ReviewLike,
} from '~/lib/home.server';

const TITLE = 'Home | Ecombio';
const DESCRIPTION =
  'Shop electric bikes, scooters and skateboards from top brands, with free shipping and a 1-year warranty.';

export const meta: Route.MetaFunction = ({data}) =>
  buildMeta({description: DESCRIPTION, title: TITLE, url: data?.canonicalUrl ?? '/'});

export async function loader({context, request}: Route.LoaderArgs) {
  const {storefront, yotpo} = context;
  const [cms, showcaseContent, categorySections, shopCategoryItems, homeVideo] = await Promise.all([
    getHomeCmsContent(storefront, {
      getReviews: (id) =>
        yotpo.getProductReviews(id) as unknown as Promise<{reviews: ReviewLike[]} | null>,
    }),
    getHomeShowcaseContent(storefront),
    getHomeCategorySections(storefront),
    getHomeShopCategories(storefront),
    getHomeVideo(storefront),
  ]);
  const showcase = await getShowcaseSection(storefront, showcaseContent, yotpo);
  return {
    canonicalUrl: getUrls(request).canonical,
    homeVideo,
    categorySections,
    shopCategories: shopCategoryItems.length > 0 ? shopCategoryItems : shopCategories,
    showcase,
    slides: cms.slides ?? heroSlides,
    stories: cms.stories ?? communityStories,
    // Drop article bodies: the cards only need title, image, excerpt and date.
    studies: (cms.studies ?? []).map((article) => ({...article, body: undefined})),
  };
}

export default function Homepage() {
  const {categorySections, shopCategories: categories, homeVideo, showcase, slides, stories, studies} =
    useLoaderData<typeof loader>();
  return (
    <Page className="pt-0">
      <Sections>
        <Hero slides={slides} />

        <Container>
          <CategoryCarousel title="Shop by category" items={categories} />
        </Container>

        {showcase ? (
          <Container>
            <HomeShowcaseTabs
              title={showcase.title}
              subtitle={showcase.subtitle}
              tabs={showcase.tabs}
              initialProducts={showcase.initialProducts}
            />
          </Container>
        ) : null}

        {categorySections.map((section) => (
          <Container key={section.id}>
            <PopularCategories title={section.title} subtitle={section.subtitle} items={section.items} />
          </Container>
        ))}

        <Container>
          <VideoCarousel title="Community stories" items={stories} />
        </Container>

        <Container>
          <StudyCarousel title="Guides and articles" items={studies} />
        </Container>

        <Container>
          <NewsletterSection privacyHref="/policies/privacy-policy" />
        </Container>

        <Container>
          <div className="flex flex-col gap-ds-large md:gap-ds-xxlarge">
            <FeatureSplit
              title="Trade in your old ride"
              description="Get credit toward your next e-bike when you trade in the one you are not using."
              ctaLabel="Get started"
              href="/pages/trade-in"
              imageSide="left"
              background="transparent"
              image={{
                src: 'https://cdn.shopify.com/s/files/1/0726/0641/7110/files/site-home-trade-in.webp?v=1791494937',
                alt: 'Cash falling from the sky',
              }}
            />
            <FeatureSplit
              title="We are B-Corp certified"
              description="Being a B-Corp means we hold ourselves to high standards, from our environmental impact to our hiring practices."
              ctaLabel="Read more"
              href="/pages/our-impact"
              imageSide="right"
              background="transparent"
              image={{
                src: 'https://cdn.shopify.com/s/files/1/0726/0641/7110/files/site-home-b-corp.webp?v=1791494934',
                alt: 'Certified B Corporation',
              }}
            />
            {homeVideo ? (
              <VideoFeature
                title={homeVideo.title}
                description={homeVideo.description}
                videoUrl={homeVideo.videoUrl}
                videoTitle={homeVideo.title}
              />
            ) : null}
          </div>
        </Container>
      </Sections>
    </Page>
  );
}
