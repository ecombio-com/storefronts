# Design System

How the storefront's visual styles work: color, type, spacing, radius, shadow, layout, and the header's runtime contract. Read this before changing styles or the header.

Values come from `app/styles/tokens.css` and `app/styles/tailwind.css`. This replaces `docs/storefronts/design-system/design-system.md` in the old Next.js repo. `tokens.css` is identical to the old repo's `app/tokens.css`, and `tailwind.css` mirrors the old `globals.css` plus the fontsource imports.

> **Keeping this doc current:** if you change `tokens.css`, `tailwind.css`, or `components.json`, update this file in the same change.

## Where it lives

| File | Role |
| --- | --- |
| `app/styles/tokens.css` | Reference tokens: brand scales, spacing, type, borders, shadows, grid, logo, page blocks. Mobile values are the base; desktop overrides at `min-width: 768px`. Defines `.ds-container` and `.ds-grid`, `--font-heading`, `--font-body`. |
| `app/styles/tailwind.css` | Tailwind v4 entry. Imports tailwindcss, tw-animate-css, the fontsource packages and `tokens.css`. Holds the shadcn semantic variables and several `@theme inline` blocks that map variables to utilities. Defines `--font-geist-sans`, `--font-geist-mono`, `--font-fraunces`, `--text-xxs`. |
| `app/styles/reset.css`, `app.css` | Hydrogen template styles. Candidates for removal as the template UI is replaced. |
| `components.json` | shadcn config (style `base-nova`, neutral, CSS variables, lucide, `~` aliases, `rsc: false`). |
| `app/components/ui/` | Base components (base-ui primitives plus cva). |
| `vite.config.ts` | Tailwind runs through `@tailwindcss/vite`. |

Fonts come from fontsource packages. `next/font` is gone. Utilities: `font-sans` (Geist), `font-display` (Fraunces, Georgia fallback), `font-mono` (Geist Mono).

## Three token layers

