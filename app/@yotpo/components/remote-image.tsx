// Path: app/@yotpo/components/remote-image.tsx
// Stand-in for next/image: Yotpo photos are remote and unoptimized.

export default function Image({
  src,
  alt,
  fill,
  sizes,
  className,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  unoptimized?: boolean;
  sizes?: string;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      sizes={sizes}
      loading="lazy"
      decoding="async"
      className={(fill ? 'absolute inset-0 size-full ' : '') + (className ?? '')}
    />
  );
}
