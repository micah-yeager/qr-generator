import ArrowsPointingOutIcon from "@heroicons/react/16/solid/ArrowsPointingOutIcon"
import type React from "react"
import { useEffect } from "react"
import { useRef } from "react"
import { useCallback } from "react"
import { useState } from "react"
import { Description, Field, Label } from "../../../components/fieldset"
import { Input, InputGroup } from "../../../components/input"
import { ImageMimeType } from "../../../config/mime-types.ts"
import { useQR } from "../../../contexts/qr.tsx"

type SizeOptionProps = Omit<
  React.ComponentPropsWithoutRef<typeof Field>,
  "children"
>

export function ScaleOption({ disabled, ...rest }: SizeOptionProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const { format, scale, setScale } = useQR()

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

  // Ensure current state is synced back to the input field.
  const syncState = useCallback(() => {
    setUserInput(String(scale))
  }, [scale])
  useEffect(() => {
    if (!inputRef.current || document.activeElement === inputRef.current) return
    syncState()
  }, [syncState])

  return (
    <Field {...rest} disabled={disabled || format === ImageMimeType.svg}>
      <Label>Scaling</Label>
      <Description>
        By default, QR codes are generated as small as possible — use this value
        to increase the final image size.
      </Description>
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
          onBlur={() => syncState()}
          ref={inputRef}
        />
      </InputGroup>
    </Field>
  )
}
