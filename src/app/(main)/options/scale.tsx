import ArrowsPointingOutIcon from "@heroicons/react/16/solid/ArrowsPointingOutIcon"
import type React from "react"
import { useCallback } from "react"
import { useState } from "react"
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
  const { size } = useQR()

  // Split user input from app value to allow clearing the field.
  const [userInput, setUserInput] = useState<string>(String(scale))
  const updateScale = useCallback(
    (value: string) => {
      // Sanitize input.
      const numValue = Number(value)
      const normalized = Number.isNaN(numValue) || numValue < 1 ? 1 : numValue

      setScale(normalized)
    },
    [setScale],
  )

  const syncInput = useCallback(() => {
    setUserInput(String(scale))
  }, [scale])

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
          value={userInput}
          onChange={(e) => {
            setUserInput(e.target.value)
            updateScale(e.target.value)
          }}
          onBlur={() => syncInput()}
        />
      </InputGroup>
      <Description>
        Final size: <Strong>{size} px</Strong>
      </Description>
    </Field>
  )
}
