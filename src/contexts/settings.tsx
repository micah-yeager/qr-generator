import type { ErrorCorrection } from "qr"
import { createContext, useCallback, useContext, useState } from "react"
import type React from "react"
import {
  DEFAULT_BORDER,
  DEFAULT_ERROR_CORRECTION,
  DEFAULT_FORMAT,
  DEFAULT_SCALE,
} from "../config/app-defaults"
import type { ImageMimeType } from "../config/mime-types.ts"
import { useLocalStorage } from "../hooks/useLocalStorage"

export type Settings = {
  /** The content used to generate a QR code. */
  content: string
  setContent: (value: string) => void

  /** Whether to include a border in the image export. */
  border: boolean
  setBorder: (value: boolean) => void
  /** The level of error correction to allow when generating a QR code. */
  errorCorrection: ErrorCorrection
  setErrorCorrection: (value: ErrorCorrection) => void
  /** The image format to export as. */
  format: ImageMimeType
  setFormat: (value: ImageMimeType) => void
  /** The scale to export a rasterized image as. */
  scale: number
  setScale: (size: number) => void
  resetToDefaults: () => void
}

const SettingsContext = createContext<Settings | null>(null)

/**
 * Get and set values stored in the global app context store.
 *
 * @see {@link SettingsProvider}
 */
export const useSettings = (): Settings =>
  // Since the context proper isn't exported and state is always set in the
  // provider below, we can safely cast to avoid downstream type issues.
  useContext(SettingsContext as React.Context<Settings>)

/**
 * Provide the global app context to child elements.
 *
 * @see {@link useSettings}
 */
export function SettingsProvider({ children }: React.PropsWithChildren) {
  // Stored states.
  const [border, setBorder] = useLocalStorage<boolean>("border", DEFAULT_BORDER)
  const [errorCorrection, setErrorCorrection] = useLocalStorage(
    "error correction",
    DEFAULT_ERROR_CORRECTION,
  )
  const [format, setFormat] = useLocalStorage<ImageMimeType>(
    "format",
    DEFAULT_FORMAT,
  )
  const [scale, setScale] = useLocalStorage<number>("scale", DEFAULT_SCALE)

  // Transient states.
  const [content, setContent] = useState<string>("")

  // Defaults
  const resetToDefaults = useCallback(() => {
    setBorder(DEFAULT_BORDER)
    setErrorCorrection(DEFAULT_ERROR_CORRECTION)
    setFormat(DEFAULT_FORMAT)
    setScale(DEFAULT_SCALE)
  }, [setBorder, setErrorCorrection, setFormat, setScale])

  return (
    <SettingsContext.Provider
      value={{
        content,
        setContent,
        border,
        setBorder,
        errorCorrection,
        setErrorCorrection,
        format,
        setFormat,
        scale,
        setScale,
        resetToDefaults,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}
