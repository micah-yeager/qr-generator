import type React from "react"
import {
  Description,
  Fieldset,
  Label,
  Legend,
} from "../../../components/fieldset"
import { Radio, RadioField, RadioGroup } from "../../../components/radio"
import { Text } from "../../../components/text"
import { IMAGE_FORMATS } from "../../../config/image-formats"
import { useGlobalStore } from "../../../stores/global-store"
import type { ImageFormat } from "../../../types/ImageFormat"

type FormatOptionProps = Omit<
  React.ComponentPropsWithoutRef<typeof Fieldset>,
  "children"
>

export function FormatOption(props: FormatOptionProps) {
  const { format, setFormat } = useGlobalStore()

  return (
    <Fieldset {...props}>
      <Legend>Format</Legend>
      <Text className="!mt-0">The image type to export.</Text>
      <RadioGroup
        value={format}
        onChange={(value) => setFormat(value as ImageFormat)}
      >
        {Array.from(IMAGE_FORMATS).map(([format, { label, notes }]) => (
          <RadioField key={format}>
            <Radio value={format} />
            <Label>{label}</Label>
            {notes && <Description>{notes}</Description>}
          </RadioField>
        ))}
      </RadioGroup>
    </Fieldset>
  )
}
