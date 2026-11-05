import {Suspense} from 'react';
import {Await} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {Container} from '~/components/ui/container';
import LocalizedLink from '~/components/ui/localized-link';
import {Newsletter} from '~/components/footer/newsletter';
import {PaymentIcons} from '~/components/footer/payment-icons';
import {SocialLinks, type SocialLink} from '~/components/footer/social-links';

// TODO: replace these placeholder URLs with the real Ecombio accounts (carried over from the Next app)
const SOCIAL_LINKS: SocialLink[] = [
  {platform: 'instagram', url: 'https://www.instagram.com/'},
  {platform: 'tiktok', url: 'https://www.tiktok.com/'},
  {platform: 'youtube', url: 'https://www.youtube.com/'},
  {platform: 'linkedin', url: 'https://www.linkedin.com/'},
];

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

type FooterMenuItem = {
  id: string;
  title: string;
  url?: string | null;
  items?: FooterMenuItem[];
};

export function Footer({
  footer: footerPromise,
  header,
  publicStoreDomain,
}: FooterProps) {
  const siteName = header.shop.name;
  const primaryDomainUrl = header.shop.primaryDomain?.url ?? '';

  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {(footer) => {
          const items = ((footer?.menu?.items ?? []) as FooterMenuItem[]).slice(0, 5);
          return (
            <footer className="border-t border-border-subtle bg-card">
              <Container className="pt-20 pb-10">
                <div className="flex flex-col gap-10">
                  <Newsletter />
                  {items.length > 0 && (
                    <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:grid-cols-5">
                      {items.map((column, index) => (
                        <div key={column.id} className="space-y-3">
                          {column.url ? (
                            <MenuLink
                              url={internalUrl(column.url, publicStoreDomain, primaryDomainUrl)}
                              className="block text-ds-regular font-semibold transition-opacity hover:opacity-70"
                            >
                              {column.title}
                            </MenuLink>
                          ) : (
                            <h3 className="text-ds-regular font-semibold">{column.title}</h3>
                          )}
                          {(column.items?.length ?? 0) > 0 && (
                            <ul className="space-y-2">
                              {column.items!.map((leaf) => (
                                <li key={leaf.id}>
                                  <MenuLink
                                    url={internalUrl(leaf.url ?? '', publicStoreDomain, primaryDomainUrl)}
                                    className="block text-ds-regular text-foreground transition-opacity hover:opacity-70"
                                  >
                                    {leaf.title}
                                  </MenuLink>
                                </li>
                              ))}
                            </ul>
                          )}
                          {index === 0 && <SocialLinks links={SOCIAL_LINKS} />}
                          {index === Math.min(2, items.length - 1) && <PaymentIcons />}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-col items-center justify-between gap-5 border-t border-border-subtle pt-8 sm:flex-row">
                    <p className="text-ds-regular leading-5 text-muted-foreground">
                      &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
                    </p>
                    {/* TODO: policy links (needs a shop policies query) */}
                  </div>
                  <p className="text-center text-ds-small text-muted-foreground sm:text-left">
                    Address search by{' '}
                    <a href="https://www.geoapify.com/" target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-foreground">Geoapify</a>{' '}
                    &copy;{' '}
                    <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-foreground">OpenStreetMap</a>{' '}
                    contributors
                  </p>
                </div>
              </Container>
            </footer>
          );
        }}
      </Await>
    </Suspense>
  );
}

function internalUrl(url: string, publicStoreDomain: string, primaryDomainUrl: string) {
  if (!url) return '/';
  const isInternal =
    url.includes('myshopify.com') ||
    url.includes(publicStoreDomain) ||
    (primaryDomainUrl && url.includes(primaryDomainUrl));
  return isInternal ? new URL(url).pathname : url;
}

function MenuLink({url, children, className}: {url: string; children: React.ReactNode; className?: string}) {
  if (url.startsWith('http')) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <LocalizedLink href={url} className={className}>
      {children}
    </LocalizedLink>
  );
}

