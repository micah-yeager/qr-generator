import type { ComponentPropsWithoutRef } from "react"
import { Button } from "../../../components/button.tsx"
import { FieldGroup, Fieldset } from "../../../components/fieldset.tsx"
import { Subheading } from "../../../components/heading.tsx"
import { Text } from "../../../components/text.tsx"
import { useSettings } from "../../../contexts/settings.tsx"
import { BorderOption } from "./border.tsx"
import { FormatOption } from "./format.tsx"
import { ScaleOption } from "./scale.tsx"

export function QROptions(props: ComponentPropsWithoutRef<typeof Fieldset>) {
  const { resetToDefaults } = useSettings()

  return (
    <Fieldset {...props}>
      <div className="relative flex justify-between items-center">
        <Subheading>Options</Subheading>
        <Button outline={true} onClick={() => resetToDefaults()}>
          Reset to defaults
        </Button>
      </div>
      <Text>If in doubt, you can safely leave these options alone.</Text>

      <FieldGroup className="sm:grid grid-cols-2 items-start sm:*:last:mb-0 sm:*:nth-last-2:mb-0 sm:*:odd:pe-8 sm:*:even:ps-8 sm:*:even:border-l sm:*:even:border-zinc-950/10 sm:*:even:dark:border-white/10">
        <BorderOption />
        <FormatOption className="row-span-3" />
        <ScaleOption />
      </FieldGroup>
    </Fieldset>
  )
}
