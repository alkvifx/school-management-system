import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex min-h-[44px] w-full rounded-[var(--app-radius-sm)] border border-[hsl(var(--app-border))] bg-[hsl(var(--app-surface))] px-4 py-3 text-base shadow-[var(--app-shadow)] transition-colors sm:h-10 sm:py-2",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[hsl(var(--app-text))]",
        "placeholder:text-[hsl(var(--app-text-muted))]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--app-accent))] focus-visible:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[hsl(var(--app-accent-muted))]",
        "text-[hsl(var(--app-text))] md:text-sm",
        className
      )}
      ref={ref}
      {...props} />
  );
})
Input.displayName = "Input"

export { Input }
