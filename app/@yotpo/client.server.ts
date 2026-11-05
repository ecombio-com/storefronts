// Path: app/@yotpo/client.server.ts
// Server only (.server.ts keeps it out of the browser bundle).
// Failures are honest: the cached function throws (errors are never cached),
// public methods catch and return null, and components render nothing on null.

import {CacheCustom, createWithCache} from '@shopify/hydrogen';
import {getYotpoConfig, type YotpoEnv} from './config';
import type {
  YotpoCollectionReview,
  YotpoCollectionReviewProduct,
  YotpoCollectionReviews,
  YotpoProductReviews,
  YotpoRatingSummary,
} from './types';

const REQUEST_TIMEOUT_MS = 15000;

export type SubmitReviewInput = {
  productId: string;
  productTitle: string;
  productUrl: string;
  productImageUrl?: string;
  name: string;
  email: string;
  title: string;
  content: string;
  score: number;
};

async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  await Promise.all(
    Array.from({length: Math.min(limit, items.length)}, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    }),
  );
  return out;
}

export function createYotpoClient(args: {
  env: YotpoEnv;
  cache: Cache;
  waitUntil: (promise: Promise<unknown>) => void;
  request: Request;
}) {
  const config = getYotpoConfig(args.env);
  const withCache = createWithCache({
    cache: args.cache,
    waitUntil: args.waitUntil,
    request: args.request,
  });
  const strategy = CacheCustom({
    mode: 'public',
    maxAge: config.freshSeconds,
    staleWhileRevalidate: config.staleSeconds,
  });

  function fetchProductReviews(
    appKey: string,
    productId: string,
    page: number,
    perPage: number,
  ): Promise<YotpoProductReviews> {
    return withCache.run(
      {
        cacheKey: ['yotpo-reviews', productId, String(page), String(perPage)],
        cacheStrategy: strategy,
        shouldCacheResult: () => true,
      },
      async () => {
        const url =
          `${config.apiBaseUrl}/${encodeURIComponent(appKey)}` +
          `/products/${encodeURIComponent(productId)}/reviews.json?page=${page}&per_page=${perPage}`;
        const res = await fetch(url, {
          headers: {Accept: 'application/json'},
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        if (!res.ok) throw new Error(`Yotpo API ${res.status} ${res.statusText}`);

        const json = (await res.json()) as {
          response?: Partial<YotpoProductReviews>;
        };
        const bottomline = json.response?.bottomline;
        if (!bottomline) throw new Error('Yotpo response missing bottomline');

        const dist = bottomline.star_distribution;
        return {
          reviews: (json.response?.reviews ?? []).map((r) => ({
            ...r,
            title: r.title ?? '',
            content: r.content ?? '',
            votes_up: r.votes_up ?? 0,
            votes_down: r.votes_down ?? 0,
            user: {display_name: r.user?.display_name ?? ''},
          })),
          bottomline: {
            total_review: bottomline.total_review ?? 0,
            average_score: bottomline.average_score ?? 0,
            star_distribution: {
              1: dist?.[1] ?? 0,
              2: dist?.[2] ?? 0,
              3: dist?.[3] ?? 0,
              4: dist?.[4] ?? 0,
              5: dist?.[5] ?? 0,
            },
          },
        } as YotpoProductReviews;
      },
    );
  }

  /** Reviews + bottomline for one product, or null if unconfigured/unreachable. productId is the Shopify numeric ID, not the GID. */
  async function getProductReviews(
    productId: string,
    opts: {page?: number; perPage?: number} = {},
  ): Promise<YotpoProductReviews | null> {
    if (!config.appKey) return null;
    const {page = 1, perPage = config.reviewsFetchLimit} = opts;
    try {
      return await fetchProductReviews(config.appKey, productId, page, perPage);
    } catch (err) {
      console.error(`Yotpo fetch failed (product ${productId}):`, err);
      return null;
    }
  }

  /** Score and count only. Same args as getProductReviews, so it shares the cache entry. */
  async function getProductRatingSummary(
    productId: string,
  ): Promise<YotpoRatingSummary | null> {
    const data = await getProductReviews(productId);
    if (!data) return null;
    return {
      averageScore: data.bottomline.average_score,
      totalReviews: data.bottomline.total_review,
    };
  }

  /** Score and count for several products (listing cards). Failed lookups are left out. */
  async function getProductCardRatings(
    productIds: string[],
  ): Promise<Map<string, {count: number; score: number}>> {
    const entries = await mapLimit(productIds, 10, async (id) => {
      const data = await getProductReviews(id, {perPage: 1});
      if (!data) return null;
      return [
        id,
        {
          count: data.bottomline.total_review,
          score: data.bottomline.average_score,
        },
      ] as const;
    });
    return new Map(
      entries.filter((e): e is NonNullable<typeof e> => e !== null),
    );
  }

  /** Reviews of several products merged for a collection page. One call per product, six at a time. */
  async function getCollectionReviews(
    products: YotpoCollectionReviewProduct[],
  ): Promise<YotpoCollectionReviews | null> {
    if (!config.appKey || products.length === 0) return null;
    const results = await mapLimit(products, 6, async (product) => ({
      product,
      data: await getProductReviews(product.id),
    }));
    if (results.every(({data}) => data === null)) return null;

    const reviews: YotpoCollectionReview[] = [];
    const distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    let total = 0;
    let scoreSum = 0;
    for (const {product, data} of results) {
      if (!data) continue;
      const {average_score, star_distribution, total_review} = data.bottomline;
      total += total_review;
      scoreSum += average_score * total_review;
      for (const star of [1, 2, 3, 4, 5] as const) {
        distribution[star] += star_distribution[star];
      }
      const newest = [...data.reviews].sort(
        (a, b) =>
          (Date.parse(b.created_at) || 0) - (Date.parse(a.created_at) || 0),
      );
      for (const review of newest.slice(0, config.collectionReviewsPerProduct)) {
        reviews.push({
          ...review,
          product: {handle: product.handle, title: product.title},
        });
      }
    }
    if (total === 0) return null;
    return {
      reviews,
      bottomline: {
        total_review: total,
        average_score: scoreSum / total,
        star_distribution: distribution,
      },
    };
  }

  /** POST /v1/widget/reviews. Returns true on success. Never cached. */
  async function submitReview(input: SubmitReviewInput): Promise<boolean> {
    if (!config.appKey) return false;
    if (!config.shopDomain) {
      console.error('Yotpo create review skipped: PUBLIC_STORE_DOMAIN is not set');
      return false;
    }
    try {
      const res = await fetch(config.createReviewUrl, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', Accept: 'application/json'},
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        body: JSON.stringify({
          appkey: config.appKey,
          domain: config.shopDomain,
          sku: input.productId,
          product_title: input.productTitle,
          product_url: input.productUrl,
          ...(input.productImageUrl
            ? {product_image_url: input.productImageUrl}
            : {}),
          display_name: input.name,
          email: input.email,
          review_title: input.title,
          review_content: input.content,
          review_score: input.score,
        }),
      });
      if (!res.ok) {
        console.error(
          `Yotpo create review failed: ${res.status} ${await res.text().catch(() => '')}`,
        );
        return false;
      }
      return true;
    } catch (err) {
      console.error('Yotpo create review error:', err);
      return false;
    }
  }

  return {
    config,
    getProductReviews,
    getProductRatingSummary,
    getProductCardRatings,
    getCollectionReviews,
    submitReview,
  };
}

export type YotpoClient = ReturnType<typeof createYotpoClient>;
