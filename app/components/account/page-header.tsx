export function AccountPageHeader({
  description,
  title,
}: {
  description?: string | undefined;
  title: string;
}) {
  return (
    <div className="text-center">
      <h1 className="text-3xl sm:text-4xl md:text-5xl">{title}</h1>
      {description ? (
        <p className="mt-1 text-ds-regular leading-6 text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}