// Algolia objectIDs are numeric Shopify product IDs. Storefront `nodes(ids:)` needs full GIDs.

export function productGid(objectID: string): string {
  return objectID.startsWith('gid://')
    ? objectID
    : `gid://shopify/Product/${objectID}`;
}

export function productGids(objectIDs: string[]): string[] {
  return objectIDs.map(productGid);
}

/** "gid://shopify/Product/123" -> "123". Event and index IDs are numeric. */
export function productObjectId(id: string): string {
  return id.startsWith('gid://') ? (id.split('/').pop() ?? id) : id;
}