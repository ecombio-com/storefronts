// Star shapes from the design foundations (Style_Star, Style_Rating-full, Style_Rating-demifull).
// The paths are the original 24x24 artwork; the viewBox is cropped to the star's own bounds
// ("2 2 20 20") so existing size classes (h-3, h-4, h-5, h-7...) keep their visual size.
// All three states use the same color: outline = empty, solid = full, left half solid = half.

type StarState = "full" | "half" | "empty";

const SHAPES: Record<StarState, { d: string; evenOdd: boolean }> = {
  empty: {
    evenOdd: true,
    d: "M10.8461 3.64999C11.2731 2.62399 12.7271 2.62399 13.1541 3.64999L15.1621 8.47699L20.3721 8.89499C21.4801 8.98399 21.9301 10.367 21.0851 11.09L17.1151 14.49L18.3281 19.575C18.5861 20.657 17.4101 21.512 16.4611 20.932L12.0001 18.208L7.53906 20.932C6.59006 21.512 5.41306 20.657 5.67106 19.575L6.88406 14.491L2.91406 11.091C2.07006 10.366 2.52006 8.98299 3.62806 8.89399L8.83806 8.47599L10.8461 3.64999ZM12.0001 4.78299L10.1651 9.19499C10.0766 9.4072 9.93127 9.59089 9.74514 9.72585C9.559 9.86082 9.33925 9.94184 9.11006 9.95999L4.34706 10.342L7.97706 13.451C8.15165 13.6007 8.28156 13.7957 8.35249 14.0144C8.42342 14.2332 8.43261 14.4673 8.37906 14.691L7.27006 19.338L11.3481 16.847C11.5442 16.7272 11.7697 16.6638 11.9996 16.6638C12.2294 16.6638 12.4549 16.7272 12.6511 16.847L16.7301 19.337L15.6211 14.689C15.5676 14.4652 15.577 14.2311 15.6481 14.0123C15.7192 13.7935 15.8493 13.5986 16.0241 13.449L19.6541 10.341L14.8891 9.95899C14.6599 9.94057 14.4403 9.85932 14.2544 9.72418C14.0684 9.58904 13.9233 9.40524 13.8351 9.19299L12.0001 4.78299Z",
  },
  full: {
    evenOdd: false,
    d: "M13.1541 3.64999C12.7271 2.62399 11.2731 2.62399 10.8461 3.64999L8.83806 8.47799L3.62806 8.89599C2.51906 8.98399 2.07006 10.367 2.91406 11.09L6.88406 14.49L5.67106 19.575C5.41306 20.657 6.59006 21.512 7.53906 20.932L11.9991 18.208L16.4611 20.932C17.4101 21.512 18.5861 20.657 18.3281 19.575L17.1161 14.491L21.0861 11.091C21.9301 10.367 21.4801 8.98399 20.3721 8.89499L15.1621 8.47699L13.1541 3.64999Z",
  },
  half: {
    evenOdd: true,
    d: "M13.1539 3.64999C12.7269 2.62399 11.2729 2.62399 10.8459 3.64999L8.83794 8.47799L3.62794 8.89599C2.51894 8.98399 2.06994 10.367 2.91394 11.09L6.88394 14.49L5.67094 19.575C5.61188 19.8116 5.62445 20.0605 5.70706 20.29C5.78967 20.5195 5.9386 20.7193 6.13494 20.864L6.12194 20.919L6.16994 20.889C6.36821 21.0309 6.60418 21.1108 6.84791 21.1185C7.09164 21.1261 7.33215 21.0612 7.53894 20.932L11.9989 18.208L16.4609 20.932C17.4099 21.512 18.5859 20.657 18.3279 19.575L17.1159 14.491L21.0859 11.091C21.9299 10.367 21.4799 8.98399 20.3719 8.89499L15.1619 8.47699L13.1539 3.64999ZM11.9999 16.666C12.23 16.6657 12.4556 16.7291 12.6519 16.849L16.7299 19.339L15.6209 14.691C15.5675 14.4672 15.5769 14.2331 15.648 14.0143C15.7191 13.7955 15.8492 13.6006 16.0239 13.451L19.6539 10.343L14.8889 9.96099C14.6598 9.94257 14.4402 9.86132 14.2542 9.72618C14.0683 9.59104 13.9232 9.40724 13.8349 9.19499L11.9999 4.78199V16.666Z",
  },
};

export function Star({
  filled,
  half = false,
  className = "h-4 w-4",
  color,
}: {
  filled: boolean;
  /** Draws the half star. Takes precedence over `filled`. */
  half?: boolean;
  className?: string;
  /** Overrides the brand star color for this star. Defaults to black. */
  color?: string;
}) {
  const state: StarState = half ? "half" : filled ? "full" : "empty";
  const shape = SHAPES[state];
  return (
    <svg
      viewBox="2 2 20 20"
      className={className}
      style={{ color: color ?? "#000" }}
      aria-hidden="true"
    >
      <path
        d={shape.d}
        fill="currentColor"
        fillRule={shape.evenOdd ? "evenodd" : undefined}
        clipRule={shape.evenOdd ? "evenodd" : undefined}
      />
    </svg>
  );
}

export function StarRow({
  score,
  label,
  starClassName,
  color,
}: {
  score: number;
  label?: string;
  /** Size classes for each star, e.g. "h-5 w-5". Defaults to h-4 w-4. */
  starClassName?: string;
  /** Overrides the brand star color for the whole row. */
  color?: string;
}) {
  // Nearest half star: 4.3 -> 4.5, 4.2 -> 4, 4.8 -> 5.
  const rounded = Math.round(Math.min(5, Math.max(0, score)) * 2) / 2;
  const full = Math.floor(rounded);
  const hasHalf = rounded - full === 0.5;
  return (
    <div
      className="flex gap-0.5"
      role="img"
      aria-label={label ?? `${Number(score.toFixed(1))} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          filled={i < full}
          half={i === full && hasHalf}
          className={starClassName}
          color={color}
        />
      ))}
    </div>
  );
}
