import * as Comlink from "comlink"
import encodeQR, { type QrOpts } from "qr"
import type { Merge } from "type-fest"
import UPNG from "upng-js"
import { ImageMimeType } from "../config/mime-types.ts"

type EncodeOpts = Merge<QrOpts, { border?: boolean }>

type ToFormatParams =
  | {
      format: ImageMimeType.svg
      content: string
      encodeOpts: EncodeOpts
    }
  | {
      format: Exclude<ImageMimeType, ImageMimeType.svg>
      content?: string
      encodeOpts?: EncodeOpts
    }

/**
 * Converts {@link EncodeOpts app options} into {@link encodeQR} options.
 *
 * @param opts - The {@link EncodeOpts} to convert.
 * @returns Options compatible with {@link QrOpts}.
 * @protected
 */
function convertOptions<T extends EncodeOpts>(opts: T): Merge<T, QrOpts> {
  return {
    ...opts,
    border: opts.border ? 2 : 0,
  }
}

/**
 * Retrieves the 2D rendering context from an {@link OffscreenCanvas}.
 *
 * @param canvas - The OffscreenCanvas instance from which the 2D context will
 *   be retrieved.
 * @param opts - The 2D
 *   {@link https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas/getContext#contextattributes context attributes}.
 * @returns The 2D rendering context of the given canvas.
 * @throws {@link ContextError} if the 2D context cannot be retrieved from the
 *   canvas.
 */
function get2DContext(
  canvas: OffscreenCanvas,
  opts?: { alpha?: boolean; willReadFrequently?: boolean },
): OffscreenCanvasRenderingContext2D {
  const context = canvas.getContext("2d", opts)
  if (context === null) throw new ContextError("Could not retrieve context")
  return context
}

class InternalQRCanvasHandler {
  #canvas: OffscreenCanvas | undefined

  /**
   * Get the current {@link OffscreenCanvas}, if set.
   *
   * @returns The {@link OffscreenCanvas} being handled.
   * @throws {@link InvalidStateError} if canvas has not been set with
   *   {@link InternalQRCanvasHandler.setCanvas}.
   * @protected
   */
  protected getCanvas(): OffscreenCanvas {
    if (this.#canvas === undefined) {
      throw new InvalidStateError("Canvas not initialized")
    }
    return this.#canvas
  }

  /**
   * Assigns an {@link OffscreenCanvas} to be handled. Should ideally be
   * transferred instead of copied.
   *
   * @param canvas - The {@link OffscreenCanvas} to handle.
   */
  setCanvas(canvas: OffscreenCanvas) {
    this.#canvas = canvas
  }

  /**
   * Export the QR code in the specified {@link ImageMimeType} as an
   * {@link ArrayBuffer}.
   *
   * @param format - The {@link ImageMimeType} to export as.
   * @param content - The text content to render. Required if the format is
   *   {@link ImageMimeType.svg}, unused otherwise.
   * @param encodeOpts - The options to use when rendering the content as SVG.
   *   Required if the format is {@link ImageMimeType.svg}, unused otherwise.
   * @returns A transferred {@link ArrayBuffer}.
   */
  async toFormat({
    format,
    content,
    encodeOpts,
  }: ToFormatParams): Promise<ArrayBuffer> {
    let blob: Blob
    switch (format) {
      case ImageMimeType.jpeg: {
        blob = await this.getCanvas().convertToBlob({
          type: format,
          quality: 95 / 100,
        })
        break
      }
      case ImageMimeType.png: {
        const canvas = this.getCanvas()
        const context = get2DContext(canvas, { willReadFrequently: true })

        blob = new Blob(
          [
            UPNG.encode(
              [
                context.getImageData(0, 0, canvas.width, canvas.height).data
                  .buffer as ArrayBuffer,
              ],
              canvas.width,
              canvas.height,
              256, // Minimum stated in UPNG's README
            ),
          ],
          { type: format },
        )
        break
      }
      case ImageMimeType.svg: {
        // Deliberately exclude scale since we want SVGs to be as optimized as possible.
        const { scale: _, ...opts } = convertOptions(encodeOpts)
        blob = new Blob(
          [encodeQR(content, "svg", { ...opts, optimize: true })],
          { type: format },
        )
        break
      }
      case ImageMimeType.webp: {
        blob = await this.getCanvas().convertToBlob({
          type: format,
          quality: 1,
        })
        break
      }
      default: {
        // Cast used to ensure all MIME types are accounted for above.
        throw new FormatError(
          `${format as undefined} is not a supported image MIME type`,
        )
      }
    }

    const buffer = await blob.arrayBuffer()
    return Comlink.transfer(buffer, [buffer])
  }

  /**
   * Draws the provided content as a QR code on the handled
   * {@link OffscreenCanvas}.
   *
   * @param content - The text content to render.
   * @param encodeOpts - The {@link EncodeOpts} to use while rendering the
   *   content.
   * @throws {@link BitmapError} if there's an issue with the generated QR
   *   code bitmap.
   */
  draw({
    content,
    encodeOpts = {},
  }: { content: string; encodeOpts: EncodeOpts }): void {
    // Transform the `border` boolean value into something that `encodeQR` expects.
    const opts = convertOptions(encodeOpts)

    const raw = encodeQR(content, "raw", opts)
    if (!raw[0]) throw new BitmapError("Zero-length encoded value")
    const width = raw[0].length
    const height = raw.length
    if (width !== height) {
      throw new BitmapError("Generated QR is not symmetrical")
    }

    const canvas = this.getCanvas()
    const context = get2DContext(canvas)

    // Initialize canvas.
    context.clearRect(0, 0, canvas.width, canvas.height)
    canvas.width = width
    canvas.height = height
    context.fillStyle = "#fff"
    context.fillRect(0, 0, width, height)

    // Create an RGBA array from the generated QR bitmap.
    const data = new Uint8ClampedArray(width * height * 4)
    let pos = 0
    // Use this `for` format for speed.
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // biome-ignore lint/style/noNonNullAssertion: Iterating through the array, so will never be undefined.
        const colorValue = raw[y]![x] ? 0 : 255
        data[pos++] = colorValue // R
        data[pos++] = colorValue // G
        data[pos++] = colorValue // B
        data[pos++] = 255 // A
      }
    }

    // Draw the image data onto the canvas.
    context.putImageData(new ImageData(data, width, height), 0, 0)
  }
}

class InvalidStateError extends Error {}
class FormatError extends Error {}
class BitmapError extends Error {}
class ContextError extends Error {}

Comlink.expose(new InternalQRCanvasHandler())

export type QRCanvasHandler = InternalQRCanvasHandler
