import {Image} from '@shopify/hydrogen';
import {ImagePlaceholder} from '~/components/ui/image-placeholder';
import LocalizedLink from '~/components/ui/localized-link';
import {Slider, SliderContent, SliderFade, SliderHeader, SliderItem, SliderNav} from '~/components/ui/slider';
import type {BlogArticle} from '~/lib/blog';

const ITEM_WIDTH = 'w-72 sm:w-80';
const ITEM_WIDTH_COMPACT = 'w-60 sm:w-64';

const CARD = [
  'group/card flex h-full flex-col overflow-hidden rounded-ds-lg bg-card',
  'shadow-ds-drop-xs ring-1 ring-border-subtle transition-shadow',
  'hover:shadow-ds-drop-sm focus-within:shadow-ds-drop-sm',
].join(' ');

const NAV_BUTTONS = [
  '[&_button]:flex [&_button]:size-10',
  '[&_button]:items-center [&_button]:justify-center [&_button]:rounded-full',
  '[&_button]:bg-foreground [&_button]:text-background [&_button]:shadow-ds-drop-sm',
  '[&_button]:transition-colors [&_button]:duration-200',
  '[&_button:disabled]:bg-muted [&_button:disabled]:text-muted-foreground',
].join(' ');

const NAV_CIRCLES = `w-full justify-between [&_button]:pointer-events-auto ${NAV_BUTTONS}`;
const NAV_HEADER = `flex shrink-0 gap-2 ${NAV_BUTTONS}`;
const ARROWS = 'pointer-events-none absolute inset-x-2 top-53 z-10 hidden -translate-y-1/2 md:block';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {dateStyle: 'medium'}).format(new Date(value));
}

function StudyCard({article, compact}: {article: BlogArticle; compact: boolean}) {
  return (
    <LocalizedLink href={`/blogs/articles/${article.handle}`} className="block h-full">
      <article className={CARD}>
        <div className="relative aspect-3/2 w-full overflow-hidden bg-muted">
          {article.image ? (
            <Image src={article.image.url} alt={article.image.altText || article.title} sizes={compact ? "(min-width: 640px) 256px, 240px" : "(min-width: 640px) 320px, 288px"} className="absolute inset-0 size-full object-cover" />
          ) : (
            <ImagePlaceholder className="size-full bg-muted" iconClassName="text-muted-foreground" />
          )}
        </div>
        {compact ? (
          <div className="flex flex-1 flex-col gap-1 p-ds-regular">
            <div className="text-ds-small text-muted-foreground">{article.blogTitle}</div>
            <h3 className="line-clamp-2 text-ds-regular font-semibold text-foreground">{article.title}</h3>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-ds-xsmall p-ds-regular">
            <div className="text-ds-small text-muted-foreground">
              {article.blogTitle} &bull; <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            </div>
            <h3 className="line-clamp-2 min-h-12 text-ds-medium font-medium text-foreground">{article.title}</h3>
            {article.excerpt ? <p className="line-clamp-3 text-ds-regular text-muted-foreground">{article.excerpt}</p> : null}
            <span className="mt-auto pt-ds-small text-ds-regular font-medium text-foreground transition-opacity group-hover/card:opacity-70">
              See more
            </span>
          </div>
        )}
      </article>
    </LocalizedLink>
  );
}

export function StudyCarousel({
  title,
  items,
  collectionUrl = '/blogs',
  variant = 'default',
}: {
  title: string;
  items: BlogArticle[];
  collectionUrl?: string | null;
  variant?: 'default' | 'compact';
}) {
  if (items.length === 0) return null;
  const compact = variant === 'compact';
  return (
    <div className="min-w-0 max-w-full">
      <Slider aria-label={title}>
        <SliderHeader className={compact ? 'items-center' : 'items-baseline'}>
          <h2 className="font-display tracking-tight text-ds-h2 font-semibold">{title}</h2>
          {compact ? (
            <SliderNav className={NAV_HEADER} />
          ) : collectionUrl ? (
            <LocalizedLink href={collectionUrl} className="shrink-0 text-ds-small font-medium text-muted-foreground transition-colors hover:text-foreground">
              View all
            </LocalizedLink>
          ) : null}
        </SliderHeader>
        <div className="relative min-w-0">
          <SliderContent className="gap-ds-regular">
            {items.map((article) => (
              <SliderItem key={article.handle} className={compact ? ITEM_WIDTH_COMPACT : ITEM_WIDTH}>
                <StudyCard article={article} compact={compact} />
              </SliderItem>
            ))}
          </SliderContent>
          <SliderFade side="left" />
          <SliderFade />
          {compact ? null : (
            <div className={ARROWS}>
              <SliderNav className={NAV_CIRCLES} />
            </div>
          )}
        </div>
      </Slider>
    </div>
  );
}
