// Path: app/lib/home.ts
// Homepage types and static fallbacks. No server imports.

export type HeroSlide = {
  id?: string;
  image: string;
  mobileImage?: string;
  alt: string;
  heading?: string;
  text?: string;
  href: string;
  cta?: string;
};

export type CommunityStory = {
  id?: string;
  video: string;
  poster?: string;
  alt: string;
  caption?: string;
  reviewer?: string;
  review?: string;
  rating?: number;
  product?: {handle: string; title: string; image?: string; price?: string; productId?: string};
};

export type PopularCategory = {label: string; description: string; href: string; image?: string};
export type ShopCategory = {label: string; href: string; image?: string};

// 1 slide = static banner, 2+ = slideshow
export const heroSlides: HeroSlide[] = [
  {
    image:
      'https://cdn.shopify.com/s/files/1/0726/0641/7110/files/site-hero-desktop-hero.webp?v=1791494930',
    mobileImage:
      'https://cdn.shopify.com/s/files/1/0726/0641/7110/files/site-hero-mobile-hero.webp?v=1791494932',
    alt: 'Shop electric bikes at Ecombio',
    href: '/collections/electric-bikes',
    cta: 'Shop electric bikes',
  },
];

// Empty array = section hidden
export const communityStories: CommunityStory[] = [];

const CDN = 'https://cdn.shopify.com/s/files/1/0726/0641/7110/collections/';
export const shopCategories: ShopCategory[] = [
  {label: 'Price drops', href: '/collections/price-drop'},
  {label: 'Electric bikes', href: '/collections/electric-bikes', image: CDN + 'god_and_adam.jpg?v=1788233158&width=500'},
  {label: 'Electric scooters', href: '/collections/electric-scooters', image: CDN + 'ScooterBio_wallpaper.png?v=1785008205&width=500'},
  {label: 'Electric skateboards', href: '/collections/electric-skateboards', image: CDN + 'ECOMBIO_png.png?v=1785008226&width=500'},
  {label: 'Cargo bikes', href: '/collections/electric-cargo-bikes', image: CDN + 'fiido-t3-two-people-riding_1.webp?v=1784397522&width=500'},
  {label: 'City bikes', href: '/collections/electric-city-bikes', image: CDN + 'i.shgcdn_76ba479e-f743-477d-8a9f-eb9a6e6b73f2.webp?v=1784397588&width=500'},
  {label: 'Fat bikes', href: '/collections/electric-fat-bikes', image: CDN + 'alpine-fat-tire-ebike-8093206.webp?v=1784397812&width=500'},
  {label: 'Folding bikes', href: '/collections/electric-folding-bikes', image: CDN + 'Brompton-P-Line-D.webp?v=1784397680&width=500'},
  {label: 'Mountain bikes', href: '/collections/electric-mountain-bikes', image: CDN + 'electric-mountain-bikes_s.jpg?v=1784397360&width=500'},
  {label: 'Accessories', href: '/collections/accessories'},
];

export type HomeShowcaseTabContent = {handle: string; label: string; image?: {src: string; alt: string}};
export type HomeShowcaseContent = {
  title: string;
  subtitle?: string;
  image?: {src: string; alt: string};
  tabs: HomeShowcaseTabContent[];
};
export type HomeCategorySection = {id: string; title: string; subtitle?: string; items: PopularCategory[]};
export type HomeVideo = {title: string; description?: string; videoUrl: string};
export type PressMention = {
  quote: string;
  outlet: string;
  dateLabel?: string;
  link?: string;
  logo?: string;
  logoPath?: string;
};
export type FaqItem = {question: string; answer: string};
export type DirectoryLink = {label: string; href?: string};
export type DirectoryGroup = {heading: string; headingHref?: string; links: DirectoryLink[]};
