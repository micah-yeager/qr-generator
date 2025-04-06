const BORDER_RATIO = 3 / 64

type CalcSizeWithBorder = {
  /**
   * Size of the QR code's border.
   */
  borderWidth: number
  /**
   * Final size of the QR code, after adding the border.
   */
  totalSize: number
}

/**
 * Gets the border width and total size from the given view box size.
 *
 * @param viewBoxSize - The view box size to base calculations off of.
 * @param options - The options to use when calculating.
 * @returns {@link CalcSizeWithBorder}
 */
export function calcSize(
  viewBoxSize: number,
  options: { border?: boolean } = {},
): CalcSizeWithBorder {
  options.border ??= true

  if (!options.border) return { borderWidth: 0, totalSize: viewBoxSize }

  const borderSize = Math.ceil(viewBoxSize * BORDER_RATIO)
  const totalSize = borderSize * 2 + viewBoxSize

  return { borderWidth: borderSize, totalSize }
}
