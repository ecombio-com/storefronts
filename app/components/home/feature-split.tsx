import {Image} from '@shopify/hydrogen';
import {cn} from 'cn';
import {buttonVariants} from '~/components/ui/button';
import LocalizedLink from '~/components/ui/localized-link';

type FeatureSplitProps = {
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  imageSide?: 'left' | 'right';
  background?: string;
  image?: {src: string; alt: string};
};

export function FeatureSplit({title, description, ctaLabel, href, imageSide = 'left', background = 'var(--muted)', image}: FeatureSplitProps) {
  return (
    <section className="grid items-center gap-ds-medium md:grid-cols-2 md:gap-ds-large">
      <div
        className={cn('relative aspect-4/3 overflow-hidden rounded-ds-lg', imageSide === 'right' && 'md:order-2')}
        style={{backgroundColor: background}}
      >
        {image ? <Image src={image.src} alt={image.alt} sizes="(min-width: 768px) 50vw, 100vw" className="absolute inset-0 size-full object-cover" /> : null}
      </div>
      <div className="flex flex-col items-start gap-ds-regular md:px-ds-regular">
        <h2 className="font-display tracking-tight text-ds-h3 font-semibold">{title}</h2>
        <p className="text-ds-regular text-muted-foreground">{description}</p>
        <LocalizedLink href={href} className={buttonVariants({size: 'lg'})}>
          {ctaLabel}
        </LocalizedLink>
      </div>
    </section>
  );
}
