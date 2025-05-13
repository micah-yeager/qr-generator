import { ECMode, type ErrorCorrection as QRErrorCorrection } from "qr"
import type React from "react"
import {
  Description,
  Fieldset,
  Label,
  Legend,
} from "../../../components/fieldset.tsx"
import { Radio, RadioField, RadioGroup } from "../../../components/radio.tsx"
import { Text } from "../../../components/text.tsx"
import { useSettings } from "../../../contexts/settings.tsx"

const ERROR_CORRECTION_MAP = new Map<
  QRErrorCorrection,
  { label: React.ReactNode; description: React.ReactNode }
>([
  ["low", { label: "Low", description: "7% of data can be restored." }],
  ["medium", { label: "Medium", description: "15% of data can be restored." }],
  [
    "quartile",
    { label: "Quartile", description: "25% of data can be restored." },
  ],
  ["high", { label: "High", description: "30% of data can be restored." }],
])

type ErrorCorrectionProps = Omit<
  React.ComponentPropsWithoutRef<typeof Fieldset>,
  "children"
>

export function ErrorCorrection(props: ErrorCorrectionProps) {
  const { errorCorrection, setErrorCorrection } = useSettings()

  return (
    <Fieldset {...props}>
      <Legend>Error correction</Legend>
      <Text>
        Higher levels allow for more parts of the QR code to be unscannable and
        still function — at the cost of increased size.
      </Text>
      <RadioGroup
        value={errorCorrection}
        onChange={(value) => setErrorCorrection(value as QRErrorCorrection)}
      >
        {ECMode.map((mode) => {
          // biome-ignore lint/style/noNonNullAssertion: Will never be undefined.
          const { label, description } = ERROR_CORRECTION_MAP.get(mode)!
          return (
            <RadioField key={mode}>
              <Radio value={mode} />
              <Label>{label}</Label>
              <Description>{description}</Description>
            </RadioField>
          )
        })}
      </RadioGroup>
    </Fieldset>
  )
}
