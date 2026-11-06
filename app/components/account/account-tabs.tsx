import {cn} from 'cn';
import {useLocation} from 'react-router';
import LocalizedLink from '~/components/ui/localized-link';

const TABS = [
  {href: '/account/profile', label: 'Profile'},
  {href: '/account/orders', label: 'Orders'},
  {href: '/account/addresses', label: 'Addresses'},
];

export function AccountTabs() {
  const {pathname} = useLocation();
  return (
    <div className="mx-auto w-fit max-w-full overflow-x-auto px-2">
      <nav aria-label="Account" className="flex gap-6 border-b border-border">
        {TABS.map((tab) => {
          const active = pathname.endsWith(tab.href) || pathname.includes(`${tab.href}/`);
          return (
            <LocalizedLink
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                '-mb-px whitespace-nowrap border-b-2 px-1 py-2 text-center text-ds-regular transition-colors',
                active
                  ? 'border-foreground font-semibold text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
            </LocalizedLink>
          );
        })}
      </nav>
    </div>
  );
}