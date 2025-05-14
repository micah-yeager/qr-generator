import ArrowDownTrayIcon from "@heroicons/react/24/solid/ArrowDownTrayIcon"
import ClipboardDocumentIcon from "@heroicons/react/24/solid/ClipboardDocumentIcon"
import clsx from "clsx"
import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "../../../components/button"
import { ImageMimeType, TextMimeType } from "../../../config/mime-types.ts"
import { useQR } from "../../../contexts/qr.tsx"

/**
 * Download the provided string or blob.
 *
 * @param data - Data to download.
 */
function saveFile(data: Blob): void {
  const objUrl = URL.createObjectURL(data)

  const downloadLink = document.createElement("a")
  downloadLink.href = objUrl
  downloadLink.target = "_self"
  downloadLink.download = "QR code"

  downloadLink.click()
  downloadLink.remove()
  URL.revokeObjectURL(objUrl)
}

type QRContentSaveProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "children"
>

export function QRContentSave({ className, ...rest }: QRContentSaveProps) {
  const { border, content, copyableFormats, format, scale, workerRef } = useQR()

  // Indicator that copy was successful.
  const [showCopied, setShowCopied] = useState<boolean>(false)
  // Reset `showCopied` after being enabled.
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!showCopied) return
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setShowCopied(false), 3_000)
  }, [showCopied])

  // Use param for format to avoid re-memoization when the format changes.
  const renderToArrayBuffer = useCallback(
    async (format: ImageMimeType): Promise<ArrayBuffer> => {
      if (!workerRef.current) throw new Error("Worker not initialized")

      return workerRef.current.toFormat({
        format,
        content,
        encodeOpts: { border, scale },
      })
    },
    [border, content, scale, workerRef.current],
  )

  // This function cannot be async due to restrictions within Safari.
  const writeToClipboard = useCallback((): void => {
    /*
     Override the MIME type if this is an SVG since it won't copy properly
     with `ImageMimeType.svg` ("image/svg+xml")
    */
    const mimeTypeOverride =
      format === ImageMimeType.svg ? TextMimeType.plain : format

    const clipboardItem = new ClipboardItem({
      [mimeTypeOverride]: renderToArrayBuffer(format).then(
        (buffer) => new Blob([buffer], { type: mimeTypeOverride }),
      ),
    })
    navigator.clipboard
      .write([clipboardItem])
      .then(() => setShowCopied(true))
      .catch(console.error)
  }, [format, renderToArrayBuffer])

  const download = useCallback(async () => {
    const blob = new Blob([await renderToArrayBuffer(format)], { type: format })
    saveFile(blob)
  }, [format, renderToArrayBuffer])

  return (
    <div {...rest} className={clsx(className, "grid grid-cols-2 gap-x-2")}>
      <Button
        type="button"
        className="self-center"
        disabled={!(content && copyableFormats[format])}
        onClick={() => writeToClipboard()}
      >
        <ClipboardDocumentIcon />
        {showCopied ? "Copied!" : "Copy"}
      </Button>

      <Button
        type="button"
        className="self-center"
        disabled={!content}
        onClick={() => download()}
      >
        <ArrowDownTrayIcon />
        Download
      </Button>
    </div>
  )
}
