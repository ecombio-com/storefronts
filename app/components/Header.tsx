import {Suspense, type ReactNode} from 'react';
import {Await, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import {CreditCard, LifeBuoy, Repeat, ShieldCheck} from 'lucide-react';
import LocalizedLink from '~/components/ui/localized-link';
import {useUrlLocale} from '~/components/ui/locale-context';
import {BagIcon, PersonIcon} from '~/components/ui/icons';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {Container} from '~/components/ui/container';
import {ScrollFade} from '~/components/nav/scroll-fade';
import {QuickLinks} from '~/components/nav/quick-links';
import {NavScrollBehavior} from '~/components/nav/nav-scroll-behavior';
import {NavHeightSync} from '~/components/nav/nav-height-sync';
import {SearchModal} from '~/components/nav/search-modal';
import {MobileMenu} from '~/components/nav/mobile-menu';
import {Announcement} from '~/components/nav/announcement-bar';
import {ZipCode} from '~/components/nav/zip-code';
import {LocaleBar} from '~/components/nav/locale-bar';
import {parseNavMenu, type MenuItem, type RawMenuItem} from '~/lib/menu';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

const FALLBACK_ITEMS: MenuItem[] = [
  {id: 'default-nav-shop', title: 'Shop', url: '/collections/all', image: null, items: []},
];

// Tier 1 (thin utility bar). Make sure each URL exists.
const UTILITY_LINKS = [
  {label: 'The Ecombio Promise', url: '/pages/contact', icon: ShieldCheck},
  {label: 'Shipping & returns', url: '/policies/shipping-policy', icon: null},
  {label: 'Journal', url: '/blogs', icon: null},
];

// Tier 3, right side.
const EXTRA_LINKS = [
  {label: 'Pay over time', url: '/pages/financing', icon: CreditCard, className: ''},
  {label: 'Trade in', url: '/pages/trade-in', icon: Repeat, className: ''},
  {label: 'Support', url: '/pages/contact', icon: LifeBuoy, className: 'hidden xl:block'},
];

const SKIP_LINK =
  'sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-ds-md focus:bg-background focus:px-ds-regular focus:py-2 focus:text-ds-regular focus:font-medium focus:shadow-ds-drop-md focus:ring-2 focus:ring-foreground focus:outline-none';

export function Header({header, isLoggedIn, cart, publicStoreDomain}: HeaderProps) {
  const {shop, menu} = header;
  const parsed = parseNavMenu(
    (menu?.items ?? []) as unknown as RawMenuItem[],
    publicStoreDomain,
    shop.primaryDomain.url,
  );
  const navItems = parsed.length > 0 ? parsed : FALLBACK_ITEMS;
  return (
    <>
      <a href="#main-content" className={SKIP_LINK}>
        Skip to content
      </a>
      <header
        id="nav-outer"
        className="sticky top-0 z-30 w-full border-b border-border-subtle bg-card pt-[env(safe-area-inset-top,0px)]"
      >
        <NavScrollBehavior />
        <NavHeightSync />
        <Announcement />

        {/* Tier 1: utility bar (desktop only) */}
        <div className="hidden md:block">
          <Container className="flex h-8 items-center gap-6 text-ds-small font-medium">
            <ScrollFade className="min-w-0 flex-1" innerClassName="gap-6">
              {UTILITY_LINKS.map((link) => (
                <LocalizedLink
                  key={link.url}
                  href={link.url}
                  className="flex items-center gap-1.5 whitespace-nowrap transition-opacity hover:opacity-70"
                >
                  {link.icon && <link.icon className="size-3.5" aria-hidden="true" />}
                  {link.label}
                </LocalizedLink>
              ))}
            </ScrollFade>
            <div className="flex shrink-0 items-center gap-4">
              <ZipCode />
              <LocaleBar />
            </div>
          </Container>
        </div>

        {/* Tier 2: logo, search pill, help, account, cart. Search wraps to its own row on mobile. */}
        <Container className="flex flex-wrap items-center gap-x-2.5 gap-y-2 py-2 md:flex-nowrap md:gap-5">
          <div className="flex-1 basis-0 md:hidden">
            <MobileMenu items={navItems} isLoggedIn={isLoggedIn} />
          </div>

          <LocalizedLink
            href="/"
            aria-label={`${shop.name} home`}
            className="flex shrink-0 items-center"
          >
            <img src="/logo.svg" alt={shop.name} width={140} height={36} className="h-9 w-auto" />
          </LocalizedLink>

          <div className="order-last w-full md:order-none md:w-auto md:min-w-0 md:flex-1">
            <SearchModal />
          </div>

          <div className="ml-auto flex flex-1 basis-0 items-center justify-end gap-5 md:flex-none md:basis-auto">
            <LocalizedLink
              href="/pages/contact"
              className="hidden whitespace-nowrap text-ds-regular font-medium hover:opacity-70 lg:inline"
            >
              Need help?
            </LocalizedLink>
            <LocalizedLink
              href="/pages/business"
              className="hidden whitespace-nowrap text-ds-regular font-medium hover:opacity-70 lg:inline"
            >
              For business
            </LocalizedLink>
            <AccountLink isLoggedIn={isLoggedIn} />
            <CartToggle cart={cart} />
          </div>
        </Container>

        {/* Tier 3: category links scroll in their own region; extra links stay fixed on the right */}
        <Container className="hidden items-center gap-6 md:flex">
          <ScrollFade className="min-w-0 flex-1">
            <QuickLinks items={navItems} />
          </ScrollFade>
          <ul className="flex shrink-0 items-center gap-5 whitespace-nowrap text-ds-regular font-medium">
            {EXTRA_LINKS.map((link) => (
              <li key={link.url} className={link.className}>
                <LocalizedLink
                  href={link.url}
                  className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
                >
                  <link.icon className="size-4" aria-hidden="true" />
                  {link.label}
                </LocalizedLink>
              </li>
            ))}
          </ul>
        </Container>

        {/* Blog reading progress: hidden unless an article sets data-reading on <html> */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -bottom-px hidden h-0.5 bg-foreground/15 [:root[data-reading]_&]:block"
        >
          <div
            className="h-full origin-left bg-foreground"
            style={{transform: 'scaleX(var(--reading-progress, 0))'}}
          />
        </div>
      </header>
    </>
  );
}

// Sign-in is a plain <a>: a full document navigation that is never prefetched (it ends in an OAuth redirect).
function AccountLink({isLoggedIn}: Pick<HeaderProps, 'isLoggedIn'>) {
  const locale = useUrlLocale();
  const prefix = locale ? `/${locale}` : '';
  const cls = 'inline-flex items-center gap-1.5 text-ds-regular font-medium hover:opacity-70';
  const content = (label: string) => (
    <>
      <PersonIcon className="size-5" aria-hidden="true" />
      <span className="sr-only">{label}</span>
      <span aria-hidden="true" className="hidden lg:inline">
        {label}
      </span>
    </>
  );
  const signIn = (
    <a href={`${prefix}/account/login`} className={cls}>
      {content('Sign in')}
    </a>
  );
  return (
    <Suspense fallback={signIn}>
      <Await resolve={isLoggedIn} errorElement={signIn}>
        {(loggedIn) =>
          loggedIn ? (
            <LocalizedLink href="/account" prefetch="none" className={cls}>
              {content('Account')}
            </LocalizedLink>
          ) : (
            signIn
          )
        }
      </Await>
    </Suspense>
  );
}

function CartBadge({count}: {count: number}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();
  const locale = useUrlLocale();
  const label = count > 0 ? `Cart, ${count} ${count === 1 ? 'item' : 'items'}` : 'Cart';

  return (
    <a
      href={`${locale ? `/${locale}` : ''}/cart`}
      aria-label={label}
      className="inline-flex items-center gap-1.5 text-foreground hover:opacity-70"
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
    >
      <span className="relative">
        <BagIcon className="size-5" />
        {count > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-2 flex size-4 items-center justify-center rounded-full bg-foreground text-xxs leading-none text-background"
          >
            {count}
          </span>
        )}
      </span>
    </a>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}
