// Path: app/lib/product.ts
// Parsers for PDP metaobject metafields (trust badges, at-a-glance specs).

type MetaField = {
  key: string;
  value?: string | null;
  reference?: {image?: {url: string; altText?: string | null} | null; url?: string | null} | null;
};

type MetaobjectList =
  | {references?: {nodes: Array<{fields?: MetaField[]}>} | null}
  | null
  | undefined;

export type TrustBadge = {
  title: string;
  iconUrl?: string;
  iconAlt?: string;
  tooltip?: string;
  href?: string;
};

export type ProductSpec = {
  label: string;
  value: string;
  tooltip?: string;
  iconUrl?: string;
  iconAlt?: string;
  href?: string;
};

function fieldMap(fields: MetaField[] | undefined) {
  return Object.fromEntries((fields ?? []).map((f) => [f.key, f]));
}

function linkUrl(field: MetaField | undefined): string | undefined {
  if (!field?.value) return undefined;
  try {
    return (JSON.parse(field.value) as {url?: string}).url || undefined;
  } catch {
    return undefined;
  }
}

export function parseTrustBadges(metafield: MetaobjectList): TrustBadge[] {
  const badges: TrustBadge[] = [];
  for (const node of metafield?.references?.nodes ?? []) {
    const f = fieldMap(node.fields);
    const title = f.title?.value;
    if (!title) continue;
    const ref = f.icon?.reference;
    badges.push({
      title,
      iconUrl: ref?.image?.url ?? ref?.url ?? undefined,
      iconAlt: ref?.image?.altText ?? title,
      tooltip: f.tooltip?.value || undefined,
      href: linkUrl(f.link),
    });
  }
  return badges;
}

export function parseSpecs(metafield: MetaobjectList): ProductSpec[] {
  const specs: ProductSpec[] = [];
  for (const node of metafield?.references?.nodes ?? []) {
    const f = fieldMap(node.fields);
    const label = f.label?.value;
    const value = f.value?.value;
    if (!label || !value) continue;
    const ref = f.icon?.reference;
    specs.push({
      label,
      value,
      tooltip: f.tooltip?.value || undefined,
      iconUrl: ref?.image?.url ?? ref?.url ?? undefined,
      iconAlt: ref?.image?.altText ?? label,
      href: linkUrl(f.link),
    });
  }
  return specs;
}

export function getYouTubeId(url?: string | null) {
  return url?.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/)?.[1];
}

const ACCORDION =
  /(?:<p>\s*)?\[accordion:\s*([^\]]*?)\s*\](?:\s*<\/p>)?([\s\S]*?)(?:<p>\s*)?\[\/accordion\](?:\s*<\/p>)?/g;

export function parseAccordions(html: string) {
  return Array.from(html.matchAll(ACCORDION), (m) => ({
    question: m[1],
    answer: m[2].trim(),
  }));
}

export function parsePopularSearches(mf?: {value?: string | null} | null): string[] {
  if (!mf?.value) return [];
  try {
    const p: unknown = JSON.parse(mf.value);
    return Array.isArray(p)
      ? p.filter((v): v is string => typeof v === 'string' && v.trim() !== '')
      : [];
  } catch {
    return [];
  }
}

type IntMf = {value?: string | null} | null | undefined;
const days = (f: IntMf) => {
  const n = Number.parseInt(f?.value ?? '', 10);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

export function parseDelivery(p: {
  handlingDaysMin?: IntMf;
  handlingDaysMax?: IntMf;
  transitExtraDays?: IntMf;
}) {
  const d = {
    handlingDaysMin: days(p.handlingDaysMin),
    handlingDaysMax: days(p.handlingDaysMax),
    transitExtraDays: days(p.transitExtraDays),
  };
  return Object.values(d).every((v) => v === undefined) ? undefined : d;
}