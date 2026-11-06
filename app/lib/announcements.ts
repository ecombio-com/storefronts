// The announcement bar's content lives in Shopify: Content > Metaobjects > Announcement bar (handle main).
// app/lib/announcements.server.ts reads and filters it; these are the shapes the header renders.
export type Variant = 'dark' | 'lavender' | 'lime';

export type Device = 'mobile' | 'tablet' | 'desktop';

export type AnnouncementItem = {
  id: string;
  variant: Variant;
  text: string;
  code?: string; // shown underlined
  cta?: string; // shown with an arrow (only when href is set)
  href?: string;
  countdownEnds?: string; // ISO date-time; a live countdown shows and the message hides at zero
  devices?: Device[]; // omit to show on every device
};

export type AnnouncementBarData = {
  autoRotate: boolean;
  dismissible: boolean;
  intervalMs: number;
  items: AnnouncementItem[];
};
