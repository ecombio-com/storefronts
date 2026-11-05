import {FileText} from 'lucide-react';
import {getYouTubeId} from '~/lib/product';

export function ProductResources({
  manualUrl,
  videoUrl,
}: {
  manualUrl?: string | null | undefined;
  videoUrl?: string | null | undefined;
}) {
  const videoId = getYouTubeId(videoUrl);
  if (!manualUrl && !videoId) return null;
  return (
    <section className="grid gap-5" data-slot="product-resources" id="manual-and-assembly">
      <h2 className="text-xl font-semibold">Manual and assembly</h2>
      {videoId ? (
        <div className="aspect-video w-full overflow-hidden rounded-lg">
          <iframe
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="size-full"
            loading="lazy"
            src={`https://www.youtube-nocookie.com/embed/${videoId}`}
            title="Assembly video"
          />
        </div>
      ) : null}
      {manualUrl ? (
        <a
          className="inline-flex w-fit items-center gap-2 font-semibold underline underline-offset-4"
          href={manualUrl}
          rel="noopener"
          target="_blank"
        >
          <FileText aria-hidden className="size-4" />
          Owner&rsquo;s manual (PDF)
        </a>
      ) : null}
    </section>
  );
}