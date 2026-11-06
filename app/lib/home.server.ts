// Path: app/lib/home.server.ts
// Homepage content from Shopify metaobjects. Server only. Every reader never throws:
// failures log and return empty, and the page falls back to the static data in ~/lib/home.
import type {Storefront} from '@shopify/hydrogen';
import {getArticleByHandle} from '~/lib/blog.server';
import type {BlogArticle} from '~/lib/blog';
import type {
  CommunityStory,
  DirectoryGroup,
  FaqItem,
  HeroSlide,
  HomeCategorySection,
  HomeShowcaseContent,
  HomeShowcaseTabContent,
  HomeVideo,
  PopularCategory,
  PressMention,
  ShopCategory,
} from '~/lib/home';

export type HomeCmsContent = {slides?: HeroSlide[]; stories?: CommunityStory[]; studies?: BlogArticle[]};

type RawField = {
  key: string;
  value?: string | null;
  reference?: {
    image?: {url?: string} | null;
    sources?: {url: string; mimeType: string; width?: number | null; height?: number | null}[];
    previewImage?: {url?: string} | null;
    url?: string | null;
    id?: string | null;
    handle?: string | null;
    title?: string | null;
    featuredImage?: {url?: string} | null;
    priceRange?: {minVariantPrice?: {amount: string; currencyCode: string}} | null;
  } | null;
  references?: {nodes?: (RawEntry & {title?: string})[]} | null;
};
type RawEntry = {handle: string; fields?: RawField[]};
type Nodes = {nodes?: RawEntry[]} | null | undefined;
type FieldMap = Record<string, RawField>;

// Loose typing on purpose: these are dynamic metaobject shapes, cast like the Next version.
async function run<T>(storefront: Storefront, query: string, variables: Record<string, unknown> = {}) {
  const result = await (storefront.query as unknown as (
    q: string,
    o: {variables: Record<string, unknown>; cache: unknown},
  ) => Promise<unknown>)(query, {variables, cache: storefront.CacheLong()});
  return (result ?? null) as T | null;
}

const toMap = (e: RawEntry): FieldMap => Object.fromEntries((e.fields ?? []).map((f) => [f.key, f]));
function pick(f: FieldMap, ...keys: string[]): RawField | undefined {
  for (const k of keys) if (f[k]) return f[k];
  return undefined;
}
function orderOf(e: RawEntry): number {
  const raw = pick(toMap(e), 'order', 'position', 'sort_order')?.value;
  const n = raw == null || raw === '' ? NaN : Number(raw);
  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
}
function sorted(nodes?: RawEntry[]) {
  return [...(nodes ?? [])].sort(
    (a, b) => orderOf(a) - orderOf(b) || a.handle.localeCompare(b.handle, 'en', {numeric: true}),
  );
}
function toPath(url?: string | null): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    return u.hostname.endsWith('ecombio.com') ? u.pathname + u.search : url;
  } catch {
    return url;
  }
}
function skip(kind: string, handle: string, missing: string[]) {
  console.warn(`[home-cms] ${kind} "${handle}" skipped, missing: ${missing.join(', ')}`);
  return [];
}
// Optional publish_at / unpublish_at on an entry. Empty means no limit.
function inWindow(f: FieldMap): boolean {
  const now = Date.now();
  const start = pick(f, 'publish_at')?.value;
  const end = pick(f, 'unpublish_at')?.value;
  if (start) {
    const t = Date.parse(start);
    if (!Number.isNaN(t) && t > now) return false;
  }
  if (end) {
    const t = Date.parse(end);
    if (!Number.isNaN(t) && t <= now) return false;
  }
  return true;
}
const missingList = (...pairs: Array<[boolean, string]>) => pairs.filter(([m]) => m).map(([, n]) => n);
function numericId(gid?: string | null) {
  return gid?.match(/(\d+)$/)?.[1];
}

// Smallest mp4 that is still sharp on a ~256px card (2x density needs about 720px tall).
function bestSource(sources: {url: string; mimeType: string; height?: number | null}[]) {
  const mp4 = sources.filter((s) => s.mimeType === 'video/mp4');
  const pool = mp4.length > 0 ? mp4 : sources;
  const sharp = pool.filter((s) => (s.height ?? 0) >= 720).sort((a, b) => (a.height ?? 0) - (b.height ?? 0));
  return sharp[0] ?? [...pool].sort((a, b) => (b.height ?? 0) - (a.height ?? 0))[0];
}
function formatPrice(m?: {amount: string; currencyCode: string}) {
  if (!m) return undefined;
  return new Intl.NumberFormat('en-US', {style: 'currency', currency: m.currencyCode}).format(Number(m.amount));
}

