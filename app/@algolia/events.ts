import type {PublicAlgoliaConfig} from './config';
import type {AlgoliaInsightsEvent} from './types';

// Sends click / view / conversion events to Algolia Insights. Fire-and-forget; never throws.
// Events are sent only when Shopify's Customer Privacy API reports analytics consent, so they
// stay silent until that API has loaded on the page.

const TOKEN_KEY = 'algolia-user-token';

type PrivacyWindow = {
  Shopify?: {
    customerPrivacy?: {analyticsProcessingAllowed?: () => boolean};
  };
};

function analyticsConsent(): boolean | undefined {
  if (typeof window === 'undefined') return undefined;
  const privacy = (window as unknown as PrivacyWindow).Shopify?.customerPrivacy;
  if (!privacy?.analyticsProcessingAllowed) return undefined;
  return privacy.analyticsProcessingAllowed();
}

function userToken(): string {
  try {
    let t = localStorage.getItem(TOKEN_KEY);
    if (!t) {
      t = crypto.randomUUID();
      localStorage.setItem(TOKEN_KEY, t);
    }
    return t;
  } catch {
    return 'anonymous';
  }
}

export function sendAlgoliaEvent(
  config: PublicAlgoliaConfig | null | undefined,
  event: AlgoliaInsightsEvent,
): void {
  if (!config) return;
  const consent = analyticsConsent();
  if (consent === false) {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage unavailable */
    }
  }
  if (consent !== true) return;
  const body = JSON.stringify({
    events: [
      {
        ...event,
        index: config.indexName,
        userToken: userToken(),
        timestamp: Date.now(),
      },
    ],
  });
  fetch('https://insights.algolia.io/1/events', {
    method: 'POST',
    keepalive: true,
    headers: {
      'X-Algolia-Application-Id': config.appId,
      'X-Algolia-API-Key': config.searchKey,
      'Content-Type': 'application/json',
    },
    body,
  }).catch(() => {});
}