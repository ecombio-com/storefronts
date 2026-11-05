// Path: app/lib/blog.ts
// Blog types and pure helpers. No server imports, so loaders and components can both use it.

export type BlogImage = {altText: string; height: number; url: string; width: number};
export type BlogSeo = {description: string; title: string};

export type AuthorProfile = {
  bio?: string | undefined;
  handle?: string | undefined;
  name: string;
  photo?: BlogImage | undefined;
  role?: string | undefined;
};

export type BlogArticle = {
  author?: string | undefined;
  authorProfile?: AuthorProfile | undefined;
  blogHandle: string;
  blogTitle: string;
  body?: string | undefined;
  excerpt: string;
  handle: string;
  image: BlogImage | null;
  publishedAt: string;
  seo: BlogSeo;
  tags: string[];
  title: string;
};

export type Blog = {articles: BlogArticle[]; handle: string; seo: BlogSeo; title: string};
export type BlogListItem = {handle: string; parentHandle?: string | undefined; title: string};

type RawImage = {
  altText?: string | null;
  height?: number | null;
  url: string;
  width?: number | null;
};
type RawField = {value?: string | null} | null | undefined;

export type RawArticle = {
  authorProfile?: {
    reference?: {
      bio?: RawField;
      handle?: string;
      name?: RawField;
      photo?: {reference?: {image?: RawImage | null} | null} | null;
      role?: RawField;
    } | null;
  } | null;
  authorV2?: {name: string} | null;
  content?: string | null;
  contentHtml?: string | null;
  excerpt?: string | null;
  handle: string;
  image?: RawImage | null;
  publishedAt: string;
  seo?: {description?: string | null; title?: string | null} | null;
  tags?: string[] | null;
  title: string;
};

export function sizedImage(url: string, width: number): string {
  return url + (url.includes('?') ? '&' : '?') + 'width=' + width;
}

function toImage(image: RawImage | null | undefined, alt: string): BlogImage | null {
  return image
    ? {
        altText: image.altText ?? alt,
        height: image.height ?? 0,
        url: image.url,
        width: image.width ?? 0,
      }
    : null;
}

function transformAuthorProfile(meta: RawArticle['authorProfile']): AuthorProfile | undefined {
  const ref = meta?.reference;
  const name = ref?.name?.value;
  if (!ref || !name) return undefined;
  return {
    bio: ref.bio?.value ?? undefined,
    handle: ref.handle,
    name,
    photo: toImage(ref.photo?.reference?.image, name) ?? undefined,
    role: ref.role?.value ?? undefined,
  };
}

export function transformArticle(
  article: RawArticle,
  blog: {handle: string; title: string},
): BlogArticle {
  const excerpt = article.excerpt ?? article.content ?? '';
  return {
    author: article.authorV2?.name,
    authorProfile: transformAuthorProfile(article.authorProfile),
    blogHandle: blog.handle,
    blogTitle: blog.title,
    body: article.contentHtml ?? undefined,
    excerpt,
    handle: article.handle,
    image: toImage(article.image, article.title),
    publishedAt: article.publishedAt,
    seo: {
      description: article.seo?.description ?? excerpt,
      title: article.seo?.title ?? article.title,
    },
    tags: article.tags ?? [],
    title: article.title,
  };
}

// ---------- tags ----------

export type BlogTag = {count: number; handle: string; label: string};

