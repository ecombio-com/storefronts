import type {Storefront} from '@shopify/hydrogen';

import type {AnnouncementBarData, AnnouncementItem, Device, Variant} from '~/lib/announcements';

// Edited in Shopify admin: Content > Metaobjects > Announcement bar (handle main).
// Types and starter entries: scripts/shopify/setup-announcements.ps1.
const ANNOUNCEMENT_BAR_QUERY = `#graphql
  query AnnouncementBar($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    metaobject(handle: {type: "announcement_bar", handle: "main"}) {
      enabled: field(key: "enabled") { value }
      autoRotate: field(key: "auto_rotate") { value }
      intervalSeconds: field(key: "interval_seconds") { value }
      dismissible: field(key: "dismissible") { value }
      messages: field(key: "messages") {
        references(first: 10) {
          nodes {
            ... on Metaobject {
              id
              text: field(key: "text") { value }
              style: field(key: "style") { value }
              code: field(key: "code") { value }
              buttonLabel: field(key: "button_label") { value }
              link: field(key: "link") { value }
              startsAt: field(key: "starts_at") { value }
              endsAt: field(key: "ends_at") { value }
              showCountdown: field(key: "show_countdown") { value }
              devices: field(key: "devices") { value }
            }
          }
        }
      }
    }
  }
` as const;

const VARIANTS: readonly string[] = ['dark', 'lavender', 'lime'];
const DEVICES: readonly string[] = ['mobile', 'tablet', 'desktop'];

function toTime(value: string | null | undefined): number | null {
  if (!value) return null;
  const t = Date.parse(value);
  return Number.isNaN(t) ? null : t;
}

function toHref(value: string | null | undefined): string | undefined {
  const v = value?.trim();
  return v && (v.startsWith('/') || v.startsWith('https://')) ? v : undefined;
}

function toDevices(value: string | null | undefined): Device[] | undefined {
  if (!value) return undefined;
  try {
    const list = (JSON.parse(value) as unknown[]).filter(
      (d): d is Device => typeof d === 'string' && DEVICES.includes(d),
    );
    return list.length > 0 ? list : undefined;
  } catch {
    return undefined;
  }
}

// Returns null (bar hidden) when it is off, has no live messages, or the query fails.
export async function getAnnouncementBar(storefront: Storefront): Promise<AnnouncementBarData | null> {
  try {
    const {metaobject: bar} = await storefront.query(ANNOUNCEMENT_BAR_QUERY, {
      cache: storefront.CacheShort(),
    });
    if (!bar || bar.enabled?.value !== 'true') return null;

    const now = Date.now();
    const items: AnnouncementItem[] = [];
    for (const node of bar.messages?.references?.nodes ?? []) {
      if (!('id' in node)) continue;
      const text = node.text?.value?.trim();
      if (!text) continue;
      const startsAt = toTime(node.startsAt?.value);
      const endsAtRaw = node.endsAt?.value ?? undefined;
      const endsAt = toTime(endsAtRaw);
      if (startsAt !== null && startsAt > now) continue;
      if (endsAt !== null && endsAt <= now) continue;

      const style = node.style?.value ?? '';
      const href = toHref(node.link?.value);
      items.push({
        id: node.id,
        variant: (VARIANTS.includes(style) ? style : 'lavender') as Variant,
        text,
        code: node.code?.value?.trim() || undefined,
        cta: href ? node.buttonLabel?.value?.trim() || undefined : undefined,
        href,
        countdownEnds: node.showCountdown?.value === 'true' && endsAt !== null ? endsAtRaw : undefined,
        devices: toDevices(node.devices?.value),
      });
    }
    if (items.length === 0) return null;

    const seconds = Number(bar.intervalSeconds?.value);
    return {
      autoRotate: bar.autoRotate?.value !== 'false',
      dismissible: bar.dismissible?.value !== 'false',
      intervalMs: (Number.isFinite(seconds) && seconds >= 2 ? Math.min(seconds, 30) : 6) * 1000,
      items,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}
