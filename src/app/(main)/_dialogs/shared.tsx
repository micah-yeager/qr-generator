import type { ComponentPropsWithoutRef } from "react"
import type { Dialog } from "../../../components/dialog"
import type { DropdownItem } from "../../../components/dropdown"

export const MESSAGE_NEWLINE_REGEX = /(?<!\r)\n/g

export type TemplateDialogProps = Omit<
  ComponentPropsWithoutRef<typeof Dialog>,
  "children"
> & { setText: (text: string) => void }

export type TemplateDropdownItemProps = Omit<
  ComponentPropsWithoutRef<typeof DropdownItem>,
  "children"
>
