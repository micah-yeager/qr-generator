import ArrowsPointingOutIcon from "@heroicons/react/16/solid/ArrowsPointingOutIcon"
import ChevronDownIcon from "@heroicons/react/24/solid/ChevronDownIcon"
import type React from "react"
import { useCallback, useEffect, useState } from "react"
import {
  Dropdown,
  DropdownButton,
  DropdownDescription,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from "../../../components/dropdown"
import { Description, Field, Label } from "../../../components/fieldset"
import { Input, InputGroup } from "../../../components/input"
import { Text } from "../../../components/text"
import { useGlobalStore } from "../../../stores/global-store"
import { calcSizeWithBorder } from "../../../utils/calcSizeWithBorder"

type SizeOptionProps = Omit<
  React.ComponentPropsWithoutRef<typeof Field>,
  "children"
>

/**
 * Number of cells in a QR code generated with a blank string.
 */
const DEFAULT_MIN_SIZE = 21

export function SizeOption(props: SizeOptionProps) {
  const { qrCodeRef, content, border, format, size, setSize } = useGlobalStore()

  /*
   Calculate minimum export size of QR code to avoid potential data loss.

   Since we can't directly access the QR code's view box value, we need to use
   `useEffect` instead of `useMemo` to ensure that the QR code component can
   calculate and render the new value before attempting to retrieve it with
   `qrCodeRef.current`.
  */
  const [minSize, setMinSize] = useState<number>(DEFAULT_MIN_SIZE)
  useEffect(() => {
    const qrCodeSize =
      content && qrCodeRef.current
        ? qrCodeRef.current.viewBox.baseVal.width
        : DEFAULT_MIN_SIZE
    const newMinSize = border
      ? calcSizeWithBorder(qrCodeSize).totalSize
      : qrCodeSize

    if (minSize !== newMinSize) setMinSize(newMinSize)
  }, [minSize, content, border, qrCodeRef.current])
  // Ensure minimum size always takes precedence over minimum size.
  useEffect(() => {
    if (size < minSize) setSize(minSize)
  }, [minSize, size, setSize])

  // Split user input from app value to allow clearing the field.
  const [userInput, setUserInput] = useState<string>(String(size))
  // Update user input if `size` changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: Only fire if `size` changes.
  useEffect(() => {
    const newValue = String(size)
    if (newValue === userInput) return
    setUserInput(newValue)
  }, [size])

  const setNormalizedSize = useCallback(
    (value: string) => {
      const numValue = Number(value)
      const normalized =
        Number.isNaN(numValue) || numValue < minSize ? minSize : numValue

      setSize(normalized)
      setUserInput(String(normalized))
    },
    [minSize, setSize],
  )

  return (
    <Field {...props}>
      <Label>Size</Label>
      <Description>Width and height, in pixels.</Description>
      <div className="flex gap-2">
        <InputGroup>
          <ArrowsPointingOutIcon />
          <Input
            id="text-input"
            inputClassName="!pe-9"
            type="number"
            min={minSize}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onBlur={(e) => setNormalizedSize(e.target.value)}
            disabled={format === "image/svg+xml"}
          />
          <Text className="absolute right-3 pointer-events-none select-none top-1/2 -translate-y-1/2">
            px
          </Text>
        </InputGroup>

        <Dropdown>
          <DropdownButton
            outline={true}
            className="shrink-0 grow-0"
            disabled={format === "image/svg+xml"}
          >
            Presets
            <ChevronDownIcon />
          </DropdownButton>
          <DropdownMenu>
            <DropdownItem onClick={() => setSize(128)}>
              <DropdownLabel>128px</DropdownLabel>
            </DropdownItem>
            <DropdownItem onClick={() => setSize(256)}>
              <DropdownLabel>256px</DropdownLabel>
              <DropdownDescription>Default, same as above</DropdownDescription>
            </DropdownItem>
            <DropdownItem onClick={() => setSize(512)}>
              <DropdownLabel>512px</DropdownLabel>
            </DropdownItem>
            <DropdownItem onClick={() => setSize(1024)}>
              <DropdownLabel>1024px</DropdownLabel>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </Field>
  )
}
