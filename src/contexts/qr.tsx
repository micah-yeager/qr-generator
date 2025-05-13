import * as Comlink from "comlink"
import type React from "react"
import { useState } from "react"
import { useEffect } from "react"
import { useContext, useRef } from "react"
import { createContext } from "react"
import {
  DEFAULT_COPYABLE_FORMATS,
  DEFAULT_EXPORTABLE_FORMATS,
} from "../config/app-defaults.ts"
import { ImageMimeType } from "../config/mime-types.ts"
import type { QRCanvasHandler } from "../workers/qr-canvas-handler.ts"
import { useSettings } from "./settings.tsx"

type ProxiedWorker = Comlink.Remote<QRCanvasHandler>
type QR = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  workerRef: React.RefObject<ProxiedWorker | null>
  exportableFormats: Record<ImageMimeType, boolean>
  copyableFormats: Record<ImageMimeType, boolean>
  size: number
}

const QRContext = createContext<QR | null>(null)

export const useQR = (): QR =>
  // Since the context proper isn't exported and state is always set in the
  // provider below, we can safely cast to avoid downstream type issues.
  useContext(QRContext as React.Context<QR>)

export function QRProvider({ children }: React.PropsWithChildren) {
  const { content, border, errorCorrection, scale } = useSettings()

  const mutationObserverRef = useRef<MutationObserver>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const workerRef = useRef<ProxiedWorker>(null)

  const [exportableFormats, setExportableFormats] = useState(
    DEFAULT_EXPORTABLE_FORMATS,
  )
  const [copyableFormats, setCopyableFormats] = useState(
    DEFAULT_COPYABLE_FORMATS,
  )
  const [size, setSize] = useState<number>(250)

  // Only initialize when in the client environment.
  useEffect(() => {
    // No built-in way to check if a MIME type can be exported by the browser,
    // so test them manually.
    const offscreen = new OffscreenCanvas(1, 1)
    // Must generate a context to allow exporting.
    offscreen.getContext("2d", { alpha: false, willReadFrequently: true })
    for (const mimeType of Object.values(ImageMimeType)) {
      // SVGs have special handling, no checks needed.
      if (mimeType === ImageMimeType.svg) continue

      offscreen.convertToBlob({ type: mimeType }).then((blob) =>
        // Browsers will default to "image/png" if a MIME type is unsupported.
        setExportableFormats((old) => ({
          ...old,
          mimeType: blob.type === mimeType,
        })),
      )

      // Clipboard format support querying is very new, so ensure it exists.
      if (
        "supports" in ClipboardItem &&
        typeof ClipboardItem.supports === "function"
      ) {
        const copyAvailable = ClipboardItem.supports(mimeType)
        setCopyableFormats((old) => ({ ...old, [mimeType]: copyAvailable }))
      }
    }

    // Initialize worker.
    workerRef.current = Comlink.wrap<QRCanvasHandler>(
      // Worker must be initialized all in one place, so webpack picks it up properly.
      // https://github.com/vercel/next.js/issues/31009
      new Worker(new URL("../workers/qr-canvas-handler.ts", import.meta.url), {
        type: "module",
      }),
    )
    // Worker destructor.
    return () => {
      workerRef.current?.[Comlink.releaseProxy]()
    }
  }, [])

  // Set up mutation observer.
  // biome-ignore lint/correctness/useExhaustiveDependencies: Need to re-observe if ref changes.
  useEffect(() => {
    if (canvasRef.current === null) return

    mutationObserverRef.current = new MutationObserver((entries) => {
      for (const entry of entries) {
        if (
          !("tagName" in entry.target) ||
          entry.target.tagName !== "CANVAS" ||
          entry.attributeName !== "width"
        ) {
          continue
        }
        setSize((entry.target as HTMLCanvasElement).width)
        break
      }
    })
    mutationObserverRef.current.observe(canvasRef.current, { attributes: true })

    return () => mutationObserverRef.current?.disconnect()
  }, [canvasRef.current])

  // Transfer control of the canvas to the service worker thread.
  // biome-ignore lint/correctness/useExhaustiveDependencies: Need to re-transfer if refs change.
  useEffect(() => {
    // Skip if not ready to transfer.
    if (canvasRef.current === null || workerRef.current === null) return

    /*
     Wrap with a `try` block in case the `workerRef` changes but the canvas
     doesn't, which would result in an error being thrown.
    */
    try {
      const offscreen = canvasRef.current.transferControlToOffscreen()
      workerRef.current
        .setCanvas(Comlink.transfer(offscreen, [offscreen]))
        .catch(console.error)
    } catch {
      console.warn("Failed to re-transfer an already-transferred canvas.")
    }
  }, [canvasRef.current, workerRef.current])

  // Render on input or settings change.
  useEffect(() => {
    // Skip rendering if an empty string to avoid shifts while transitioning.
    if (!workerRef.current || content === "") return

    workerRef.current
      .draw({ content, encodeOpts: { border, scale, ecc: errorCorrection } })
      .catch(console.error)
  }, [border, content, errorCorrection, scale])

  return (
    <QRContext
      value={{
        canvasRef,
        workerRef,
        exportableFormats,
        copyableFormats,
        size,
      }}
    >
      {children}
    </QRContext>
  )
}
