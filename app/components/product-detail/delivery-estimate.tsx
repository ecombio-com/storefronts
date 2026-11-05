import {MapPin, Truck} from 'lucide-react';
import {useEffect, useState} from 'react';

import {ZipCode} from '~/components/nav/zip-code';
import {estimateDelivery, genericRanges, type DeliveryOverrides} from '~/lib/zip/delivery';
import {useCountry} from '~/lib/zip/use-country';

// Set to false if some products don't ship free.
const FREE_SHIPPING = true;

const COPY = {
  dated: (range: string) => `${FREE_SHIPPING ? 'Free delivery' : 'Delivery'} by ${range}`,
  generic: (handling: string, transit: string) =>
    `Ships in ${handling} business days, arrives in ${transit} business days`,
  shipTo: 'Ship to',
  enterZip: 'Enter ZIP code',
};

function formatRange(start: Date, end: Date) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
  if (start.getTime() === end.getTime()) return formatter.format(start);
  return formatter.formatRange(start, end);
}

export function DeliveryEstimate({delivery}: {delivery?: DeliveryOverrides}) {
  const country = useCountry();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {handling, transit} = genericRanges(delivery);
  // Server render and first client render use the generic line, so there is no hydration
  // mismatch and no stale date. Dates replace only the headline, and only for US visitors.
  let headline = COPY.generic(handling, transit);
  if (mounted && country.code === 'US') {
    const {arriveMin, arriveMax} = estimateDelivery(delivery);
    headline = COPY.dated(formatRange(arriveMin, arriveMax));
  }

  return (
    <div className="mt-4 rounded-lg bg-[#dce4ff] px-4 py-3 text-ds-regular text-foreground">
      <div className="flex items-center gap-3">
        <Truck className="size-6 shrink-0" aria-hidden="true" />
        <p className="font-semibold">{headline}</p>
      </div>
      <div className="mt-3 flex items-center gap-3 border-t border-black/10 pt-3">
        <MapPin className="size-5 shrink-0" aria-hidden="true" />
        <div className="flex items-center gap-1.5">
          <span>{COPY.shipTo}</span>
          <ZipCode
            trigger={(open, currentZip) => (
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={open}
                className="font-semibold underline underline-offset-2 hover:opacity-70"
              >
                {currentZip || COPY.enterZip}
              </button>
            )}
          />
        </div>
      </div>
    </div>
  );
}
