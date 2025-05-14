import ArrowPathIcon from "@heroicons/react/16/solid/ArrowPathIcon"
import clsx from "clsx"
import type React from "react"
import type { ComponentPropsWithoutRef } from "react"
import { Button } from "../../../components/button.tsx"
import { FieldGroup, Fieldset } from "../../../components/fieldset.tsx"
import { Subheading } from "../../../components/heading.tsx"
import { Text } from "../../../components/text.tsx"
import { useSettings } from "../../../contexts/settings.tsx"
import { BorderOption } from "./border.tsx"
import { ErrorCorrection } from "./error-correction.tsx"
import { FormatOption } from "./format.tsx"
import { ScaleOption } from "./scale.tsx"

export function QROptions(props: ComponentPropsWithoutRef<typeof Fieldset>) {
  const { resetToDefaults } = useSettings()

  return (
    <Fieldset {...props}>
      <div className="relative flex justify-between items-center">
        <Subheading>Options</Subheading>
        <Button outline={true} onClick={() => resetToDefaults()}>
          <ArrowPathIcon />
          Reset to defaults
        </Button>
      </div>
      <Text>If in doubt, you can safely leave these options alone.</Text>

      <FieldGroup className="grid gap-y-8 grid-cols-1 sm:grid-cols-2 items-start">
        <ColumnWrapper>
          <BorderOption className="order-1" />
          <ErrorCorrection className="order-4" />
        </ColumnWrapper>
        <ColumnWrapper>
          <FormatOption className="order-3" />
          <ScaleOption className="order-2" />
        </ColumnWrapper>
      </FieldGroup>
    </Fieldset>
  )
}

/**
 * Allows for more flexible "rows" in `grid` displays on desktop, while passing
 * layout control to the parent on mobile.
 */
function ColumnWrapper({
  className,
  children,
  ...rest
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      {...rest}
      className={clsx(
        className,
        "contents sm:block sm:space-y-8 sm:odd:pe-8 sm:even:ps-8 sm:even:border-l sm:even:border-zinc-950/10 sm:even:dark:border-white/10",
      )}
    >
      {children}
    </div>
  )
}
