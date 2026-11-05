// Path: app/@yotpo/config.ts
// Env arrives per request on Oxygen, so config is a function of env.
// The app key is a public Yotpo identifier, not a secret.

export type YotpoEnv = {
  PUBLIC_STORE_DOMAIN?: string;
  PUBLIC_YOTPO_APP_KEY?: string;
};

export function getYotpoConfig(env: YotpoEnv) {
  return {
    appKey: env.PUBLIC_YOTPO_APP_KEY || null,
    // Domain Yotpo knows the store by (Yotpo admin > Store settings).
    shopDomain: env.PUBLIC_STORE_DOMAIN ?? '',
    apiBaseUrl: 'https://api.yotpo.com/v1/widget',
    createReviewUrl: 'https://api.yotpo.com/v1/widget/reviews',
    reviewsFetchLimit: 50,
    reviewsPerPage: 5,
    collectionReviewsPerProduct: 10,
    freshSeconds: 3600,
    staleSeconds: 604800,
  } as const;
}

export type YotpoConfig = ReturnType<typeof getYotpoConfig>;
