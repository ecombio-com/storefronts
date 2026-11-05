// Path: app/lib/image-url.ts
// Shopify CDN resizing via the `width` query parameter.
export function shopifyImageUrl(url: string, width: number): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'cdn.shopify.com') return url;
    parsed.searchParams.set('width', String(width));
    return parsed.toString();
  } catch {
    return url;
  }
}

export function shopifyImageSrcSet(url: string, widths: number[]): string {
  return widths.map((width) => `${shopifyImageUrl(url, width)} ${width}w`).join(', ');
}
