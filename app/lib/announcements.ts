export type Variant = 'lime' | 'lavender' | 'dark';

export type Device = 'mobile' | 'tablet' | 'desktop';

export type Countdown =
  | {type: 'fixed'; ends: string} // ISO date with offset, e.g. 2026-12-31T23:59:00-08:00
  | {type: 'evergreen'; hours: number}; // restarts every N hours per visitor

export type AnnouncementItem = {
  id: string;
  variant?: Variant;
  text: string;
  code?: string; // shown underlined
  cta?: string; // shown with an arrow (needs href)
  href?: string;
  countdown?: Countdown;
  devices?: Device[]; // omit to show on every device
};

// Evergreen messages: each links to a page that returns 200. No prices, codes or deadlines.
// To run a promo, add an item with code and/or countdown.
// Closing the bar hides it until the next page load (nothing is saved).
export const announcementConfig: {
  enabled: boolean;
  campaignId: string; // keys the countdown timers; change it when the campaign changes
  dismissible: boolean;
  autoRotate: boolean;
  intervalMs: number;
  labels: {dismiss: string; previous: string; next: string};
  items: AnnouncementItem[];
} = {
  enabled: true,
  campaignId: 'announcement-3',
  dismissible: true,
  autoRotate: true,
  intervalMs: 6000,
  labels: {dismiss: 'Dismiss announcement', previous: 'Previous announcement', next: 'Next announcement'},
  items: [
    {
      id: 'shop-all',
      variant: 'dark',
      text: 'Shop e-bikes, e-scooters and electric skateboards in one place.',
      cta: 'Shop all',
      href: '/collections/all',
    },
    {
      id: 'trade-in',
      variant: 'lavender',
      text: 'Trade in your old ride toward a new one.',
      cta: 'How trade-in works',
      href: '/pages/trade-in',
    },
    {
      id: 'guides',
      variant: 'lime',
      text: 'Not sure which ride fits you? Read our buying guides.',
      cta: 'Visit the Journal',
      href: '/blogs',
    },
  ],
};
