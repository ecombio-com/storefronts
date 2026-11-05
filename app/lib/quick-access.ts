// Tiles in the desktop search panel before anything is typed. Image is optional (path under /public).
export type QuickAccessItem = {title: string; href: string; image?: string};

export const quickAccess: QuickAccessItem[] = [
  {title: 'Electric bikes', href: '/collections/all'},
  {title: 'Scooters', href: '/collections/all'},
  {title: 'New arrivals', href: '/collections/all'},
  {title: 'Accessories', href: '/collections/all'},
];
