import BoltIcon from "@heroicons/react/16/solid/BoltIcon"
import ChevronDownIcon from "@heroicons/react/24/solid/ChevronDownIcon"
import type React from "react"
import { useState } from "react"
import { DebounceInput } from "react-debounce-input"
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from "../../../components/dropdown"
import {
  Description,
  Field,
  FieldGroup,
  Label,
} from "../../../components/fieldset"
import { Textarea } from "../../../components/textarea"
import { useQR } from "../../../contexts/qr.tsx"
import { Mail, MailDropdownItem } from "../templates/mail"
import { Phone, PhoneDropdownItem } from "../templates/phone"
import { Wifi, WifiDropdownItem } from "../templates/wifi"

type QRContentInputProps = Omit<
  React.ComponentPropsWithoutRef<typeof FieldGroup>,
  "children"
>

export function QRContentInput(props: QRContentInputProps) {
  const { content, setContent } = useQR()

  // Dialog states
  const [mailDialogOpen, setMailDialogOpen] = useState<boolean>(false)
  const [phoneDialogOpen, setPhoneDialogOpen] = useState<boolean>(false)
  const [wifiDialogOpen, setWifiDialogOpen] = useState<boolean>(false)

  return (
    <>
      <FieldGroup {...props}>
        <Field>
          <Label>QR code content</Label>
          <Description>The text used to generate the QR code.</Description>
          <div className="flex flex-col justify-stretch sm:flex-row items-start gap-2">
            <DebounceInput
              // @ts-expect-error: Weird type requirements from `DebounceInput`.
              element={Textarea}
              rows={1}
              placeholder="e.g. https://qr.micahyeager.com/"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              debounceTimeout={100}
              forceNotifyOnBlur={true}
              forceNotifyByEnter={true}
            />
            <Dropdown>
              <DropdownButton
                outline={true}
                className="shrink-0 w-full sm:w-auto grow-0"
              >
                <BoltIcon />
                Templates
                <ChevronDownIcon />
              </DropdownButton>
              <DropdownMenu>
                <MailDropdownItem onClick={() => setMailDialogOpen(true)} />
                <PhoneDropdownItem onClick={() => setPhoneDialogOpen(true)} />
                <WifiDropdownItem onClick={() => setWifiDialogOpen(true)} />
              </DropdownMenu>
            </Dropdown>
          </div>
        </Field>
      </FieldGroup>

      <Mail
        open={mailDialogOpen}
        onClose={setMailDialogOpen}
        setText={setContent}
      />
      <Phone
        open={phoneDialogOpen}
        onClose={setPhoneDialogOpen}
        setText={setContent}
      />
      <Wifi
        open={wifiDialogOpen}
        onClose={setWifiDialogOpen}
        setText={setContent}
      />
    </>
  )
}
