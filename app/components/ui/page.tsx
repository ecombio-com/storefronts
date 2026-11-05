import { cn } from "cn";
import type { ComponentProps } from "react";

export function Page({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("bg-background pt-10", className)} {...props}>
      {children}
    </div>
  );
}
