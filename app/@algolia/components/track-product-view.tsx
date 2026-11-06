import {useEffect} from 'react';
import type {PublicAlgoliaConfig} from '../config';
import {sendAlgoliaEvent} from '../events';
import {productObjectId} from '../ids';

/** Fires one Algolia "view" event when a product page mounts. Renders nothing. */
export function TrackProductView({
  config,
  productId,
}: {
  config: PublicAlgoliaConfig | null;
  productId: string;
}) {
  useEffect(() => {
    sendAlgoliaEvent(config, {
      eventType: 'view',
      eventName: 'Product Viewed',
      objectIDs: [productObjectId(productId)],
    });
  }, [config, productId]);
  return null;
}