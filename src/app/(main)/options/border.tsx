import type React from "react"
import { Description, Label } from "../../../components/fieldset"
import { Switch, SwitchField } from "../../../components/switch"
import { useSettings } from "../../../contexts/settings.tsx"

type BorderOptionProps = Omit<
  React.ComponentPropsWithoutRef<typeof SwitchField>,
  "children"
>

export function BorderOption(props: BorderOptionProps) {
  const { border, setBorder } = useSettings()

  return (
    <SwitchField {...props}>
      <Label>Include white border</Label>
      <Description>Recommended.</Description>
      <Switch checked={border} onChange={setBorder} />
    </SwitchField>
  )
}
