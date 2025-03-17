import clsx from "clsx"
import type React from "react"
import QRCode from "react-qr-code"
import { Text } from "../../../components/text"
import { useGlobalStore } from "../../../stores/global-store"

type QRContentPreviewProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "children"
>

export function QRContentPreview(props: QRContentPreviewProps) {
  const { content, prevContent, size, qrCodeRef } = useGlobalStore()

  return (
    <div {...props}>
      <div
        className={clsx(
          "p-3 bg-white select-none starting:opacity-0",
          content ? "opacity-100 scale-100" : "opacity-0 scale-95",
        )}
      >
        <QRCode
          className="h-full w-full"
          size={size}
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
