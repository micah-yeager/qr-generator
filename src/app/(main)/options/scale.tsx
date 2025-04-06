import ArrowsPointingOutIcon from "@heroicons/react/16/solid/ArrowsPointingOutIcon"
import type React from "react"
import { useCallback } from "react"
import { useEffect, useState } from "react"
import { useMemo } from "react"
import { Description, Field, Label } from "../../../components/fieldset"
import { Input, InputGroup } from "../../../components/input"
import { Strong } from "../../../components/text"
import { useGlobalStore } from "../../../stores/global-store"
import { calcSize } from "../../../utils/calcSize"

type SizeOptionProps = Omit<
  React.ComponentPropsWithoutRef<typeof Field>,
  "children"
>

export function ScaleOption({ disabled, ...rest }: SizeOptionProps) {
  const { border, format, scale, setScale, viewBoxSize } = useGlobalStore()

  const finalSizeString = useMemo(
    () =>
      (
        calcSize(viewBoxSize || 21, { border }).totalSize * scale
      ).toLocaleString(),
    [viewBoxSize, border, scale],
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
    <Field {...rest} disabled={disabled || format === "image/svg+xml"}>
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
