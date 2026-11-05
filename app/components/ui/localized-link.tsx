import { Link } from "react-router";
import type { ComponentProps } from "react";

import { useUrlLocale } from "~/components/ui/locale-context";

type LocalizedLinkProps = Omit<ComponentProps<typeof Link>, "to"> & { href: string };

function withLocale(href: string, locale: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const prefix = `/${locale}`;
  if (
    href === prefix ||
    href.startsWith(`${prefix}/`) ||
    href.startsWith(`${prefix}?`) ||
    href.startsWith(`${prefix}#`)
  ) {
    return href;
  }
  return href === "/" ? prefix : `${prefix}${href}`;
}

// Drop-in for the old next/link wrapper: prefixes internal hrefs with the URL locale from context.
export default function LocalizedLink({ href, ...props }: LocalizedLinkProps) {
  const locale = useUrlLocale();
  return <Link to={locale ? withLocale(href, locale) : href} {...props} />;
}
