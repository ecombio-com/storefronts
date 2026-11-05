import {ProductCard} from '~/components/product-card/product-card';
import type {ProductCardData} from '~/components/product-card/types';

const COPY = {
  title: 'You May Also Like',
};

export function RelatedProductsSection({
  products,
  limit = 4,
}: {
  products: ProductCardData[];
  limit?: number;
}) {
  if (products.length === 0) return null;
  return (
    <div className="grid gap-4">
      <h2 className="text-ds-h2">{COPY.title}</h2>
      <div className="grid grid-cols-2 gap-(--grid-gutter) lg:grid-cols-4">
        {products.slice(0, limit).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
