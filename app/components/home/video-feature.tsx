// Path: app/components/home/video-feature.tsx
// Heading and paragraph, then a centered YouTube embed. Hidden if the URL is not a valid YouTube link.
function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    let id: string | null = null;
    if (u.hostname === 'youtu.be') id = u.pathname.slice(1);
    else if (u.hostname.endsWith('youtube.com')) {
      if (u.pathname === '/watch') id = u.searchParams.get('v');
      else if (u.pathname.startsWith('/embed/') || u.pathname.startsWith('/shorts/')) {
        id = u.pathname.split('/')[2] ?? null;
      }
    }
    if (!id || !/^[\w-]{11}$/.test(id)) return null;
    return `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
  } catch {
    return null;
  }
}

export function VideoFeature({
  title,
  description,
  videoUrl,
  videoTitle,
}: {
  title: string;
  description?: string | undefined;
  videoUrl: string;
  videoTitle: string;
}) {
  const src = toEmbedUrl(videoUrl);
  if (!src) return null;

  return (
    <section className="flex flex-col gap-ds-medium">
      <h2 className="font-display tracking-tight text-ds-h2 font-semibold">{title}</h2>
      {description ? <p className="max-w-3xl text-ds-medium text-muted-foreground">{description}</p> : null}
      <div className="relative mx-auto aspect-video w-full max-w-4xl overflow-hidden rounded-ds-lg bg-muted shadow-ds-drop-xs">
        <iframe
          src={src}
          title={videoTitle}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 size-full border-0"
        />
      </div>
    </section>
  );
}
