import type { Entries } from "type-fest"
import type { IMAGE_FORMATS } from "../config/image-formats"

/**
 * String representation of an image format type.
 *
 * @see {@link IMAGE_FORMATS}
 */
export type ImageFormat = Entries<typeof IMAGE_FORMATS>[1][0]
