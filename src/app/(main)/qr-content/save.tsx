import ArrowDownTrayIcon from "@heroicons/react/24/solid/ArrowDownTrayIcon"
import ClipboardDocumentIcon from "@heroicons/react/24/solid/ClipboardDocumentIcon"
import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "../../../components/button"
import { useGlobalStore } from "../../../stores/global-store"
import { calcSizeWithBorder } from "../../../utils/calcSizeWithBorder"

function addQRCodeBorder(svg: SVGSVGElement): void {
  // Round up to avoid inadvertently rounding to zero.
  const { borderWidth, totalSize } = calcSizeWithBorder(
    svg.viewBox.baseVal.width,
  )
  svg.viewBox.baseVal.width = totalSize
  svg.viewBox.baseVal.height = totalSize

  // Translate all path children.
  const transform = svg.createSVGTransform()
  transform.setTranslate(borderWidth, borderWidth)
  for (const child of svg.children) {
    if (child.tagName !== "path") continue
    const child_ = child as SVGPathElement
    child_.transform.baseVal.appendItem(transform)
  }

  // Add white background for visibility.
  const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect")
  // `2` represents percentages.
  bg.width.baseVal.newValueSpecifiedUnits(2, 100)
  bg.height.baseVal.newValueSpecifiedUnits(2, 100)
  bg.setAttribute("fill", "#FFFFFF")
  svg.prepend(bg)
}

function saveFile(data: string | Blob): void {
  const downloadLink = document.createElement("a")
  document.body.appendChild(downloadLink)

  downloadLink.href = data instanceof Blob ? URL.createObjectURL(data) : data
  downloadLink.target = "_self"
  downloadLink.download = "QR code"
  downloadLink.click()

  downloadLink.remove()
}

type QRContentSaveProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "children"
>

export function QRContentSave(props: QRContentSaveProps) {
  const { content, border, format, size, qrCodeRef } = useGlobalStore()

  // Indicator that copy was successful.
  const [showCopied, setShowCopied] = useState<boolean>(false)
  // Reset `showCopied` after being enabled.
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!showCopied) return
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setShowCopied(false), 3_000)
  }, [showCopied])

  const canvasQRCode = useCallback(
    async (dataString: string): Promise<OffscreenCanvas> => {
      // Load the data string into an img element.
      const svgImg = document.createElement("img")
      await new Promise<void>((resolve, reject) => {
        svgImg.onload = () => resolve()
        svgImg.onerror = reject
        svgImg.src = dataString
      })

      // Import the img into a canvas, then export with the desired format and size.
      const canvas = new OffscreenCanvas(size, size)
      // biome-ignore lint/style/noNonNullAssertion: we can safely assume this will be non-null
      canvas.getContext("2d")!.drawImage(svgImg, 0, 0, size, size)

      // Cleanup
      svgImg.remove()

      return canvas
    },
    [size],
  )

  const serializeSVG = useCallback((): {
    serialized: string
    dataString: string
  } => {
    if (!qrCodeRef.current) throw new Error("Could not find QR code")
    // Clone the SVG, since we want to modify it if adding a border.
    const svg = qrCodeRef.current.cloneNode(true) as SVGSVGElement

    // Remove non-applicable attributes.
    svg.removeAttribute("class")
    svg.removeAttribute("width")
    svg.removeAttribute("height")
    svg.removeAttribute("aria-label")

    // Remove unnecessary path whitespace.
    for (const child of svg.children) {
      if (child.tagName !== "path") continue
      const d = child.getAttribute("d")?.replace(/\s{2,}/g, " ") ?? ""
      child.setAttribute("d", d.trim())
    }

    // Add a border, if specified.
    if (border) addQRCodeBorder(svg)

    // Serialize SVG and convert it to a data string.
    const serialized = new XMLSerializer().serializeToString(svg)
    const dataString = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`

    return { serialized, dataString }
  }, [border, qrCodeRef.current])

  // This function cannot be async due to restrictions within Safari.
  const copyQRCode = useCallback((): void => {
    const { serialized, dataString } = serializeSVG()

    // Copy SVG to clipboard if selected.
    if (format === "image/svg+xml") {
      navigator.clipboard.writeText(serialized).catch(console.error)
      return
    }

    // Copy rasterized image blob to clipboard.
    const clipboardItem = new ClipboardItem({
      // Need to use a promise to properly support Safari.
      [format]: canvasQRCode(dataString).then((canvas) =>
        canvas.convertToBlob({ type: format, quality: 1.0 }),
      ),
    })
    navigator.clipboard
      .write([clipboardItem])
      .then(() => setShowCopied(true))
      .catch(console.error)
  }, [format, serializeSVG, canvasQRCode])

  const downloadQRCode = useCallback(async () => {
    const { dataString } = serializeSVG()

    // Download as SVG if selected.
    if (format === "image/svg+xml") return saveFile(dataString)
    // Load the data string into a canvas for rasterization.
    const canvas = await canvasQRCode(dataString)
    saveFile(await canvas.convertToBlob({ type: format, quality: 1.0 }))
  }, [format, serializeSVG, canvasQRCode])

  return (
    <div {...props}>
      <Button
        type="button"
        className="self-center"
        disabled={!content || format === "image/jpeg"}
        onClick={() => copyQRCode()}
      >
        <ClipboardDocumentIcon />
        {showCopied ? "Copied!" : "Copy"}
      </Button>

      <Button
        type="button"
        className="self-center"
        disabled={!content}
        onClick={() => downloadQRCode()}
      >
        <ArrowDownTrayIcon />
        Download
      </Button>
    </div>
  )
}
