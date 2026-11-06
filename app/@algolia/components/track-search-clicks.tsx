import {useEffect, useRef} from 'react';
import type {PublicAlgoliaConfig} from '../config';
import {sendAlgoliaEvent} from '../events';
import {productObjectId} from '../ids';

/**
 * Sends Algolia click events for product cards on the search results page. Cards carry
 * data-product-id; one document-level listener reads it. First-page clicks are attributed
 * to the search (queryID + position); cards loaded later by infinite scroll send a plain click.
 */
export function TrackSearchClicks({
  config,
  queryID,
  firstPageCount,
}: {
  config: PublicAlgoliaConfig | null;
  queryID?: string;
  firstPageCount: number;
}) {
  const latest = useRef({config, queryID, firstPageCount});
  useEffect(() => {
    latest.current = {config, queryID, firstPageCount};
  });

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>('a[data-product-id]');
      const productId = link?.dataset.productId;
      if (!link || !productId) return;

      const index = Array.from(
        document.querySelectorAll('a[data-product-id]'),
      ).indexOf(link);
      const current = latest.current;
      const attributed =
        Boolean(current.queryID) && index >= 0 && index < current.firstPageCount;
      sendAlgoliaEvent(current.config, {
        eventType: 'click',
        eventName: attributed ? 'Search Result Clicked' : 'Product Clicked',
        objectIDs: [productObjectId(productId)],
        ...(attributed ? {queryID: current.queryID, positions: [index + 1]} : {}),
      });
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return null;
}