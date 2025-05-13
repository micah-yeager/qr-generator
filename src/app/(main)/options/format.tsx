import type React from "react"
import {
  Description,
  Fieldset,
  Label,
  Legend,
} from "../../../components/fieldset"
import { Radio, RadioField, RadioGroup } from "../../../components/radio"
import { Text } from "../../../components/text"
import {
  ImageMimeType,
  MIME_TYPE_LABEL_MAP,
} from "../../../config/mime-types.ts"
import { useQR } from "../../../contexts/qr.tsx"
import { useSettings } from "../../../contexts/settings.tsx"

const FORMAT_STATIC_DETAILS_MAP = new Map<ImageMimeType, React.ReactNode>([
  [ImageMimeType.jpeg, "Not recommended."],
  [ImageMimeType.png, "Recommended."],
])

type FormatOptionProps = Omit<
  React.ComponentPropsWithoutRef<typeof Fieldset>,
  "children"
>

export function FormatOption(props: FormatOptionProps) {
  const { format, setFormat } = useSettings()
  const { exportableFormats } = useQR()

  return (
    <Fieldset {...props}>
      <Legend>Format</Legend>
      <Text className="!mt-0">The image type to export.</Text>
      <RadioGroup
        value={format}
        onChange={(value) => setFormat(value as ImageMimeType)}
      >
        {Object.values(ImageMimeType).map((format) => {
          const formatAvailable = exportableFormats[format]
          const recommendation = FORMAT_STATIC_DETAILS_MAP.get(format)

          return (
            <RadioField key={format} disabled={!formatAvailable}>
              <Radio value={format} />
              <Label>{MIME_TYPE_LABEL_MAP.get(format)}</Label>
              {(recommendation || !formatAvailable) && (
                <Description>
                  {recommendation}{" "}
                  {!formatAvailable && "Not available in this browser."}
                </Description>
              )}
            </RadioField>
          )
        })}
      </RadioGroup>
    </Fieldset>
  )
}