export function tagToHandle(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function collectTags(articles: BlogArticle[]): BlogTag[] {
  const map = new Map<string, BlogTag>();
  for (const article of articles) {
    for (const label of article.tags) {
      const handle = tagToHandle(label);
      if (!handle) continue;
      const existing = map.get(handle);
      if (existing) existing.count += 1;
      else map.set(handle, {count: 1, handle, label});
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

// ---------- blogs, authors, related ----------

const MAX_DEPTH = 5;

/** Ancestors of a blog, top-most first. Guards against loops and missing parents. */
export function getBlogAncestors(handle: string, blogs: BlogListItem[]): BlogListItem[] {
  const byHandle = new Map(blogs.map((b) => [b.handle, b]));
  const chain: BlogListItem[] = [];
  const seen = new Set([handle]);
  let current = byHandle.get(handle)?.parentHandle;
  while (current && !seen.has(current) && chain.length < MAX_DEPTH) {
    const parent = byHandle.get(current);
    if (!parent) break;
    seen.add(current);
    chain.unshift(parent);
    current = parent.parentHandle;
  }
  return chain;
}

// The Author metaobject's handle wins; posts without a profile fall back to the staff name.
export function authorKey(article: BlogArticle): string | undefined {
  if (article.authorProfile?.handle) return article.authorProfile.handle;
  return article.author ? tagToHandle(article.author) : undefined;
}

export function getRelatedArticles(
  article: BlogArticle,
  all: BlogArticle[],
  limit = 8,
): BlogArticle[] {
  const tags = new Set(article.tags.map((tag) => tag.toLowerCase()));
  return all
    .filter((other) => other.handle !== article.handle)
    .map((other) => ({
      other,
      score:
        other.tags.filter((tag) => tags.has(tag.toLowerCase())).length * 2 +
        (other.blogHandle === article.blogHandle ? 1 : 0),
    }))
    .sort(
      (a, b) =>
        b.score - a.score || Date.parse(b.other.publishedAt) - Date.parse(a.other.publishedAt),
    )
    .slice(0, limit)
    .map(({other}) => other);
}

export function readMinutes(body: string): number {
  const words = body
    .replace(/<[^>]*>/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export type CategoryCopy = {description: string; subtitle: string; title: string};

/** Curated copy per blog handle. Categories without an entry fall back to Shopify SEO fields. */
const CATEGORY_COPY: Record<string, CategoryCopy> = {
  'electric-bikes': {
    description:
      'How to choose an electric bike, understand e-bike classes, care for your battery and ride with confidence. Guides from Ecombio.',
    subtitle: 'Guides, comparisons and tips for choosing, riding and caring for your e-bike.',
    title: 'Electric Bikes: Guides, Tips & Advice',
  },
};

export function getCategoryCopy(handle: string): CategoryCopy | undefined {
  return CATEGORY_COPY[handle];
}

// ---------- journal index ----------

export type JournalEntry = {article: BlogArticle; category: string};
export type JournalChip = {handle: string; label: string};
export type JournalSection = {
  chips: JournalChip[];
  entries: JournalEntry[];
  id: string;
  subtitle: string;
  title: string;
};

export const FALLBACK_SECTION_ID = 'more';

const SECTIONS: Array<Omit<JournalSection, 'entries'> & {match: string[]}> = [
  {
    chips: [
      {handle: 'buying-guides', label: 'Buying Guides'},
      {handle: 'beginners', label: 'Beginners'},
      {handle: 'electric-bikes', label: 'Electric Bikes'},
    ],
    id: 'your-e-bike',
    match: ['buying-guides', 'beginners'],
    subtitle: 'Guides and advice to find the right electric bike for you (and your budget).',
    title: 'Your e-bike',
  },
  {
    chips: [
      {handle: 'maintenance', label: 'Maintenance'},
      {handle: 'safety', label: 'Safety'},
      {handle: 'accessories', label: 'Accessories'},
    ],
    id: 'ride-and-maintain',
    match: ['maintenance', 'safety', 'accessories'],
    subtitle: 'Keep your battery, brakes and tires in top shape, season after season.',
    title: 'Ride & maintain',
  },
  {
    chips: [
      {handle: 'cycling-guides', label: 'Cycling Guides'},
      {handle: 'electric-bikes', label: 'Electric Bikes'},
    ],
    id: 'cycling-life',
    match: ['cycling-guides'],
    subtitle: 'Routes, habits and real-world advice from people who ride every day.',
    title: 'Cycling life',
  },
];

export function groupIntoSections(entries: JournalEntry[]): JournalSection[] {
  const sections: JournalSection[] = SECTIONS.map(({match: _match, ...rest}) => ({
    ...rest,
    entries: [],
  }));
  const fallback: JournalSection = {
    chips: [],
    entries: [],
    id: FALLBACK_SECTION_ID,
    subtitle: 'More from the Journal.',
    title: 'More from the Journal',
  };
  for (const entry of entries) {
    const handles = new Set(collectTags([entry.article]).map((tag) => tag.handle));
    const index = SECTIONS.findIndex((section) => section.match.some((h) => handles.has(h)));
    (index === -1 ? fallback : sections[index]).entries.push(entry);
  }
  return [...sections, fallback].filter((section) => section.entries.length > 0);
}

// ---------- meta ----------

export function buildMeta(args: {
  description: string;
  image?: string | undefined;
  title: string;
  type?: 'article' | 'website';
  url: string;
}) {
  const {description, image, title, type = 'website', url} = args;
  return [
    {title},
    {name: 'description', content: description},
    {tagName: 'link', rel: 'canonical', href: url},
    {property: 'og:type', content: type},
    {property: 'og:site_name', content: 'Ecombio'},
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
    {property: 'og:url', content: url},
    ...(image ? [{property: 'og:image', content: image}] : []),
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: title},
    {name: 'twitter:description', content: description},
    ...(image ? [{name: 'twitter:image', content: image}] : []),
  ];
}

export function buildBreadcrumbLd(
  items: Array<{name: string; path: string}>,
  abs: (path: string) => string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}
