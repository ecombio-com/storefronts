import {LogOut, MapPin, Menu, Package, UserRound} from 'lucide-react';
import {type ReactNode, Suspense, useState} from 'react';
import {Await} from 'react-router';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion';
import {PersonIcon} from '~/components/ui/icons';
import LocalizedLink from '~/components/ui/localized-link';
import {useUrlLocale} from '~/components/ui/locale-context';
import {Sheet, SheetContent, SheetTitle, SheetTrigger} from '~/components/ui/sheet';
import {MobileLocale} from '~/components/nav/mobile-locale';
import type {MenuItem} from '~/lib/menu';

// All visible text in one place, ready to move into use-intl.
const COPY = {
  menu: 'Menu',
  openMenu: 'Open menu',
  showAll: (title: string) => `Show all ${title}`,
  account: 'Account',
  orders: 'Orders',
  addresses: 'Addresses',
  profile: 'Profile',
  signIn: 'Sign in or register',
  signOut: 'Sign out',
};

const ROW =
  'flex w-full items-center gap-3 py-2.5 text-left text-ds-regular transition-colors hover:text-muted-foreground';

function MenuLink({
  url,
  children,
  className,
  onClick,
}: {
  url: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  if (/^(https?:|mailto:|tel:)/i.test(url)) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <LocalizedLink href={url} className={className} onClick={onClick}>
      {children}
    </LocalizedLink>
  );
}

export function MobileMenu({
  items,
  isLoggedIn,
}: {
  items: MenuItem[];
  isLoggedIn: Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button type="button" className="-ml-2 p-2 md:hidden" aria-label={COPY.openMenu}>
            <Menu className="size-5" aria-hidden="true" />
          </button>
        }
      />
      <SheetContent side="left" className="gap-0 overflow-y-auto">
        <div className="flex h-16 shrink-0 items-center px-5">
          <SheetTitle className="text-ds-medium font-semibold">{COPY.menu}</SheetTitle>
        </div>
        <nav aria-label={COPY.menu} className="px-5">
          <MobileMenuList items={items} onNavigate={close} />
        </nav>
        <MobileAccount isLoggedIn={isLoggedIn} onNavigate={close} />
        <div className="px-5 pb-6">
          <MobileLocale />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MobileMenuList({items, onNavigate}: {items: MenuItem[]; onNavigate: () => void}) {
  const hasAnyChildren = items.some((item) => item.items.length > 0);

  if (!hasAnyChildren) {
    return (
      <ul className="flex flex-col gap-2.5">
        {items.map((item) => (
          <li key={item.id}>
            <MenuLink
              url={item.url}
              onClick={onNavigate}
              className="text-ds-regular transition-colors hover:text-muted-foreground"
            >
              {item.title}
            </MenuLink>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Accordion multiple className="w-full">
      {items.map((item) =>
        item.items.length > 0 ? (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger className="py-3 text-ds-regular">{item.title}</AccordionTrigger>
            <AccordionContent>
              <NestedItems items={item.items} onNavigate={onNavigate} />
              {item.url ? (
                <MenuLink
                  url={item.url}
                  onClick={onNavigate}
                  className="mt-3 block text-ds-small font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {COPY.showAll(item.title)}
                </MenuLink>
              ) : null}
            </AccordionContent>
          </AccordionItem>
        ) : (
          <div key={item.id} className="border-b last:border-b-0">
            <MenuLink
              url={item.url}
              onClick={onNavigate}
              className="flex py-3 text-ds-regular transition-colors hover:text-muted-foreground"
            >
              {item.title}
            </MenuLink>
          </div>
        ),
      )}
    </Accordion>
  );
}

function NestedItems({items, onNavigate}: {items: MenuItem[]; onNavigate: () => void}) {
  return (
    <ul className="flex flex-col gap-3 pl-3">
      {items.map((item) => (
        <li key={item.id} className="space-y-2">
          <MenuLink
            url={item.url}
            onClick={onNavigate}
            className="block text-ds-regular font-medium transition-opacity hover:opacity-70"
          >
            {item.title}
          </MenuLink>
          {item.items.length > 0 && (
            <ul className="flex flex-col gap-2 pl-3">
              {item.items.map((leaf) => (
                <li key={leaf.id}>
                  <MenuLink
                    url={leaf.url}
                    onClick={onNavigate}
                    className="block text-ds-regular text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {leaf.title}
                  </MenuLink>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

// Sign-in is a plain <a>: a full document navigation, never prefetched (it ends in an OAuth redirect).
function MobileAccount({
  isLoggedIn,
  onNavigate,
}: {
  isLoggedIn: Promise<boolean>;
  onNavigate: () => void;
}) {
  const locale = useUrlLocale();
  const prefix = locale ? `/${locale}` : '';

  const signIn = (
    <div className="mt-6 border-t px-5 pt-4 pb-6">
      <a
        href={`${prefix}/account/login`}
        className="flex w-full items-center gap-3 py-2 text-ds-regular font-medium transition-colors hover:text-muted-foreground"
      >
        <PersonIcon className="size-5" aria-hidden="true" />
        {COPY.signIn}
      </a>
    </div>
  );

  return (
    <Suspense fallback={<div className="mx-5 mt-6 h-12 animate-pulse rounded-ds-md bg-muted" />}>
      <Await resolve={isLoggedIn} errorElement={signIn}>
        {(loggedIn) =>
          loggedIn ? (
            <div className="mt-6 border-t px-5 pt-4 pb-6">
              <p className="mb-1 text-ds-small font-medium text-muted-foreground">{COPY.account}</p>
              <ul>
                <li>
                  <LocalizedLink href="/account/orders" prefetch="none" onClick={onNavigate} className={ROW}>
                    <Package className="size-4" aria-hidden="true" />
                    {COPY.orders}
                  </LocalizedLink>
                </li>
                <li>
                  <LocalizedLink href="/account/addresses" prefetch="none" onClick={onNavigate} className={ROW}>
                    <MapPin className="size-4" aria-hidden="true" />
                    {COPY.addresses}
                  </LocalizedLink>
                </li>
                <li>
                  <LocalizedLink href="/account/profile" prefetch="none" onClick={onNavigate} className={ROW}>
                    <UserRound className="size-4" aria-hidden="true" />
                    {COPY.profile}
                  </LocalizedLink>
                </li>
                <li>
                  <form action={`${prefix}/account/logout`} method="post">
                    <button type="submit" className={ROW}>
                      <LogOut className="size-4" aria-hidden="true" />
                      {COPY.signOut}
                    </button>
                  </form>
                </li>
              </ul>
            </div>
          ) : (
            signIn
          )
        }
      </Await>
    </Suspense>
  );
}
