import ArrowsPointingOutIcon from "@heroicons/react/16/solid/ArrowsPointingOutIcon"
import type React from "react"
import { useCallback } from "react"
import { useEffect, useState } from "react"
import { useMemo } from "react"
import { Description, Field, Label } from "../../../components/fieldset"
import { Input, InputGroup } from "../../../components/input"
import { Strong } from "../../../components/text"
import { ImageMimeType } from "../../../config/mime-types.ts"
import { useQR } from "../../../contexts/qr.tsx"
import { useSettings } from "../../../contexts/settings.tsx"

type SizeOptionProps = Omit<
  React.ComponentPropsWithoutRef<typeof Field>,
  "children"
>

export function ScaleOption({ disabled, ...rest }: SizeOptionProps) {
  const { format, scale, setScale } = useSettings()
  const { canvasRef } = useQR()

  const finalSizeString = useMemo(
    () => (canvasRef.current?.width ?? 21 * scale).toLocaleString(),
    [canvasRef.current, scale],
  )

  // Split user input from app value to allow clearing the field.
  const [userInput, setUserInput] = useState<string>(String(scale))
  // Update user input if `size` changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: Only fire if `scale` changes.
  useEffect(() => {
    const newValue = String(scale)
    if (newValue !== userInput) setUserInput(newValue)
  }, [scale])

  const setNormalizedSize = useCallback(
    (value: string) => {
      const numValue = Number(value)
      const normalized = Number.isNaN(numValue) || numValue < 1 ? 1 : numValue

      setScale(normalized)
      setUserInput(String(normalized))
    },
    [setScale],
  )

  return (
    <Field {...rest} disabled={disabled || format === ImageMimeType.svg}>
      <Label>Scale factor</Label>
      <Description>Size scaling for export.</Description>
      <InputGroup>
        <ArrowsPointingOutIcon />
        <Input
          id="text-input"
          type="number"
          min={1}
          value={scale}
          onChange={(e) => setUserInput(e.target.value)}
          onBlur={(e) => setNormalizedSize(e.target.value)}
        />
      </InputGroup>
      <Description>
        Final size: <Strong>{finalSizeString} px</Strong>
      </Description>
    </Field>
  )
}
