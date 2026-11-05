export type MenuItemImage = {url: string; altText?: string | null};

export type MenuItem = {
  id: string;
  title: string;
  url: string;
  image: MenuItemImage | null;
  layout?: 'mega-menu' | 'image-grid' | 'link-list';
  items: MenuItem[];
};

export type RawMenuItem = {
  id: string;
  title: string;
  url?: string | null;
  resource?: {
    image?: MenuItemImage | null;
    products?: {nodes: {featuredImage?: MenuItemImage | null}[]};
  } | null;
  items?: RawMenuItem[];
};

const TAGS = [
  ['mega-menu', /^\s*\[mega-menu\]\s*/i],
  ['image-grid', /^\s*\[image-grid\]\s*/i],
  ['link-list', /^\s*\[link-list\]\s*/i],
] as const;

export function parseNavMenu(
  rawItems: RawMenuItem[],
  publicStoreDomain: string,
  primaryDomainUrl: string,
): MenuItem[] {
  const toPath = (url?: string | null) => {
    if (!url) return '/';
    const internal =
      url.includes('myshopify.com') ||
      (publicStoreDomain && url.includes(publicStoreDomain)) ||
      (primaryDomainUrl && url.includes(primaryDomainUrl));
    if (!internal) return url;
    try {
      const u = new URL(url); return u.pathname + u.search + u.hash;
    } catch {
      return url;
    }
  };

  const walk = (item: RawMenuItem): MenuItem => {
    const hit = TAGS.find(([, rx]) => rx.test(item.title));
    const res = item.resource;
    const img = res?.image ?? res?.products?.nodes?.[0]?.featuredImage ?? null;
    return {
      id: item.id,
      title: hit ? item.title.replace(hit[1], '') : item.title,
      url: toPath(item.url),
      image: img ? {url: img.url, altText: img.altText ?? null} : null,
      ...(hit ? {layout: hit[0]} : {}),
      items: (item.items ?? []).map(walk),
    };
  };
  return rawItems.map(walk);
}
