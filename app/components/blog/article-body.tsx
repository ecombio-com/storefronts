// Path: app/components/blog/article-body.tsx
import {ProductCard} from '~/components/product-card/product-card';
import type {ProductCardData} from '~/components/product-card/types';
import Link from '~/components/ui/localized-link';
import {Prose} from '~/components/ui/prose';
import type {BodySegment} from '~/lib/shortcodes';

type AccordionSegment = Extract<BodySegment, {type: 'accordion'}>;
type OtherSegment = Exclude<BodySegment, {type: 'accordion'}>;
type Block =
  | {items: AccordionSegment[]; kind: 'accordions'}
  | {kind: 'single'; segment: OtherSegment};

// Consecutive accordions (ignoring blank space between them) become one connected list.
function groupSegments(segments: BodySegment[]): Block[] {
  const blocks: Block[] = [];
  for (const segment of segments) {
    const last = blocks.at(-1);
    if (segment.type === 'accordion') {
      if (last?.kind === 'accordions') last.items.push(segment);
      else blocks.push({items: [segment], kind: 'accordions'});
      continue;
    }
    if (segment.type === 'html' && !segment.html.trim() && last?.kind === 'accordions') continue;
    blocks.push({kind: 'single', segment});
  }
  return blocks;
}

function AccordionList({id, items}: {id: string; items: AccordionSegment[]}) {
  return (
    <div className="max-w-3xl border-t">
      {items.map((item, index) => (
        <details className="group border-b" key={`${id}-${index}`}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-medium text-ds-regular [&::-webkit-details-marker]:hidden">
            {item.title}
            <span aria-hidden className="relative size-3 shrink-0">
              <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-current" />
              <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-current transition-opacity group-open:opacity-0" />
            </span>
          </summary>
          <Prose className="w-full pb-6 text-muted-foreground text-ds-regular leading-6 [&_a]:text-foreground [&_a]:underline">
            <div dangerouslySetInnerHTML={{__html: item.html}} />
          </Prose>
        </details>
      ))}
    </div>
  );
}

function ProductStrip({
  handles,
  href,
  products,
  title,
}: {
  handles: string[];
  href?: string | undefined;
  products: Record<string, ProductCardData>;
  title?: string | undefined;
}) {
  const cards = handles.slice(0, 4).flatMap((handle) => (products[handle] ? [products[handle]] : []));
  if (cards.length === 0) return null;
  return (
    <section className="grid gap-4">
      {title || href ? (
        <div className="flex items-baseline justify-between gap-4">
          {title ? (
            <h3 className="font-medium text-ds-regular uppercase tracking-wide">{title}</h3>
          ) : null}
          {href ? (
            <Link
              className="ml-auto shrink-0 whitespace-nowrap text-ds-small transition-opacity hover:opacity-70"
              href={href}
            >
              Shop Now
            </Link>
          ) : null}
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((product) => (
          <div
            className="min-w-0 [&_[data-slot=product-card-image]]:aspect-[4/3] [&_[data-slot=product-card-image]_img]:object-contain"
            key={product.id}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function ArticleBody({
  products,
  segments,
}: {
  products: Record<string, ProductCardData>;
  segments: BodySegment[];
}) {
  const blocks = groupSegments(segments);
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
      {blocks.map((block, index) => {
        if (block.kind === 'accordions') {
          const id = `accordion-group-${index}`;
          return <AccordionList id={id} items={block.items} key={id} />;
        }
        const {segment} = block;
        const key = `${segment.type}-${index}`;
        switch (segment.type) {
          case 'html':
            return (
              <Prose className="w-full max-w-3xl [overflow-wrap:anywhere]" key={key}>
                <div dangerouslySetInnerHTML={{__html: segment.html}} />
              </Prose>
            );
          case 'button':
            return (
              <Link
                className="justify-self-start bg-foreground px-6 py-3 font-medium text-background text-ds-small"
                href={segment.href}
                key={key}
              >
                {segment.label}
              </Link>
            );
          case 'products':
            return (
              <ProductStrip
                handles={segment.handles}
                href={segment.href}
                key={key}
                products={products}
                title={segment.title}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
