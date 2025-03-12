import clsx from "clsx"
import type React from "react"

export function Text({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"p">) {
  return (
    <p
      data-slot="text"
      {...props}
      className={clsx(
        className,
        "text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400",
      )}
    />
  )
}

export function Strong({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"strong">) {
  return (
    <strong
      {...props}
      className={clsx(className, "font-medium text-zinc-950 dark:text-white")}
    />
  )
}
