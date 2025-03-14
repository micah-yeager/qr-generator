import DevicePhoneMobileIcon from "@heroicons/react/16/solid/DevicePhoneMobileIcon"
import HashtagIcon from "@heroicons/react/16/solid/HashtagIcon"
import { useCallback, useState } from "react"
import { Button } from "../../../components/button"
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from "../../../components/dialog"
import {
  DropdownDescription,
  DropdownItem,
  DropdownLabel,
} from "../../../components/dropdown"
import {
  Description,
  Field,
  FieldGroup,
  Fieldset,
  Label,
  Legend,
} from "../../../components/fieldset"
import { Input, InputGroup } from "../../../components/input"
import { Radio, RadioField, RadioGroup } from "../../../components/radio"
import { Textarea } from "../../../components/textarea"
import {
  MESSAGE_NEWLINE_REGEX,
  type TemplateDialogProps,
  type TemplateDropdownItemProps,
} from "./shared"

type Method = "text" | "call"
const DEFAULT_METHOD = "text" satisfies Method

export function PhoneDialog({
  open,
  onClose,
  setText,
  ...rest
}: TemplateDialogProps) {
  const [method, setMethod] = useState<Method>(DEFAULT_METHOD)
  const [number, setNumber] = useState<string>("")
  const [body, setBody] = useState<string>("")

  const generateValue = useCallback(() => {
    // Method
    let value = method === "text" ? "sms" : "tel"
    // Number
    value += `:${encodeURIComponent(number)}`
    // Message
    if (method === "text" && body) {
      value += `?body=${encodeURIComponent(body.replace(MESSAGE_NEWLINE_REGEX, "\r\n"))}`
    }
    return value
  }, [number, method, body])

  return (
    <Dialog {...rest} open={open} onClose={onClose}>
      <DialogTitle>
        <DevicePhoneMobileIcon className="size-4 mb-1 me-2 inline-block align-middle" />
        Phone number template
      </DialogTitle>
      <DialogDescription>
        Generate a QR code value to prompt users to call or text a phone number.
      </DialogDescription>

      <DialogBody>
        <FieldGroup>
          <Field>
            <Label>Phone number</Label>
            <Description>
              Country code recommended but not required — e.g. "+1" for US and
              Canadian numbers.
            </Description>
            <InputGroup>
              <HashtagIcon />
              <Input
                required
                type="tel"
                placeholder="+1 555 555 5555"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
              />
            </InputGroup>
          </Field>

          <Fieldset>
            <Legend>Contact method</Legend>
            <RadioGroup
              value={method}
              onChange={(value) => setMethod(value as Method)}
            >
              <RadioField>
                <Radio value="text" />
                <Label>Text</Label>
              </RadioField>
              <RadioField>
                <Radio value="call" />
                <Label>Call</Label>
              </RadioField>
            </RadioGroup>
          </Fieldset>

          <Field disabled={method !== "text"}>
            <Label>Message</Label>
            <Description>
              The content to pre-fill the text message with.
            </Description>

            <Textarea value={body} onChange={(e) => setBody(e.target.value)} />
          </Field>
        </FieldGroup>
      </DialogBody>

      <DialogActions>
        <Button plain onClick={() => onClose(false)}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            setText(generateValue())
            setMethod(DEFAULT_METHOD)
            setNumber("")
            setBody("")
            onClose(false)
          }}
          disabled={!number}
        >
          Use
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export function PhoneDropdownItem(props: TemplateDropdownItemProps) {
  return (
    <DropdownItem {...props}>
      <DevicePhoneMobileIcon />
      <DropdownLabel>Phone number</DropdownLabel>
      <DropdownDescription>Call or text a phone number</DropdownDescription>
    </DropdownItem>
  )
}
