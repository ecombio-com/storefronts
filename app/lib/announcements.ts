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

// PLACEHOLDER COPY: replace the text, code and cta values before setting enabled to true.
export const announcementConfig: {
  enabled: boolean;
  campaignId: string; // bump to show the bar again to people who dismissed it
  dismissible: boolean;
  autoRotate: boolean;
  intervalMs: number;
  labels: {dismiss: string; previous: string; next: string};
  items: AnnouncementItem[];
} = {
  enabled: false,
  campaignId: 'announcement-2',
  dismissible: true,
  autoRotate: true,
  intervalMs: 6000,
  labels: {dismiss: 'Dismiss announcement', previous: 'Previous announcement', next: 'Next announcement'},
  items: [
    {
      id: 'tablet',
      variant: 'dark',
      text: 'Placeholder: tablet-only message.',
      cta: 'Shop now',
      href: '/collections/all',
      devices: ['tablet'],
    },
    {
      id: 'promo',
      variant: 'lavender',
      text: 'Placeholder: promo message with code',
      code: 'CODE',
      href: '/collections/all',
    },
    {
      id: 'sale',
      variant: 'lime',
      text: 'Placeholder: sale ends in',
      cta: 'Shop the sale',
      href: '/collections/all',
      countdown: {type: 'fixed', ends: '2026-12-31T23:59:00-08:00'},
    },
  ],
};
