import type React from "react"
import { Description, Label } from "../../../components/fieldset"
import { Switch, SwitchField } from "../../../components/switch"
import { useQR } from "../../../contexts/qr.tsx"

type BorderOptionProps = Omit<
  React.ComponentPropsWithoutRef<typeof SwitchField>,
  "children"
>

export function BorderOption(props: BorderOptionProps) {
  const { border, setBorder } = useQR()

  return (
    <SwitchField {...props}>
      <Label>Include white border</Label>
      <Description>Recommended.</Description>
      <Switch checked={border} onChange={setBorder} />
    </SwitchField>
  )
}
