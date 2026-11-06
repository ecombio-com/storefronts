import type {ReactNode} from 'react';
import {ArticleBody} from '~/components/blog/article-body';
import {Container} from '~/components/ui/container';
import Link from '~/components/ui/localized-link';
import {Page} from '~/components/ui/page';
import {cn} from 'cn';
import {parseBody} from '~/lib/shortcodes';
import type {BlockLink, PageBlock} from '~/lib/page-blocks';

type Of<T extends PageBlock['type']> = Extract<PageBlock, {type: T}>;

const PILL =
  'inline-flex items-center gap-(--spacer-xsmall) rounded-full bg-(--color-bg-secondary) px-(--spacer-regular) py-(--spacer-xsmall) font-medium text-(--color-text-dark) text-ds-small shadow-(--shadow-drop-xs) transition-opacity hover:opacity-70';

function BlockAnchor({children, className, href}: {children: ReactNode; className: string; href: string}) {
  // Hash links stay on the page, so they skip the locale-aware Link.
  if (href.startsWith('#')) {
    return (
      <a className={className} href={href}>
        {children}
      </a>
    );
  }
  return (
    <Link className={className} href={href}>
      {children}
    </Link>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 12 12">
      <path d="M2 2l8 8M10 4v6H4" />
    </svg>
  );
}

function Hero({block}: {block: Of<'hero'>}) {
  const {image, links, title} = block;
  return (
    <header
      className={cn(
        'relative isolate flex min-h-80 items-end overflow-hidden md:min-h-112',
        image ? 'text-(--color-text-light)' : 'bg-(--color-brand-primary) text-(--color-text-dark)',
      )}
    >
      {image && (
        <>
          <img alt="" className="absolute inset-0 -z-20 size-full object-cover" fetchPriority="high" src={image} />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-foreground/70 to-transparent" />
        </>
      )}
      <Container className="grid justify-items-start gap-(--spacer-medium) py-(--spacer-large) md:py-(--spacer-xlarge)">
        <h1 className="font-display font-semibold text-(length:--heading-hero) tracking-tight">{title}</h1>
        {links.length > 0 && (
          <nav aria-label="On this page">
            <ul className="flex flex-wrap gap-(--spacer-small)">
              {links.map((link: BlockLink) => (
                <li key={`${link.href}-${link.label}`}>
                  <BlockAnchor className={PILL} href={link.href}>
                    {link.label}
                    <ArrowIcon />
                  </BlockAnchor>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </Container>
    </header>
  );
}

function Stats({block}: {block: Of<'stats'>}) {
  return (
    <Container className="py-(--padding-section-medium)">
      <ul className="grid gap-(--spacer-small) md:grid-cols-3">
        {block.items.map((item, i) => (
          <li
            className="grid gap-(--spacer-large) rounded-lg bg-(--color-brand-primary) p-(--spacer-regular) text-(--color-text-dark)"
            key={`${i}-${item.value}-${item.label}`}
          >
            <p className="flex items-baseline font-semibold leading-none tracking-tight">
              <span className="text-(length:--heading-display)">{item.value}</span>
              {item.unit && <span className="text-(length:--heading-h1)">{item.unit}</span>}
            </p>
            <p className="text-ds-small">{item.label}</p>
          </li>
        ))}
      </ul>
    </Container>
  );
}

function Band({block}: {block: Of<'band'>}) {
  return (
    <div className="scroll-mt-24 bg-(--color-bg-warm) py-(--padding-section-medium) text-center" id={block.id}>
      <Container className="grid max-w-3xl justify-items-center gap-(--spacer-medium)">
        <h2 className="font-display font-semibold text-(length:--heading-hero) tracking-tight">{block.title}</h2>
        <p className="font-medium text-ds-regular">{block.text}</p>
      </Container>
    </div>
  );
}

function Split({block}: {block: Of<'split'>}) {
  const {button, image, text, title} = block;
  return (
    <Container className="max-w-5xl py-(--padding-section-medium)">
      <div className={cn('grid items-center gap-(--spacer-large)', image && 'md:grid-cols-2')}>
        {image && (
          <div className="relative aspect-4/3 overflow-hidden rounded-lg">
            <img alt="" className="absolute inset-0 size-full object-cover" loading="lazy" src={image} />
          </div>
        )}
        <div className="grid justify-items-start gap-(--spacer-small)">
          <h2 className="font-semibold text-(length:--heading-h3)">{title}</h2>
          <p className="text-muted-foreground text-ds-regular leading-6">{text}</p>
          {button && (
            <BlockAnchor
              className="mt-(--spacer-small) bg-foreground px-6 py-3 font-medium text-background text-ds-small"
              href={button.href}
            >
              {button.label}
            </BlockAnchor>
          )}
        </div>
      </div>
    </Container>
  );
}

export function PageBlocks({blocks}: {blocks: PageBlock[]}) {
  return (
    <Page className="pt-0">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        switch (block.type) {
          case 'hero':
            return <Hero block={block} key={key} />;
          case 'text':
            return (
              <Container className="max-w-3xl py-(--padding-section-medium)" key={key}>
                <ArticleBody products={{}} segments={parseBody(block.html)} />
              </Container>
            );
          case 'body':
            return (
              <Container className="max-w-3xl py-(--padding-section-medium)" key={key}>
                <ArticleBody products={{}} segments={block.segments} />
              </Container>
            );
          case 'stats':
            return <Stats block={block} key={key} />;
          case 'band':
            return <Band block={block} key={key} />;
          case 'split':
            return <Split block={block} key={key} />;
        }
      })}
    </Page>
  );
}

