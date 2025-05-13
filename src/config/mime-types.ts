/**
 * Supported image MIME types.
 */
export enum ImageMimeType {
  jpeg = "image/jpeg",
  png = "image/png",
  svg = "image/svg+xml",
  webp = "image/webp",
}

export enum TextMimeType {
  plain = "text/plain",
}

export const MIME_TYPE_LABEL_MAP = new Map<ImageMimeType, string>([
  [ImageMimeType.jpeg, "JPEG"],
  [ImageMimeType.png, "PNG"],
  [ImageMimeType.svg, "SVG"],
  [ImageMimeType.webp, "WEBP"],
])
