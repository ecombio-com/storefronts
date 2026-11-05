// Path: app/components/collections/hub-trust-bar.tsx
import type {ReactNode} from 'react';

function iconFor(label: string): ReactNode {
  const l = label.toLowerCase();
  if (l.includes('warranty')) {
    return (
      <>
        <circle cx="12" cy="8" r="6" />
        <path d="M15.5 12.9 17 22l-5-3-5 3 1.5-9.1" />
      </>
    );
  }
  if (l.includes('shipping')) {
    return (
      <>
        <path d="M3 6h11v10H3z" />
        <path d="M14 9h4l3 3v4h-7" />
        <circle cx="7.5" cy="17.5" r="1.8" />
        <circle cx="17.5" cy="17.5" r="1.8" />
      </>
    );
  }
  if (l.includes('return')) {
    return (
      <>
        <path d="M4 8h14l-3-3" />
        <path d="M20 16H6l3 3" />
      </>
    );
  }
  return <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12z" />;
}

export function HubTrustBar({items}: {items: string[]}) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-3 text-ds-regular font-medium">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-ds-lg bg-[#e4f77a] text-black">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {iconFor(item)}
            </svg>
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}
