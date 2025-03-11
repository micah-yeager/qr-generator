import clsx from "clsx"
import type React from "react"

export function Divider({
  soft = false,
  className,
  ...props
}: { soft?: boolean } & React.ComponentPropsWithoutRef<"hr">) {
  return (
    // biome-ignore lint/a11y/noInteractiveElementToNoninteractiveRole: Visual-only separator
    <hr
      role="presentation"
      {...props}
      className={clsx(
        className,
        "w-full border-t border-zinc-950/10 dark:border-white/10",
      )}
    />
  )
}
