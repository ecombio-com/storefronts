export type ProductCardColor = {
  name: string;
  color?: string | null;
  imageUrl?: string | null;
};

export type CardMoney = {amount: string; currencyCode: string};

export type ProductCardData = {
  id: string;
  handle: string;
  title: string;
  vendor?: string | null;
  availableForSale: boolean;
  featuredImage?: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  price: CardMoney;
  maxPrice: CardMoney;
  compareAtPrice?: CardMoney | null;
  defaultVariantId?: string | null;
  defaultVariantSelectedOptions?: Array<{name: string; value: string}>;
  colors?: ProductCardColor[];
  rating?: {score: number; count: number} | null;
  cardSpecs?: string[];
  label?: string | null;
};
