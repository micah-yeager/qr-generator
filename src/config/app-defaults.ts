import { ImageMimeType } from "./mime-types.ts"

export const DEFAULT_BORDER = true
export const DEFAULT_FORMAT = ImageMimeType.png
export const DEFAULT_SCALE = 10

export const DEFAULT_EXPORTABLE_FORMATS: Record<ImageMimeType, boolean> = {
  [ImageMimeType.jpeg]: true,
  [ImageMimeType.png]: true,
  [ImageMimeType.svg]: true,
  [ImageMimeType.webp]: true,
}
export const DEFAULT_COPYABLE_FORMATS: Record<ImageMimeType, boolean> = {
  [ImageMimeType.jpeg]: false,
  [ImageMimeType.png]: true,
  [ImageMimeType.svg]: true,
  [ImageMimeType.webp]: false,
}
