import { createContext, type ReactNode, useContext } from "react";

// Locale path prefix such as "es" (no slashes). null or empty means the default locale, which has no prefix.
export type UrlLocale = string;

const LocaleContext = createContext<UrlLocale | null>(null);

export function LocaleProvider({ children, locale }: { children: ReactNode; locale: UrlLocale | null }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useUrlLocale(): UrlLocale | null {
  return useContext(LocaleContext);
}
