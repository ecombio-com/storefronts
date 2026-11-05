// Path: app/lib/collection-seo.ts
// Canonical URL and JSON-LD shared by the standard and hub collection pages.
import {getLocaleFromRequest} from '~/lib/i18n';

export function buildCollectionSeo({
  collection,
  parent,
  request,
}: {
  collection: {handle: string; title: string; description: string; updatedAt: string};
  parent?: {handle: string; title: string} | null;
  request: Request;
}) {
  const url = new URL(request.url);
  const prefix = getLocaleFromRequest(request).pathPrefix;
  const abs = (path: string) => `${url.origin}${prefix}${path === '/' ? '' : path}`;
  const crumbs = [
    {name: 'Ecombio', path: '/'},
    ...(parent ? [{name: parent.title, path: `/collections/${parent.handle}`}] : []),
    {name: collection.title, path: `/collections/${collection.handle}`},
  ];
  return {
    breadcrumbLd: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: abs(crumb.path),
      })),
    },
    canonicalUrl: url.origin + url.pathname,
    collectionLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: collection.title,
      description: collection.description,
      url: abs(`/collections/${collection.handle}`),
      dateModified: collection.updatedAt,
    },
  };
}
