// Path: app/lib/hidden-pages.ts
// Shopify Pages that must never be reachable, listed or indexed on their own (same rule as the Next.js storefront):
// - after-item(s)-*: embedded in collections via custom.after_item_lists
// - technical-specifications-*: embedded elsewhere
// - frequently-asked-questions-*: embedded in product tabs
const HIDDEN_PAGE_HANDLE =
  /^(after-items?-|technical-specifications-|frequently-asked-questions-)/i;

export function isHiddenPageHandle(handle: string): boolean {
  return HIDDEN_PAGE_HANDLE.test(handle);
}
