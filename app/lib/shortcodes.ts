// Path: app/lib/shortcodes.ts
// Layout shortcodes for blog articles and pages. Ported unchanged from the Next.js storefront.
export interface BodyHeading {
  id: string;
  level: 2 | 3;
  text: string;
}

export type BodySegment =
  | {html: string; type: 'html'}
  | {html: string; title: string; type: 'accordion'}
  | {href: string; label: string; type: 'button'}
  | {handles: string[]; href?: string | undefined; title?: string | undefined; type: 'products'}
  | {image?: string | undefined; title: string; type: 'hero'}
  | {href: string; label: string; type: 'pill'}
  | {label: string; type: 'stat'; unit?: string | undefined; value: string}
  | {id?: string | undefined; text: string; title: string; type: 'band'}
  | {
      button?: {href: string; label: string} | undefined;
      image?: string | undefined;
      text: string;
      title: string;
      type: 'split';
    };

const SHORTCODE = new RegExp(
  [
    String.raw`<p>\s*\[accordion:\s*([^\]]+?)\s*\]\s*</p>([\s\S]*?)<p>\s*\[/accordion\]\s*</p>`,
    String.raw`<p>\s*\[button:\s*([^|\]]+?)\s*\|\s*([^\]]+?)\s*\]\s*</p>`,
    String.raw`<p>\s*\[products:\s*([^\]]+?)\s*\]\s*</p>`,
    String.raw`<p>\s*\[hero:\s*([^|\]]+?)\s*(?:\|\s*([^\]]+?)\s*)?\]\s*</p>`,
    String.raw`<p>\s*\[pill:\s*([^|\]]+?)\s*\|\s*([^\]]+?)\s*\]\s*</p>`,
    String.raw`<p>\s*\[stat:\s*([^|\]]+?)\s*\|\s*([^|\]]*?)\s*\|\s*([^\]]+?)\s*\]\s*</p>`,
    String.raw`<p>\s*\[band:\s*([^\]]+?)\s*\]\s*</p>([\s\S]*?)<p>\s*\[/band\]\s*</p>`,
    String.raw`<p>\s*\[split:\s*([^\]]+?)\s*\]\s*</p>([\s\S]*?)<p>\s*\[/split\]\s*</p>`,
  ].join('|'),
  'gi',
);

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function plainText(value: string): string {
  return decodeEntities(value.replace(/<[^>]+>/g, '')).trim();
}

function safeHref(value: string): string | null {
  const href = value.trim();
  if (href.includes('\\') || href.startsWith('//')) return null;
  return href.startsWith('/') || href.startsWith('https://') ? href : null;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function blockText(html: string): string {
  return plainText(html.replace(/<\/(?:p|h[1-6]|li)>/gi, ' '));
}

function pushBlockSegment(match: RegExpMatchArray, segments: BodySegment[]): void {
  if (match[6] !== undefined) {
    segments.push({
      image: plainText(match[7] ?? '') || undefined,
      title: plainText(match[6]),
      type: 'hero',
    });
  } else if (match[8] !== undefined) {
    segments.push({href: plainText(match[9] ?? ''), label: plainText(match[8]), type: 'pill'});
  } else if (match[10] !== undefined) {
    segments.push({
      label: plainText(match[12] ?? ''),
      type: 'stat',
      unit: plainText(match[11] ?? '') || undefined,
      value: plainText(match[10]),
    });
  } else if (match[13] !== undefined) {
    const head = match[13].split('|').map((part) => plainText(part));
    const title = (head.length > 1 ? head[1] : head[0]) ?? '';
    const id = (head.length > 1 ? head[0] : slugify(title)) ?? '';
    segments.push({id: id || undefined, text: blockText(match[14] ?? ''), title, type: 'band'});
  } else if (match[15] !== undefined) {
    const [title = '', image = '', label = '', href = ''] = match[15]
      .split('|')
      .map((part) => plainText(part));
    segments.push({
      button: label && href ? {href, label} : undefined,
      image: image || undefined,
      text: blockText(match[16] ?? ''),
      title,
      type: 'split',
    });
  }
}

export function parseBody(html: string): BodySegment[] {
  const segments: BodySegment[] = [];
  let last = 0;
  for (const match of html.matchAll(SHORTCODE)) {
    const index = match.index ?? 0;
    if (index > last) segments.push({html: html.slice(last, index), type: 'html'});
    if (match[1] !== undefined) {
      segments.push({html: match[2] ?? '', title: plainText(match[1]), type: 'accordion'});
    } else if (match[3] !== undefined) {
      const href = safeHref(plainText(match[3]));
      if (href) segments.push({href, label: plainText(match[4] ?? ''), type: 'button'});
    } else if (match[5] !== undefined) {
      const parts = match[5].split('|').map((part) => plainText(part));
      const handles = (parts.at(-1) ?? '')
        .split(',')
        .map((handle) => handle.trim().toLowerCase())
        .filter(Boolean);
      const title = parts.length > 1 ? parts[0] : undefined;
      const href = parts.length > 2 ? (safeHref(parts[1] ?? '') ?? undefined) : undefined;
      if (handles.length > 0)
        segments.push({handles: [...new Set(handles)], href, title, type: 'products'});
    }
    pushBlockSegment(match, segments);
    last = index + match[0].length;
  }
  if (last < html.length) segments.push({html: html.slice(last), type: 'html'});
  return segments;
}

export function addHeadingIds(html: string, headings: BodyHeading[]): string {
  return html.replace(
    /<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi,
    (match, level: string, attrs: string | undefined, inner: string) => {
      const text = plainText(inner);
      if (!text) return match;
      const base = slugify(text) || 'section';
      let id = base;
      let n = 2;
      while (headings.some((heading) => heading.id === id)) id = `${base}-${n++}`;
      headings.push({id, level: Number(level) as 2 | 3, text});
      const cleanAttrs = (attrs ?? '').replace(/\sid="[^"]*"/i, '');
      return `<h${level}${cleanAttrs} id="${id}">${inner}</h${level}>`;
    },
  );
}
