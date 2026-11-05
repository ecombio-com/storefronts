import type {I18nBase} from '@shopify/hydrogen';

export interface I18nLocale extends I18nBase {
  pathPrefix: string;
}

// Live locales. A prefix not listed here resolves to the default, so the
// guard in routes/($locale).tsx sees a mismatch and returns 404.
export const ENABLED_LOCALES = ['en-us'] as const;
export const DEFAULT_LOCALE = 'en-us';

export function getLocaleFromRequest(request: Request): I18nLocale {
  const first =
    new URL(request.url).pathname.split('/')[1]?.toLowerCase() ?? '';
  const locale = (ENABLED_LOCALES as readonly string[]).includes(first)
    ? first
    : DEFAULT_LOCALE;
  const [language, country] = locale.toUpperCase().split('-') as [
    I18nLocale['language'],
    I18nLocale['country'],
  ];
  return {language, country, pathPrefix: `/${locale}`};
}

const LOCALE_SHAPE = /^\/([a-z]{2}-[a-z]{2})(?=\/|$)/i;
const SKIP =
  /^\/(assets|graphiql|subrequest-profiler|__|@|node_modules|\.well-known)(\/|$)|^\/account\/authorize\/?$|\.[a-z0-9]+$/i;

// 308 unprefixed URLs to the default locale and mixed-case prefixes to lowercase.
// Unknown prefixes (e.g. /zz-zz) fall through so the 404 guard handles them.
export function localeRedirect(request: Request): Response | null {
  if (request.method !== 'GET' && request.method !== 'HEAD') return null;
  const url = new URL(request.url);
  const {pathname} = url;
  if (pathname.endsWith('/__manifest')) return null;
  if (SKIP.test(pathname)) return null;
  const match = pathname.match(LOCALE_SHAPE);
  let target: string | null = null;
  if (match) {
    const lower = match[1].toLowerCase();
    if (match[1] !== lower && (ENABLED_LOCALES as readonly string[]).includes(lower)) {
      target = '/' + lower + pathname.slice(match[0].length);
    }
  } else {
    target = `/${DEFAULT_LOCALE}${pathname === '/' ? '' : pathname}`;
  }
  if (!target) return null;
  return new Response(null, {
    status: 308,
    headers: {Location: target + url.search},
  });
}
