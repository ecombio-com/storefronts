import {DEFAULT_LOCALE, ENABLED_LOCALES} from '~/lib/i18n';

export type Market = {code: string; locales: string[]};

// Each language is named in its own language; every en-XX locale reads "English".
const LANGUAGE_NAMES: Record<string, string> = {
  de: 'Deutsch',
  en: 'English',
  es: 'Español',
  fr: 'Français',
};

const REGIONS = new Intl.DisplayNames(['en'], {type: 'region'});

export function languageLabel(locale: string): string {
  return LANGUAGE_NAMES[locale.split('-')[0] ?? ''] ?? locale;
}

export function regionName(code: string): string {
  return REGIONS.of(code) ?? code;
}

// One entry per country, built from the live locales. The first locale is that country's default language.
export const MARKETS: Market[] = Object.values(
  (ENABLED_LOCALES as readonly string[]).reduce<Record<string, Market>>((acc, locale) => {
    const code = (locale.split('-')[1] ?? 'us').toUpperCase();
    (acc[code] ??= {code, locales: []}).locales.push(locale);
    return acc;
  }, {}),
);

export function primaryLocale(market: Market): string {
  return market.locales[0] ?? DEFAULT_LOCALE;
}

export function localeFromPath(pathname: string): string {
  const first = pathname.split('/')[1]?.toLowerCase() ?? '';
  return (ENABLED_LOCALES as readonly string[]).includes(first) ? first : DEFAULT_LOCALE;
}

// Same page in another locale. A plain <a href> on purpose: LocalizedLink keeps the current
// locale, and a full navigation restarts the cart and search in the new market.
export function localeHref(target: string, pathname: string, search = '', hash = ''): string {
  const current = localeFromPath(pathname);
  const prefix = `/${current}`;
  const lower = pathname.toLowerCase();
  const rest = lower === prefix || lower.startsWith(`${prefix}/`) ? pathname.slice(prefix.length) : pathname;
  return `/${target}${rest === '/' ? '' : rest}${search}${hash}`;
}
