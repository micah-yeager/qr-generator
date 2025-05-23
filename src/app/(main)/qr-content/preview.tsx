import clsx from "clsx"
import type React from "react"
import type { SetRequired } from "type-fest"
import { Text } from "../../../components/text"
import { useQR } from "../../../contexts/qr.tsx"

/**
 * Props for {@link QRContentPreview}.
 *
 * Sets the `div` `className` prop as required and disallows children.
 */
type QRContentPreviewProps = SetRequired<
  Omit<React.ComponentPropsWithoutRef<"div">, "children">,
  "className"
>

/**
 * Preview a QR code.
 *
 * @param className - Requires a `size-` utility class at minimum.
 * @param rest - Any remaining parameters for a `div` element.
 * @see {@link QRContentPreviewProps}
 */
export function QRContentPreview({
  className,
  ...rest
}: QRContentPreviewProps) {
  const { canvasRef, content } = useQR()

  return (
    <div
      {...rest}
      className={clsx(
        className,
        "relative *:absolute *:size-full *:rounded-md *:motion-safe:transition-all *:motion-safe:duration-300 *:motion-safe:ease-in-out",
      )}
    >
      <div
        className={clsx(
          "flex justify-center items-center overflow-clip select-none starting:opacity-0",
          content
            ? "opacity-100 scale-100 visible"
            : "opacity-0 scale-95 invisible",
        )}
      >
        <canvas
          className="max-h-full max-w-full flex-initial"
          aria-label="QR code preview."
          ref={canvasRef}
        />
      </div>

      <Text
        className={clsx(
          "flex justify-center items-center p-10 text-center border-zinc-950/10 dark:border-white/10 border-1 border-dashed",
          content
            ? "opacity-0 scale-95 invisible"
            : "opacity-100 scale-100 visible",
        )}
      >
        Enter text above to generate the QR code.
      </Text>
    </div>
  )
}
