import { createContext, useContext, useRef, useState } from "react"
import type React from "react"
import {
  DEFAULT_BORDER,
  DEFAULT_FORMAT,
  DEFAULT_SIZE,
} from "../config/app-defaults"
import { useLocalStorage } from "../hooks/useLocalStorage"
import type { ImageFormat } from "../types/ImageFormat"

type GlobalStore = {
  /** The content used to generate a QR code. */
  content: string
  setContent: (value: string) => void
  /** The previously-entered content used to generate a QR code. */
  prevContent: string
  setPrevContent: (value: string) => void

  /** Whether to include a border in the image export. */
  border: boolean
  setBorder: (value: boolean) => void
  /** The image format to export as. */
  format: ImageFormat
  setFormat: (value: ImageFormat) => void
  /** The size to export a rasterized image as. */
  size: number
  setSize: (size: number) => void

  /** Reference to the generated QR code. */
  qrCodeRef: React.RefObject<SVGSVGElement | null>
}

const GlobalStoreContext = createContext<GlobalStore | null>(null)

/**
 * Get and set values stored in the global app context store.
 *
 * @see {@link GlobalStoreProvider}
 */
export const useGlobalStore = (): GlobalStore =>
  // Since the context proper isn't exported and state is always set in the
  // provider below, we can safely cast to avoid downstream type issues.
  useContext(GlobalStoreContext as React.Context<GlobalStore>)

/**
 * Provide the global app context to child elements.
 *
 * @see {@link useGlobalStore}
 */
export function GlobalStoreProvider({ children }: React.PropsWithChildren) {
  const qrCodeRef = useRef<SVGSVGElement>(null)

  // Stored states.
  const [border, setBorder] = useLocalStorage<boolean>("border", DEFAULT_BORDER)
  const [format, setFormat] = useLocalStorage<ImageFormat>(
    "format",
    DEFAULT_FORMAT,
  )
  const [size, setSize] = useLocalStorage<number>("size", DEFAULT_SIZE)

  // Transient states.
  const [content, setContent] = useState<string>("")
  const [prevContent, setPrevContent] = useState<string>("")

  return (
    <GlobalStoreContext.Provider
      value={{
        content,
        setContent,
        prevContent,
        setPrevContent,
        border,
        setBorder,
        format,
        setFormat,
        size,
        setSize,
        qrCodeRef,
      }}
    >
      {children}
    </GlobalStoreContext.Provider>
  )
}
