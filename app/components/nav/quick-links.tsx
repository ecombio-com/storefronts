import {cn} from 'cn';
import type {ReactNode} from 'react';
import {ChevronDownIcon} from '~/components/ui/icons';
import LocalizedLink from '~/components/ui/localized-link';
import type {MenuItem} from '~/lib/menu';
import {MegaPanel} from '~/components/nav/mega-panel';
import {MenuCardImage} from '~/components/nav/menu-card-image';

const MAX_COLUMNS = 5;
const MAX_SUB_CARDS = 8;
const CATEGORIES_LABEL = 'Categories';

function MenuLink({url, children, className}: {url: string; children: ReactNode; className?: string}) {
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

export function QuickLinks({items}: {items: MenuItem[]}) {
  return (
    <ul className="flex items-center gap-6">
      {items.map((item) => (
        <NavItem key={item.id} item={item} />
      ))}
    </ul>
  );
}

const TRIGGER_CLASS =
  'flex items-center gap-1 whitespace-nowrap text-ds-regular font-medium hover:opacity-70 transition-opacity';

function hasDeclaredLayout(item: MenuItem) {
  return item.layout === 'mega-menu' || item.items.some((child) => child.layout !== undefined);
}

function NavItem({item: rawItem}: {item: MenuItem}) {
  const item = hasDeclaredLayout(rawItem) ? rawItem : {...rawItem, items: []};
  if (item.items.length === 0) {
    return (
      <li className="flex h-11 items-center">
        <MenuLink url={item.url} className={TRIGGER_CLASS}>
          {item.title}
        </MenuLink>
      </li>
    );
  }

  const useRail = item.layout === 'mega-menu' || item.items.some((child) => child.items.length > 0);
  const only = useRail && item.items.length === 1 ? item.items[0] : undefined;

  return (
    <li className="group flex h-11 items-center">
      <MenuLink url={item.url} className={TRIGGER_CLASS}>
        {item.title}
        <ChevronDownIcon className="size-4" aria-hidden="true" />
      </MenuLink>
      <div
        data-nav-dropdown=""
        className={cn(
          'absolute inset-x-0 top-full z-40',
          'invisible opacity-0',
          'group-hover:visible group-hover:opacity-100',
          'group-has-[:focus-visible]:visible group-has-[:focus-visible]:opacity-100',
          'transition-opacity duration-150',
          'bg-popover border-b shadow-ds-drop-sm',
        )}
      >
        <div className="px-5 pb-5 lg:px-10">
          {only ? (
            <div className="pt-4">
              <p className="mb-3 text-ds-small font-bold">{CATEGORIES_LABEL}</p>
              <SubCards parent={only} />
            </div>
          ) : useRail ? (
            <MegaPanel
              heading={CATEGORIES_LABEL}
              categories={item.items.map((child) => ({
                id: child.id,
                title: child.title,
                url: child.url,
                panel: <SubCards parent={child} />,
              }))}
            />
          ) : (
            <CategoryCards columns={item.items.slice(0, MAX_COLUMNS)} heading={CATEGORIES_LABEL} />
          )}
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-full h-screen bg-scrim backdrop-blur-(--scrim-blur)"
        />
      </div>
    </li>
  );
}

function ItemCard({item}: {item: MenuItem}) {
  return (
    <MenuLink url={item.url} className="group/card block">
      <div className="relative aspect-square overflow-hidden rounded-ds-md bg-muted">
        {item.image && (
          <MenuCardImage url={item.image.url} alt={item.image.altText ?? item.title} title={item.title} />
        )}
      </div>
      <span className="mt-2 block text-ds-small font-bold">{item.title}</span>
    </MenuLink>
  );
}

function CategoryCards({columns, heading}: {columns: MenuItem[]; heading: string}) {
  return (
    <div className="pt-4">
      <p className="mb-3 text-ds-small font-bold">{heading}</p>
      <ul className="grid grid-cols-5 gap-4">
        {columns.map((column) => (
          <li key={column.id}>
            <ItemCard item={column} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function SubCards({parent}: {parent: MenuItem}) {
  if (parent.layout === 'mega-menu') {
    const columns: {head: MenuItem | null; links: MenuItem[]}[] = [];
    for (const child of parent.items) {
      const isHead = child.layout === 'link-list';
      if (isHead || columns.length === 0) columns.push({head: isHead ? child : null, links: []});
      if (!isHead) columns[columns.length - 1].links.push(child);
    }
    return (
      <div className="grid grid-cols-4 gap-8">
        {columns.map((col, i) => (
          <div key={col.head?.id ?? i}>
            {col.head && (
              <MenuLink url={col.head.url} className="mb-2 block text-ds-small font-bold hover:opacity-70">
                {col.head.title}
              </MenuLink>
            )}
            <ul className="space-y-1.5">
              {col.links.map((link) => (
                <li key={link.id}>
                  <MenuLink url={link.url} className="text-ds-regular transition-opacity hover:opacity-70">
                    {link.title}
                  </MenuLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  if (parent.layout === 'link-list') {
    return (
      <ul className="columns-2 gap-x-8 lg:columns-3">
        {parent.items.map((link) => (
          <li key={link.id} className="break-inside-avoid py-1.5">
            <MenuLink url={link.url} className="text-ds-regular transition-opacity hover:opacity-70">
              {link.title}
            </MenuLink>
          </li>
        ))}
      </ul>
    );
  }

  if (parent.layout !== 'image-grid') return null;

  const cards = parent.items.slice(0, MAX_SUB_CARDS);
  return (
    <ul className={cn('grid gap-4', cards.length <= 5 ? 'grid-cols-5' : 'grid-cols-4')}>
      {cards.map((card) => (
        <li key={card.id}>
          <ItemCard item={card} />
        </li>
      ))}
    </ul>
  );
}
