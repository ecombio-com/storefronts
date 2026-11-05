import { cn } from "cn";
import { ChevronRight } from "lucide-react";
import { type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from "react";

import Link from "~/components/ui/localized-link";

export interface MegaPanelCategory {
  id: string;
  title: string;
  url: string;
  panel: ReactNode;
}

export function MegaPanel({
  categories,
  heading,
}: {
  categories: MegaPanelCategory[];
  heading: string;
}) {
  const [activeId, setActiveId] = useState(categories[0]?.id);
  const active = categories.find((c) => c.id === activeId) ?? categories[0];

  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstId = categories[0]?.id;

  // The dropdown is shown by CSS (hover on, or focus inside, the parent <li>), so this panel stays
  // mounted while hidden. Reset to the first category whenever that whole nav item is left.
  useEffect(() => {
    const item = rootRef.current?.closest("li");
    const onLeave = () => {
      if (!item?.matches(":has(:focus-visible)")) setActiveId(firstId);
    };
    const onFocusOut = (e: FocusEvent) => {
      if (!item?.contains(e.relatedTarget as Node | null) && !item?.matches(":hover")) {
        setActiveId(firstId);
      }
    };
    item?.addEventListener("mouseleave", onLeave);
    item?.addEventListener("focusout", onFocusOut);
    return () => {
      item?.removeEventListener("mouseleave", onLeave);
      item?.removeEventListener("focusout", onFocusOut);
    };
  }, [firstId]);

  // Roving focus: arrows move between categories, ArrowRight enters the panel.
  // Only the active category is a Tab stop, so Tab goes straight from it into its panel.
  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    const links = Array.from(
      e.currentTarget.querySelectorAll<HTMLAnchorElement>("a[data-category]"),
    );
    const i = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (i === -1) return;
    let next = -1;
    if (e.key === "ArrowDown") next = Math.min(i + 1, links.length - 1);
    else if (e.key === "ArrowUp") next = Math.max(i - 1, 0);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = links.length - 1;
    else if (e.key === "ArrowRight") {
      const target = panelRef.current?.querySelector<HTMLElement>("a, button");
      if (target) {
        e.preventDefault();
        target.focus();
      }
      return;
    } else return;
    e.preventDefault();
    links[next]?.focus();
    const id = categories[next]?.id;
    if (id) setActiveId(id);
  };

  return (
    <div ref={rootRef} className="grid grid-cols-[280px_1fr] gap-8 pt-4">
      <div>
        <p className="mb-3 text-ds-small font-bold">{heading}</p>
        <ul aria-label={heading} onKeyDown={onKeyDown}>
          {categories.map((c) => (
            <li key={c.id} onMouseEnter={() => setActiveId(c.id)}>
              <Link
                href={c.url}
                data-category=""
                tabIndex={c.id === active?.id ? 0 : -1}
                className={cn(
                  "flex items-center justify-between rounded-ds-md px-4 py-3 text-ds-regular transition-colors",
                  c.id === active?.id ? "bg-muted font-semibold" : "font-medium hover:bg-muted/60",
                )}
              >
                {c.title}
                <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div ref={panelRef}>{active?.panel}</div>
    </div>
  );
}
