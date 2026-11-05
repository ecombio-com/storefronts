// Path: app/components/blog/author.tsx
import {Fragment, type ReactNode} from 'react';
import Link from '~/components/ui/localized-link';
import {sizedImage, type AuthorProfile} from '~/lib/blog';

export function AuthorBadge({className}: {className?: string}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height="29"
      viewBox="0 0 28 29"
      width="28"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="14" cy="14.6924" fill="black" r="14" />
      <path
        clipRule="evenodd"
        d="M8 10.6924L17.3265 12.2771L13.5305 18.1186H13.2075L12.6787 18.6452L12.1221 18.1186H11.9743L11.4376 18.654L10.9048 18.1186H10.7245L10.1907 18.6549L9.64042 18.1186H8L10.1667 18.9659L10.7496 18.6877L11.0768 19.3241L11.2404 19.3872L11.9091 19.0554L12.2597 19.7961L12.398 19.8427L11.9074 20.61L20.9126 10.6924H8Z"
        fill="white"
        fillRule="evenodd"
      />
      <path
        clipRule="evenodd"
        d="M9.5332 12.9429L13.3305 13.8476L11.6975 14.0275L9.5332 12.9429Z"
        fill="white"
        fillRule="evenodd"
      />
    </svg>
  );
}

type RichNode = {
  bold?: boolean;
  children?: RichNode[];
  italic?: boolean;
  listType?: 'ordered' | 'unordered';
  type: string;
  url?: string;
  value?: string;
};

function renderNodes(nodes: RichNode[] = []): ReactNode[] {
  return nodes.map((node, i) => <Fragment key={i}>{renderNode(node)}</Fragment>);
}

function renderNode(node: RichNode): ReactNode {
  switch (node.type) {
    case 'text': {
      let out: ReactNode = node.value;
      if (node.bold) out = <strong>{out}</strong>;
      if (node.italic) out = <em>{out}</em>;
      return out;
    }
    case 'link': {
      const url = node.url ?? '';
      if (!url.startsWith('/') && !url.startsWith('https://')) return renderNodes(node.children);
      return (
        <Link
          className="text-foreground underline"
          href={url}
          {...(url.startsWith('https://') ? {rel: 'noopener noreferrer', target: '_blank'} : {})}
        >
          {renderNodes(node.children)}
        </Link>
      );
    }
    case 'paragraph':
      return <p>{renderNodes(node.children)}</p>;
    case 'heading':
      return <p className="font-bold">{renderNodes(node.children)}</p>;
    case 'list':
      return node.listType === 'ordered' ? (
        <ol className="list-decimal pl-4">{renderNodes(node.children)}</ol>
      ) : (
        <ul className="list-disc pl-4">{renderNodes(node.children)}</ul>
      );
    case 'list-item':
      return <li>{renderNodes(node.children)}</li>;
    default:
      return renderNodes(node.children);
  }
}

export function RichText({value}: {value: string}) {
  let root: RichNode | undefined;
  try {
    root = JSON.parse(value) as RichNode;
  } catch {
    root = undefined;
  }
  if (!root) return <p>{value}</p>;
  return <div className="grid gap-4">{renderNodes(root.children)}</div>;
}

export function AuthorCard({profile}: {profile: AuthorProfile}) {
  return (
    <div className="flex items-start gap-5 border-t pt-8">
      {profile.photo ? (
        <div className="relative size-20 shrink-0">
          <div className="relative size-full overflow-hidden rounded-full bg-muted">
            <img
              alt={profile.photo.altText}
              className="absolute inset-0 size-full object-cover"
              loading="lazy"
              src={sizedImage(profile.photo.url, 160)}
            />
          </div>
          <AuthorBadge className="absolute bottom-0 left-1/2 size-6 -translate-x-1/2 translate-y-1/3 rounded-full" />
        </div>
      ) : null}
      <div className="grid min-w-0 gap-1">
        <p className="font-medium text-ds-regular">
          {profile.handle ? (
            <Link
              className="transition-opacity hover:opacity-70"
              href={`/blogs/author/${profile.handle}`}
            >
              {profile.name}
            </Link>
          ) : (
            profile.name
          )}
        </p>
        {profile.role ? <p className="text-muted-foreground text-ds-regular">{profile.role}</p> : null}
        {profile.bio ? (
          <div className="line-clamp-2 text-muted-foreground text-ds-regular leading-6">
            <RichText value={profile.bio} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