1. **Semantic (shadcn):** `--background`, `--primary`, etc. Use for most UI color.
2. **Design system (`ds`):** spacing, radius, type size, and shadow, exposed as `*-ds-*` utilities.
3. **Brand scales:** `--color-primary-50..950` (lime) and `--color-secondary-50..950` (purple), plus `--color-brand-primary` (#E3F77E) and `--color-brand-secondary` (#D9BBF7). Tailwind does not generate classes for these. Use `bg-(--color-primary-300)`.

`bg-primary` is the shadcn semantic color (black), not the brand lime.

### Semantic colors

| Utilities | Value |
| --- | --- |
| `bg-background`, `text-foreground` | #F8F9FC, #0E1016 |
| `bg-card`, `bg-popover` | #FFFFFF |
| `bg-primary`, `text-primary-foreground` | #000000, #FFFFFF |
| `bg-secondary`, `bg-muted` | #EDEFF3 |
| `text-muted-foreground` | #515358 |
| `bg-accent`, `text-accent-foreground` | #EFE8F7, #441877 |
| `bg-destructive` | #CC0001 |
| `border-border`, `border-border-subtle` | #D2D4DA, 40% of that |
| `bg-overlay-dark`, `bg-overlay-light` | #000, #FFF. Fixed in every theme, for text on images |
| `bg-scrim`, `backdrop-blur-(--scrim-blur)` | rgb(20 20 20 / 0.4), 6px. Dims and blurs the page behind search. Use for every modal and dropdown |

Header and card surfaces use `bg-card` (white). Page background is `bg-background`, which is slightly tinted.

### Spacing, radius, type, shadow

Examples: `p-ds-medium`, `gap-ds-regular`, `rounded-ds-md`, `text-ds-regular`, `shadow-ds-drop-md`.

| Token | Mobile | Desktop (768px+) |
| --- | --- | --- |
| spacing `xxsmall / xsmall / small / regular` | 3 / 6 / 9 / 12 | 4 / 8 / 12 / 16 |
| spacing `medium / large / xlarge / xxlarge` | 24 / 36 / 48 / 60 | 32 / 48 / 64 / 80 |
| spacing `global` | 24 | 64 |
| radius `sm / md / lg` | 3 / 6 / 12 | 4 / 8 / 16 |
| `text-ds-h1 .. h5` | 36 / 24 / 18 / 15 / 12 | 48 / 32 / 24 / 20 / 16 |
| `text-ds-large / medium / regular / small / tiny` | 22 / 18 / 14 / 12 / 10 | 24 / 20 / 16 / 14 / 12 |

`text-xxs` is 0.625rem. Two radius scales exist: `rounded-ds-*` and shadcn's `rounded-sm/md/lg/xl`. Prefer `ds`. Shadows: `shadow-ds-drop-xs..xl`, `shadow-ds-inner-xs..xl`.

## Layout

- `Container` (`app/components/ui/container.tsx`) renders a `<section>` with `max-w-(--container-max)` and `px-ds-global` (24px mobile, 64px desktop). All header tiers use it.

## Z-index scale (current, informal)

| Layer | Value |
| --- | --- |
| Sticky PDP tabs, filter sidebar | `z-20` |
| **Header (`#nav-outer`)** | **`z-30`** |
| Mega-panel dropdown | `z-40` |
| Locale panel | `z-50` |
| Search modal, other dialogs | `z-60` |
| Skip link | `z-100` |

Keep the header at `z-30`. At the template's `z-5` the dropdown opens behind the sticky PDP tabs and filter sidebar.

## Header runtime contract

Other components depend on these names, so do not rename them.

| Name | Owner | Consumers |
| --- | --- | --- |
| `#nav-outer` | header element | `NavScrollBehavior`, `NavHeightSync` |
| `[data-nav-dropdown]` | dropdown panels in `quick-links.tsx` | `NavScrollBehavior` hides them on scroll |
| `--header-offset` | `NavScrollBehavior` (and `NavHeightSync` while visible) | PDP tabs, collection filter sidebar (sticky `top`) |
| `--header-offset-transition` | `NavScrollBehavior` | same sticky elements |
| `html[data-buy-bar="on"]` | sticky buy bar | header stays hidden while on |
| `--buy-bar-offset` | sticky buy bar | header offset when hidden |
| `html[data-reading]`, `--reading-progress` | blog reading progress | header progress bar |
| `#main-content` | `<main>` in `PageLayout.tsx` | skip link target |

## Header rules

- Use `LocalizedLink` for internal links. An unprefixed path costs a 308 redirect from `localeRedirect`.
- Never prefetch the account link. Sign-in is a plain `<a>` to the prefixed `/account/login` route (full navigation).
- Always render menu titles through `parseNavMenu`, on desktop and mobile. Never print raw `item.title`.
- Dropdowns need Escape to close, `aria-expanded` and `aria-haspopup` on triggers, and keyboard access to the panel.
- Do not start hide-on-scroll while keyboard focus is inside the header. Use `:has(:focus-visible)`, not `:focus-within`, which would pin the header open after a mouse click.
- Honor `prefers-reduced-motion` for looping or sliding animation. Exception: the search pill typewriter always runs on desktop (owner decision, matches the Next.js site).
- Text on `bg-card` must meet 4.5:1. `text-foreground/60` passes. `/50` and `/40` do not.
- No hardcoded English in new code once `use-intl` is added.

## Known gaps (off-system styling, from the header audit)

| Where | Now | Should be |
| --- | --- | --- |
| Dropdown padding | `px-5 lg:px-10` | match `Container` padding |

Missing tokens: background blur, motion durations and easings, a z-index scale. One theme (light).

## Next.js to Hydrogen porting rules

- Replace `@/` imports with `~/`. Replace `next/link` and `next/image` with `LocalizedLink` and a plain `<img>` (or `remote-image`). Replace `next-intl` with the project's i18n once added.
- Remove `"use client"` and `"use server"` lines. Import from `react-router`, never `react-router-dom`.
- Keep Tailwind classes and tokens unchanged. Do not introduce raw hex, rgba, arbitrary pixel values or raw palette colors while porting.
- `components/product-detail/technical-specs.css` already uses only `var()` tokens and can be copied as is.

## Hydrogen specifics

- React 18.3, Hydrogen 2026.4.7. Do not copy React 19 code without checking.
- The CSP is generated in `entry.server.tsx`. Inline scripts need the nonce from `useNonce()`. External images and third-party scripts (Klaviyo, Algolia) must be added to the policy.
- Prefetch with `prefetch="intent"` only on safe, loader-only routes.

## Adding a token

1. Add the variable to `:root` in `app/styles/tokens.css` (desktop value in the `@media (min-width: 768px)` block if it scales).
2. Map it in an `@theme inline` block in `app/styles/tailwind.css`.
3. Use the generated utility, or `bg-(--name)` if unmapped.
4. Update the tables above.

## Adding a shadcn component

Run `pnpm dlx shadcn@latest add <name>`, then replace raw palette and pixel values in the generated file with semantic or `ds` tokens.
