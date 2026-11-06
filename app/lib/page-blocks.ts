import {parseBody, type BodySegment} from '~/lib/shortcodes';

export interface BlockLink {
  href: string;
  label: string;
}
export interface StatItem {
  label: string;
  unit?: string | undefined;
  value: string;
}

export type PageBlock =
  | {image?: string | undefined; links: BlockLink[]; title: string; type: 'hero'}
  | {html: string; type: 'text'}
  | {segments: BodySegment[]; type: 'body'}
  | {items: StatItem[]; type: 'stats'}
  | {id?: string | undefined; text: string; title: string; type: 'band'}
  | {
      button?: BlockLink | undefined;
      image?: string | undefined;
      text: string;
      title: string;
      type: 'split';
    };

type Raw = Record<string, unknown>;

const isRecord = (v: unknown): v is Raw =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

function text(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

function safeHref(v: unknown): string | undefined {
  const href = text(v);
  if (!href || href.includes('\\') || href.startsWith('//')) return undefined;
  return href.startsWith('/') || href.startsWith('#') || href.startsWith('https://')
    ? href
    : undefined;
}

function localImage(v: unknown): string | undefined {
  const src = text(v);
  if (!src || src.includes('\\') || src.startsWith('//')) return undefined;
  return src.startsWith('/') ? src : undefined;
}

function parseList<T>(v: unknown, parse: (item: unknown) => T | undefined): T[] {
  if (!Array.isArray(v)) return [];
  return v.flatMap((item: unknown) => {
    const parsed = parse(item);
    return parsed === undefined ? [] : [parsed];
  });
}

function parseLink(v: unknown): BlockLink | undefined {
  if (!isRecord(v)) return undefined;
  const label = text(v['label']);
  const href = safeHref(v['href']);
  return label && href ? {href, label} : undefined;
}

function parseStat(v: unknown): StatItem | undefined {
  if (!isRecord(v)) return undefined;
  const value = text(v['value']);
  const label = text(v['label']);
  return value && label ? {label, unit: text(v['unit']), value} : undefined;
}

function parseBlock(v: unknown): PageBlock | undefined {
  if (!isRecord(v)) return undefined;
  switch (v['type']) {
    case 'hero': {
      const title = text(v['title']);
      return title
        ? {image: localImage(v['image']), links: parseList(v['links'], parseLink), title, type: 'hero'}
        : undefined;
    }
    case 'text': {
      const html = text(v['html']);
      return html ? {html, type: 'text'} : undefined;
    }
    case 'stats': {
      const items = parseList(v['items'], parseStat);
      return items.length > 0 ? {items, type: 'stats'} : undefined;
    }
    case 'band': {
      const title = text(v['title']);
      const body = text(v['text']);
      const id = text(v['id']);
      return title && body
        ? {id: id && /^[a-z0-9-]+$/.test(id) ? id : undefined, text: body, title, type: 'band'}
        : undefined;
    }
    case 'split': {
      const title = text(v['title']);
      const body = text(v['text']);
      return title && body
        ? {
            button: parseLink(v['button']),
            image: localImage(v['image']),
            text: body,
            title,
            type: 'split',
          }
        : undefined;
    }
    default:
      return undefined;
  }
}

/** Turns a page body that uses layout shortcodes into blocks. Everything else becomes "body" blocks. */
export function pageBlocksFromBody(html: string): PageBlock[] {
  const blocks: PageBlock[] = [];
  for (const segment of parseBody(html)) {
    if (segment.type === 'html' && !segment.html.trim()) continue;
    const last = blocks.at(-1);
    switch (segment.type) {
      case 'hero': {
        const block = parseBlock({
          image: segment.image,
          links: [],
          title: segment.title,
          type: 'hero',
        });
        if (block) blocks.push(block);
        break;
      }
      case 'pill': {
        const link = parseLink({href: segment.href, label: segment.label});
        if (link && last?.type === 'hero') last.links.push(link);
        break;
      }
      case 'stat': {
        const item = parseStat({label: segment.label, unit: segment.unit, value: segment.value});
        if (!item) break;
        if (last?.type === 'stats') last.items.push(item);
        else blocks.push({items: [item], type: 'stats'});
        break;
      }
      case 'band':
      case 'split': {
        const block = parseBlock(segment);
        if (block) blocks.push(block);
        break;
      }
      default:
        if (last?.type === 'body') last.segments.push(segment);
        else blocks.push({segments: [segment], type: 'body'});
    }
  }
  return blocks;
}

/** Parses the custom.layout_blocks JSON. Bad JSON or unknown blocks are skipped, never thrown. */
export function parsePageBlocks(value: string | null | undefined): PageBlock[] {
  if (!value) return [];
  try {
    return parseList(JSON.parse(value), parseBlock);
  } catch {
    return [];
  }
}
