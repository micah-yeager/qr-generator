import ArrowDownTrayIcon from "@heroicons/react/24/solid/ArrowDownTrayIcon"
import ClipboardDocumentIcon from "@heroicons/react/24/solid/ClipboardDocumentIcon"
import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "../../../components/button"
import { useGlobalStore } from "../../../stores/global-store"
import { calcSize } from "../../../utils/calcSize"

/**
 * Manipulate and export SVG-related data.
 */
class SVGData {
  readonly svg: SVGSVGElement

  /**
   * The view box size of the SVG.
   */
  get size(): number {
    return this.svg.viewBox.baseVal.width
  }

  #serialized: string | undefined
  /**
   * The SVG as an XML string.
   */
  get serialized(): string {
    if (this.#serialized === undefined) {
      this.#serialized = new XMLSerializer().serializeToString(this.svg)
    }
    return this.#serialized
  }

  #dataString: string | undefined
  /**
   * The SVG as a `data:image/svg+xml` data string.
   */
  get dataString(): string {
    if (this.#dataString === undefined) {
      this.#dataString = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(this.serialized)}`
    }
    return this.#dataString
  }

  /**
   * @param svg - The SVG to process.
   */
  constructor(svg: SVGSVGElement) {
    this.svg = svg.cloneNode(true) as SVGSVGElement

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
  }

  /**
   * Clears cached calculated values.
   */
  clearCache() {
    this.#dataString = undefined
    this.#serialized = undefined
  }

  /**
   * Adds a border to the SVG.
   */
  addBorder() {
    // Round up to avoid inadvertently rounding to zero.
    const { borderWidth, totalSize } = calcSize(this.size)
    this.svg.viewBox.baseVal.width = totalSize
    this.svg.viewBox.baseVal.height = totalSize

    // Translate all path children.
    const transform = this.svg.createSVGTransform()
    transform.setTranslate(borderWidth, borderWidth)
    for (const child of this.svg.children) {
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
    this.svg.prepend(bg)

    this.clearCache()
  }
}

/**
 * Download the provided string or blob.
 *
 * @param data - Data to download.
 */
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
  const { content, border, format, scale, qrCodeRef } = useGlobalStore()

  // Indicator that copy was successful.
  const [showCopied, setShowCopied] = useState<boolean>(false)
  // Reset `showCopied` after being enabled.
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!showCopied) return
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setShowCopied(false), 3_000)
  }, [showCopied])

  const processSVG = useCallback((): SVGData => {
    if (!qrCodeRef.current) throw new Error("Could not find QR code")
    const svgData = new SVGData(qrCodeRef.current)

    // Add a border, if specified.
    if (border) svgData.addBorder()

    return svgData
  }, [border, qrCodeRef.current])

  const canvasQRCode = useCallback(
    async (svgData: SVGData): Promise<OffscreenCanvas> => {
      // Load the data string into an img element.
      const svgImg = document.createElement("img")
      await new Promise<void>((resolve, reject) => {
        svgImg.onload = () => resolve()
        svgImg.onerror = reject
        svgImg.src = svgData.dataString
      })

      // Import the img into a canvas, then export with the desired format and scale.
      const finalSize = svgData.size * scale
      const canvas = new OffscreenCanvas(finalSize, finalSize)
      // biome-ignore lint/style/noNonNullAssertion: we can safely assume this will be non-null
      canvas.getContext("2d")!.drawImage(svgImg, 0, 0, finalSize, finalSize)

      // Cleanup
      svgImg.remove()

      return canvas
    },
    [scale],
  )

  // This function cannot be async due to restrictions within Safari.
  const copyQRCode = useCallback((): void => {
    const svgData = processSVG()

    // Copy SVG to clipboard if selected.
    if (format === "image/svg+xml") {
      navigator.clipboard.writeText(svgData.serialized).catch(console.error)
      return
    }

    // Copy rasterized image blob to clipboard.
    const clipboardItem = new ClipboardItem({
      // Need to use a promise to properly support Safari.
      [format]: canvasQRCode(svgData).then((canvas) =>
        canvas.convertToBlob({ type: format, quality: 1.0 }),
      ),
    })
    navigator.clipboard
      .write([clipboardItem])
      .then(() => setShowCopied(true))
      .catch(console.error)
  }, [format, processSVG, canvasQRCode])

  const downloadQRCode = useCallback(async () => {
    const svgData = processSVG()

    // Download as SVG if selected.
    if (format === "image/svg+xml") return saveFile(svgData.dataString)
    // Load the data string into a canvas for rasterization.
    const canvas = await canvasQRCode(svgData)
    saveFile(await canvas.convertToBlob({ type: format, quality: 1.0 }))
  }, [format, processSVG, canvasQRCode])

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
