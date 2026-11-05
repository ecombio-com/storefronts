// Path: app/lib/ratings.server.ts
import type {YotpoClient} from '~/@yotpo/client.server';
import {toProductCardData} from '~/lib/product-card';

type CardNode = Parameters<typeof toProductCardData>[0];

export async function withRatings(yotpo: YotpoClient, nodes: CardNode[]) {
  const numeric = (gid: string) => gid.split('/').pop() ?? '';
  const ratings = await yotpo.getProductCardRatings(nodes.map((node) => numeric(node.id)));
  return nodes.map((node) => {
    const rating = ratings.get(numeric(node.id));
    return toProductCardData(node, rating ? {rating} : {});
  });
}
