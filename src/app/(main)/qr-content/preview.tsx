import clsx from "clsx"
import type React from "react"
import QRCode from "react-qr-code"
import type { SetRequired } from "type-fest"
import { Text } from "../../../components/text"
import { useGlobalStore } from "../../../stores/global-store"

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
  const { content, prevContent, qrCodeRef } = useGlobalStore()

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
          "p-3 bg-white select-none starting:opacity-0",
          content ? "opacity-100 scale-100" : "opacity-0 scale-95",
        )}
      >
        <QRCode
          className="h-full w-full"
          // Fall back to previous value if current value is "". This prevents changes as it's fading out, which looks odd.
          value={content || prevContent}
          aria-label="QR code preview."
          // biome-ignore lint/suspicious/noExplicitAny: Cast is needed due to missing types.
          ref={qrCodeRef as React.RefObject<any>}
        />
      </div>

      <Text
        className={clsx(
          "flex justify-center items-center p-10 text-center border-zinc-950/10 dark:border-white/10 border-1 border-dashed",
          content ? "opacity-0 scale-95" : "opacity-100 scale-100",
        )}
      >
        Enter text above to generate the QR code.
      </Text>
    </div>
  )
}
