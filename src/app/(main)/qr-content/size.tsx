import clsx from "clsx"
import type React from "react"
import { Strong, Text } from "../../../components/text.tsx"
import { useQR } from "../../../contexts/qr.tsx"

type SizeOptionProps = Omit<
  React.ComponentPropsWithoutRef<typeof Text>,
  "children"
>

export function QRSize({ className, ...rest }: SizeOptionProps) {
  const { content, size } = useQR()

  return (
    <Text
      {...rest}
      className={clsx(
        "motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-in-out",
        content
          ? "opacity-100 scale-100 visible"
          : "opacity-0 scale-95 invisible",
        className,
      )}
    >
      Final size: <Strong>{size} px</Strong>
    </Text>
  )
}