// ---------- Yotpo story reviews (optional) ----------
export type ReviewLike = {
  score: number;
  content: string;
  votes_up: number;
  created_at: string;
  user: {display_name?: string | null};
};
export type GetReviews = (productId: string) => Promise<{reviews: ReviewLike[]} | null | undefined>;

const REVIEW_MIN = 20;
const REVIEW_MAX = 300;
const clean = (t: string) => t.replace(/\s+/g, ' ').trim();
function shortName(name?: string | null) {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  const last = parts[parts.length - 1];
  if (!first || !last || first.includes('@')) return undefined;
  if (parts.length === 1) return first;
  return `${first} ${last.charAt(0).toUpperCase()}.`;
}
function goodReviews(reviews: ReviewLike[]) {
  return reviews
    .filter((r) => r.score >= 4)
    .filter((r) => {
      const n = clean(r.content).length;
      return n >= REVIEW_MIN && n <= REVIEW_MAX;
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.votes_up - a.votes_up ||
        (Date.parse(b.created_at) || 0) - (Date.parse(a.created_at) || 0),
    );
}
async function withReviews(stories: CommunityStory[], getReviews?: GetReviews) {
  if (!getReviews) return stories;
  try {
    const ids = [
      ...new Set(stories.flatMap((s) => (!s.review && s.product?.productId ? [s.product.productId] : []))),
    ];
    if (ids.length === 0) return stories;
    const pool = new Map<string, ReviewLike[]>();
    for (let i = 0; i < ids.length; i += 6) {
      await Promise.all(
        ids.slice(i, i + 6).map(async (id) => {
          const data = await getReviews(id);
          pool.set(id, data ? goodReviews(data.reviews) : []);
        }),
      );
    }
    const taken = new Map<string, number>();
    return stories.map((s) => {
      const id = s.product?.productId;
      if (s.review || !id) return s;
      const list = pool.get(id) ?? [];
      const n = taken.get(id) ?? 0;
      const r = list[n % Math.max(list.length, 1)];
      if (!r) return s;
      taken.set(id, n + 1);
      return {...s, reviewer: shortName(r.user.display_name), review: clean(r.content), rating: Math.round(r.score)};
    });
  } catch (error) {
    console.error('[home-cms] reviews failed', error);
    return stories;
  }
}

// ---------- slides, stories, studies ----------
const HOME_CMS_QUERY = `#graphql
  query HomeCms($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    slides: metaobjects(type: "home_slide", first: 100) {
      nodes { handle fields { key value reference { ... on MediaImage { image { url } } } } }
    }
    studies: metaobjects(type: "home_study", first: 100) {
      nodes { handle fields { key value } }
    }
    stories: metaobjects(type: "home_story", first: 100) {
      nodes {
        handle
        fields {
          key
          value
          reference {
            ... on MediaImage { image { url } }
            ... on Video { sources { url mimeType width height } previewImage { url } }
            ... on GenericFile { url mimeType }
            ... on Product { id handle title featuredImage { url } priceRange { minVariantPrice { amount currencyCode } } }
          }
        }
      }
    }
  }
` as const;

export async function getHomeCmsContent(
  storefront: Storefront,
  opts: {getReviews?: GetReviews} = {},
): Promise<HomeCmsContent> {
  try {
    const data = await run<{slides?: Nodes; stories?: Nodes; studies?: Nodes}>(storefront, HOME_CMS_QUERY);
    if (!data) return {};
    const out: HomeCmsContent = {};

    const slides = sorted(data.slides?.nodes).flatMap((n) => {
      const f = toMap(n);
      const image = pick(f, 'image')?.reference?.image?.url;
      const href = toPath(pick(f, 'link', 'url')?.value);
      const alt = pick(f, 'alt', 'alt_text')?.value;
      if (!image || !href || !alt) {
        return skip('slide', n.handle, missingList([!href, 'link'], [!alt, 'alt/alt_text'], [!image, 'image']));
      }
      const slide: HeroSlide = {
        id: n.handle,
        image,
        mobileImage: pick(f, 'mobile_image', 'mobile')?.reference?.image?.url,
        alt,
        href,
        heading: pick(f, 'heading')?.value || undefined,
        text: pick(f, 'text')?.value || undefined,
        cta: pick(f, 'button_label', 'cta')?.value || undefined,
      };
      return [slide];
    });
    if (slides.length > 0) out.slides = slides;

    const stories = sorted(data.stories?.nodes).flatMap((n) => {
      const f = toMap(n);
      const ref = pick(f, 'video')?.reference;
      const video = bestSource(ref?.sources ?? [])?.url ?? ref?.url ?? undefined;
      const alt = pick(f, 'alt', 'alt_text')?.value;
      if (!video || !alt) {
        return skip('story', n.handle, missingList([!video, 'video (must be a video file)'], [!alt, 'alt/alt_text']));
      }
      const p = pick(f, 'product')?.reference;
      const product =
        p?.handle && p.title
          ? {
              handle: p.handle,
              title: p.title,
              image: p.featuredImage?.url,
              price: formatPrice(p.priceRange?.minVariantPrice),
              productId: (p.id && numericId(p.id)) || undefined,
            }
          : undefined;
      const rating = Number(pick(f, 'rating')?.value);
      const story: CommunityStory = {
        id: n.handle,
        video,
        poster: pick(f, 'poster')?.reference?.image?.url ?? ref?.previewImage?.url ?? undefined,
        alt,
        caption: pick(f, 'caption')?.value || undefined,
        reviewer: pick(f, 'reviewer')?.value || undefined,
        review: pick(f, 'review')?.value || undefined,
        rating: rating >= 1 && rating <= 5 ? rating : undefined,
        product,
      };
      return [story];
    });
    if (stories.length > 0) out.stories = await withReviews(stories, opts.getReviews);

    const studyHandles = sorted(data.studies?.nodes).flatMap((n) => {
      const handle = pick(toMap(n), 'article', 'article_handle')?.value?.trim();
      return handle ? [handle] : skip('study', n.handle, ['article (article handle)']);
    });
    const studies = (
      await Promise.all(studyHandles.map((h) => getArticleByHandle(storefront, h).catch(() => undefined)))
    ).filter((a): a is BlogArticle => Boolean(a));
    if (studies.length > 0) out.studies = studies;

    return out;
  } catch (error) {
    console.error('getHomeCmsContent failed', error);
    return {};
  }
}

// ---------- showcase ----------
const HOME_SHOWCASE_QUERY = `#graphql
  query HomeShowcase($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    showcases: metaobjects(type: "home_showcase", first: 20) {
      nodes {
        handle
        fields {
          key
          value
          reference { ... on MediaImage { image { url } } }
          references(first: 20) {
            nodes {
              ... on Collection { handle title }
              ... on Metaobject {
                handle
                fields {
                  key
                  value
                  reference {
                    ... on Collection { handle title }
                    ... on MediaImage { image { url } }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
` as const;

export async function getHomeShowcaseContent(storefront: Storefront): Promise<HomeShowcaseContent | undefined> {
  try {
    const data = await run<{showcases?: Nodes}>(storefront, HOME_SHOWCASE_QUERY);
    const entry = sorted(data?.showcases?.nodes)[0];
    if (!entry) return undefined;
    const f = toMap(entry);
    const title = pick(f, 'title')?.value?.trim();
    const entryTabs = (pick(f, 'tabs')?.references?.nodes ?? []).flatMap((t) => {
      const tf = toMap(t);
      const label = pick(tf, 'label')?.value?.trim();
      const collection = pick(tf, 'collection')?.reference?.handle;
      if (!label || !collection) {
        return skip('showcase tab', t.handle, missingList([!label, 'label'], [!collection, 'collection (published to the storefront?)']));
      }
      const img = pick(tf, 'image')?.reference?.image?.url;
      const tab: HomeShowcaseTabContent = {handle: collection, label, image: img ? {src: img, alt: label} : undefined};
      return [tab];
    });
    const collectionTabs: HomeShowcaseTabContent[] = (pick(f, 'collections')?.references?.nodes ?? []).flatMap((c) =>
      c.handle && c.title ? [{handle: c.handle, label: c.title}] : [],
    );
    const tabs = collectionTabs.length > 0 ? collectionTabs : entryTabs;
    if (!title || tabs.length === 0) return undefined;
    const image = pick(f, 'image')?.reference?.image?.url;
    return {title, subtitle: pick(f, 'subtitle')?.value || undefined, image: image ? {src: image, alt: title} : undefined, tabs};
  } catch (error) {
    console.error('getHomeShowcaseContent failed', error);
    return undefined;
  }
}

// ---------- popular category sections ----------
const HOME_CATEGORIES_QUERY = `#graphql
  query HomeCategories($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    categories: metaobjects(type: "home_category", first: 20) {
      nodes {
        handle
        fields {
          key
          value
          references(first: 20) {
            nodes {
              ... on Metaobject {
                handle
                fields {
                  key
                  value
                  reference {
                    ... on MediaImage { image { url } }
                    ... on Collection { handle title image { url } }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
` as const;

export async function getHomeCategorySections(storefront: Storefront): Promise<HomeCategorySection[]> {
  try {
    const data = await run<{categories?: Nodes}>(storefront, HOME_CATEGORIES_QUERY);
    return sorted(data?.categories?.nodes).flatMap((section) => {
      const f = toMap(section);
      const title = pick(f, 'title')?.value?.trim();
      const items = (pick(f, 'items')?.references?.nodes ?? []).flatMap((card) => {
        const cf = toMap(card);
        const label = pick(cf, 'title')?.value?.trim();
        const collectionRef = pick(cf, 'collection')?.reference as
          | {handle?: string | null; image?: {url?: string} | null}
          | undefined;
        const image = pick(cf, 'image')?.reference?.image?.url ?? collectionRef?.image?.url;
        const collection = collectionRef?.handle;
        const href = collection ? `/collections/${collection}` : toPath(pick(cf, 'link')?.value);
        if (!label || !href) {
          return skip('category card', card.handle, missingList([!label, 'title'], [!href, 'collection or link']));
        }
        const item: PopularCategory = {label, description: pick(cf, 'subtitle')?.value?.trim() || '', href, image};
        return [item];
      });
      if (!title || items.length === 0) {
        return skip('category section', section.handle, missingList([!title, 'title'], [items.length === 0, 'items (no usable cards)']));
      }
      const result: HomeCategorySection = {id: section.handle, title, subtitle: pick(f, 'subtitle')?.value?.trim() || undefined, items};
      return [result];
    });
  } catch (error) {
    console.error('getHomeCategorySections failed', error);
    return [];
  }
}

// ---------- "Shop by category" carousel ----------
const HOME_SHOP_CATEGORIES_QUERY = `#graphql
  query HomeShopCategories($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    shopCategories: metaobjects(type: "home_shop_category", first: 50) {
      nodes {
        handle
        fields {
          key
          value
          reference {
            ... on MediaImage { image { url } }
            ... on Collection { handle image { url } }
          }
        }
      }
    }
  }
` as const;

export async function getHomeShopCategories(storefront: Storefront): Promise<ShopCategory[]> {
  try {
    const data = await run<{shopCategories?: Nodes}>(storefront, HOME_SHOP_CATEGORIES_QUERY);
    const items = sorted(data?.shopCategories?.nodes).flatMap((entry) => {
      const f = toMap(entry);
      const label = pick(f, 'title')?.value?.trim();
      const collectionRef = pick(f, 'collection')?.reference;
      const href = collectionRef?.handle ? `/collections/${collectionRef.handle}` : toPath(pick(f, 'link')?.value);
      if (!label || !href) {
        return skip('shop category', entry.handle, missingList([!label, 'title'], [!href, 'collection or link']));
      }
      const image = pick(f, 'image')?.reference?.image?.url ?? collectionRef?.image?.url;
      const item: ShopCategory = image ? {label, href, image} : {label, href};
      return [item];
    });
    const seen = new Set<string>();
    return items.filter((item) => {
      if (seen.has(item.href)) return false;
      seen.add(item.href);
      return true;
    });
  } catch (error) {
    console.error('getHomeShopCategories failed', error);
    return [];
  }
}

// ---------- video, press, faq ----------
const HOME_VIDEO_QUERY = `#graphql
  query HomeVideo($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    videos: metaobjects(type: "home_video", first: 10) { nodes { handle fields { key value } } }
  }
` as const;

export async function getHomeVideo(storefront: Storefront): Promise<HomeVideo | null> {
  try {
    const data = await run<{videos?: Nodes}>(storefront, HOME_VIDEO_QUERY);
    const items = sorted(data?.videos?.nodes).flatMap((entry) => {
      const f = toMap(entry);
      if (!inWindow(f)) return [];
      const title = pick(f, 'title')?.value?.trim();
      const videoUrl = pick(f, 'video_url')?.value?.trim();
      if (!title || !videoUrl) return skip('home video', entry.handle, missingList([!title, 'title'], [!videoUrl, 'video_url']));
      const description = pick(f, 'description')?.value?.trim();
      const item: HomeVideo = {title, videoUrl, ...(description ? {description} : {})};
      return [item];
    });
    return items[0] ?? null;
  } catch (error) {
    console.error('getHomeVideo failed', error);
    return null;
  }
}

const HOME_PRESS_QUERY = `#graphql
  query HomePress($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    press: metaobjects(type: "home_press", first: 20) {
      nodes { handle fields { key value reference { ... on MediaImage { image { url } } } } }
    }
  }
` as const;

export async function getHomePressMentions(storefront: Storefront): Promise<PressMention[]> {
  try {
    const data = await run<{press?: Nodes}>(storefront, HOME_PRESS_QUERY);
    return sorted(data?.press?.nodes).flatMap((entry) => {
      const f = toMap(entry);
      if (!inWindow(f)) return [];
      const quote = pick(f, 'quote')?.value?.trim();
      const outlet = pick(f, 'outlet')?.value?.trim();
      if (!quote || !outlet) return skip('home press', entry.handle, missingList([!quote, 'quote'], [!outlet, 'outlet']));
      const dateLabel = pick(f, 'date_label')?.value?.trim();
      const link = pick(f, 'link')?.value?.trim();
      const logo = pick(f, 'logo')?.reference?.image?.url;
      const logoPath = pick(f, 'logo_path')?.value?.trim();
      const item: PressMention = {
        quote,
        outlet,
        ...(dateLabel ? {dateLabel} : {}),
        ...(link ? {link} : {}),
        ...(logo ? {logo} : {}),
        ...(logoPath ? {logoPath} : {}),
      };
      return [item];
    });
  } catch (error) {
    console.error('getHomePressMentions failed', error);
    return [];
  }
}

const HOME_FAQ_QUERY = `#graphql
  query HomeFaq($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    faq: metaobjects(type: "home_faq", first: 20) { nodes { handle fields { key value } } }
  }
` as const;

export async function getHomeFaq(storefront: Storefront): Promise<FaqItem[]> {
  try {
    const data = await run<{faq?: Nodes}>(storefront, HOME_FAQ_QUERY);
    return sorted(data?.faq?.nodes).flatMap((entry) => {
      const f = toMap(entry);
      if (!inWindow(f)) return [];
      const question = pick(f, 'question')?.value?.trim();
      const answer = pick(f, 'answer')?.value?.trim();
      if (!question || !answer) return skip('home faq', entry.handle, missingList([!question, 'question'], [!answer, 'answer']));
      const item: FaqItem = {question, answer};
      return [item];
    });
  } catch (error) {
    console.error('getHomeFaq failed', error);
    return [];
  }
}

// ---------- menu directory ----------
const HOME_DIRECTORY_MENU = 'whitehouse';
const HOME_DIRECTORY_QUERY = `#graphql
  query HomeDirectory($handle: String!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    menu(handle: $handle) {
      items { title url items { title url items { title url } } }
    }
  }
` as const;

type RawMenuItem = {title?: string | null; url?: string | null; items?: RawMenuItem[] | null};

function menuHref(url: string | null | undefined, storeDomain?: string): string | undefined {
  const raw = url?.trim();
  if (!raw || raw === '#') return undefined;
  if (raw.startsWith('/')) return raw;
  try {
    const u = new URL(raw);
    const host = u.hostname.toLowerCase();
    const own =
      host === storeDomain?.toLowerCase() ||
      host.endsWith('.myshopify.com') ||
      host === 'ecombio.com' ||
      host.endsWith('.ecombio.com');
    return own ? `${u.pathname}${u.search}${u.hash}` : raw;
  } catch {
    return undefined;
  }
}

export async function getHomeMenuDirectory(storefront: Storefront, storeDomain?: string): Promise<DirectoryGroup[]> {
  try {
    const data = await run<{menu?: {items?: RawMenuItem[] | null} | null}>(storefront, HOME_DIRECTORY_QUERY, {
      handle: HOME_DIRECTORY_MENU,
    });
    return (data?.menu?.items ?? [])
      .flatMap((section) => section.items ?? [])
      .flatMap((column) => {
        const heading = column.title?.trim();
        if (!heading) return [];
        const links = (column.items ?? []).flatMap((link) => {
          const label = link.title?.trim();
          const href = menuHref(link.url, storeDomain);
          return label ? [{label, ...(href ? {href} : {})}] : [];
        });
        const headingHref = menuHref(column.url, storeDomain);
        const group: DirectoryGroup = {heading, links, ...(headingHref ? {headingHref} : {})};
        return [group];
      });
  } catch (error) {
    console.error('getHomeMenuDirectory failed', error);
    return [];
  }
}
