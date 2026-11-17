// One entry per Hydrogen storefront, keyed by the PUBLIC_STOREFRONT_ID that Shopify injects.
// Unknown or missing IDs fall back to ecombio, so ecombio can never break.
import type {BrandId} from '../brands/registry';

export type StorefrontConfig = {
  slug: string;
  brand: BrandId;
  name: string;
  headerMenuHandle: string;
  footerMenuHandle: string;
  homeCollectionHandle?: string;
};

const ECOMBIO_ID = '1000184544';

const CONFIGS: Record<string, StorefrontConfig> = {
  [ECOMBIO_ID]: {slug: 'ecombio', brand: 'ecombio', name: 'Ecombio', headerMenuHandle: 'main-menu', footerMenuHandle: 'footer'},
  '1000185153': {slug: 'ecombio', brand: 'ecombio', name: 'Ecombio', headerMenuHandle: 'main-menu', footerMenuHandle: 'footer'}, // live store khkkyb-b8
  '1000179978': {slug: 'bicyclebio', brand: 'bicyclebio', name: 'BicycleBio', headerMenuHandle: 'bicyclebio-main', footerMenuHandle: 'bicyclebio-footer'},
  '1000185154': {slug: 'bicyclebio', brand: 'bicyclebio', name: 'BicycleBio', headerMenuHandle: 'bicyclebio-main', footerMenuHandle: 'bicyclebio-footer'}, // live store khkkyb-b8
  '1000179976': {slug: 'scooterbio', brand: 'scooterbio', name: 'ScooterBio', headerMenuHandle: 'scooterbio-main', footerMenuHandle: 'scooterbio-footer', homeCollectionHandle: 'scooterbio-all'},
  '1000179977': {slug: 'skaterbio', brand: 'skaterbio', name: 'SkaterBio', headerMenuHandle: 'skaterbio-main', footerMenuHandle: 'skaterbio-footer', homeCollectionHandle: 'skaterbio-all'},
};

// Custom domains served by this Hydrogen deployment. Map to the corresponding
// Shopify storefront IDs so brand menus, content and metadata are request-specific.
const HOST_STOREFRONT_IDS: Record<string, string> = {
  'ecombio.com': '1000185153',
  'www.ecombio.com': '1000185153',
  'bicyclebio.com': '1000185154',
  'www.bicyclebio.com': '1000185154',
  'scooterbio.com': '1000179976',
  'www.scooterbio.com': '1000179976',
  'skaterbio.com': '1000179977',
  'www.skaterbio.com': '1000179977',
};

export function getStorefrontConfig(id?: string | null): StorefrontConfig {
  const key = String(id ?? '').replace(/\\D/g, '');
  return CONFIGS[key] ?? CONFIGS[ECOMBIO_ID];
}

/** Resolve a configured brand from the request hostname, with a deployment-ID fallback for previews. */
export function getStorefrontIdForHostname(hostname: string, fallbackId?: string | null): string {
  const normalized = hostname.toLowerCase().replace(/:\\d+$/, '');
  return HOST_STOREFRONT_IDS[normalized] ?? String(fallbackId ?? ECOMBIO_ID);
}

// Subsidiary content (pages, collections) shares one Shopify store, so brand ownership is encoded in the handle prefix.
// A handle owned by another brand must 404 on this storefront.
const SUBSIDIARY_PREFIX = /^(bicyclebio|scooterbio|skaterbio)-/i;

export function brandPrefixOf(handle: string): string | null {
  const match = SUBSIDIARY_PREFIX.exec(handle);
  return match ? match[1].toLowerCase() : null;
}

export function isOtherBrandHandle(handle: string, currentSlug: string): boolean {
  const owner = brandPrefixOf(handle);
  return owner !== null && owner !== currentSlug;
}
