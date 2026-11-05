import { cn } from "cn";
import type { ComponentPropsWithRef } from "react";

export function Container({ children, className, ...props }: ComponentPropsWithRef<"section">) {
  return (
    <section
      className={cn("mx-auto w-full max-w-(--container-max) px-ds-global", className)}
      {...props}
    >
      {children}
    </section>
  );
}
