// Path: app/lib/collection-hub.ts
// Shapes and helpers for hub (parent category) collection pages. Queries live in collection-hub.server.ts.
export type HubImage = {src: string; alt: string};

export type HubHeroContent = {
  eyebrow?: string;
  title: string;
  body?: string;
  ctaLabel: string;
  href: string;
  image?: HubImage;
};

export type HubSubCollection = {
  handle: string;
  title: string;
  image?: HubImage;
  /** First product photo, used by the hero scatter. */
  productImage?: HubImage;
};

export type HubArticle = {
  id: string;
  handle: string;
  title: string;
  excerpt: string;
  image?: HubImage;
};

export type HubGuide = {id: string; title: string; href: string; image?: HubImage};

// Hub CMS links are absolute URLs on the public site. Keep internal ones relative so they get the locale prefix.
const INTERNAL_HOST = /(^|\.)ecombio\.com$/i;

export function toInternalPath(url?: string | null): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    return INTERNAL_HOST.test(parsed.hostname) ? parsed.pathname + parsed.search : url;
  } catch {
    return url;
  }
}

/** Shopify Page shown under a collection (custom.after_item_lists). */
export type AfterItemPage = {id: string; title: string; body: string};
