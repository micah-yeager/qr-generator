import AtSymbolIcon from "@heroicons/react/16/solid/AtSymbolIcon"
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
  Label,
} from "../../../components/fieldset"
import { Input } from "../../../components/input"
import { Textarea } from "../../../components/textarea"
import {
  MESSAGE_NEWLINE_REGEX,
  type TemplateDialogProps,
  type TemplateDropdownItemProps,
} from "./shared"

export function Mail({ open, onClose, setText, ...rest }: TemplateDialogProps) {
  const [to, setTo] = useState<string[]>([])
  const [cc, setCC] = useState<string[]>([])
  const [bcc, setBCC] = useState<string[]>([])
  const [subject, setSubject] = useState<string>("")
  const [body, setBody] = useState<string>("")

  const generateValue = useCallback(() => {
    let value = "mailto:"
    value += to.filter(Boolean).map(encodeURIComponent).join(",")
    const params = new URLSearchParams()

    // Recipients
    const ccString = cc.filter(Boolean).join(",")
    if (ccString) params.append("cc", ccString)
    const bccString = bcc.filter(Boolean).join(",")
    if (bccString) params.append("bcc", bccString)

    // Content
    if (subject) params.append("subject", subject)
    if (body) params.append("body", body.replace(MESSAGE_NEWLINE_REGEX, "\r\n"))

    const paramsString = params.toString()
    if (paramsString) value += `?${paramsString}`
    return value
  }, [to, cc, bcc, subject, body])

  return (
    <Dialog {...rest} open={open} onClose={onClose}>
      <DialogTitle>
        <AtSymbolIcon className="size-4 mb-1 me-2 inline-block align-middle" />
        Email template
      </DialogTitle>
      <DialogDescription>
        Generate a QR code value to prompt users to start a new email message
        with the given info already filled out.
      </DialogDescription>

      <DialogBody>
        <FieldGroup>
          <Field>
            <Label>"To" recipients</Label>
            <Description>
              One email per line. If left blank, the generated QR code may not
              work on some platforms.
            </Description>
            <Textarea
              value={to.join("\n")}
              onChange={(e) => setTo(e.target.value.split("\n"))}
            />
          </Field>

          <Field>
            <Label>"CC" recipients</Label>
            <Description>One email per line.</Description>
            <Textarea
              value={cc.join("\n")}
              onChange={(e) => setCC(e.target.value.split("\n"))}
            />
          </Field>

          <Field>
            <Label>"BCC" recipients</Label>
            <Description>One email per line.</Description>
            <Textarea
              value={bcc.join("\n")}
              onChange={(e) => setBCC(e.target.value.split("\n"))}
            />
          </Field>

          <Field>
            <Label>Subject</Label>
            <Description>
              The subject to pre-fill the email message with.
            </Description>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </Field>

          <Field>
            <Label>Message</Label>
            <Description>
              The content to pre-fill the email message with.
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
            setTo([])
            setCC([])
            setBCC([])
            setSubject("")
            setBody("")
            onClose(false)
          }}
          disabled={
            to.length === 0 &&
            cc.length === 0 &&
            bcc.length === 0 &&
            !subject &&
            !body
          }
        >
          Use
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export function MailDropdownItem(props: TemplateDropdownItemProps) {
  return (
    <DropdownItem {...props}>
      <AtSymbolIcon />
      <DropdownLabel>Email</DropdownLabel>
      <DropdownDescription>Pre-fill a new email message</DropdownDescription>
    </DropdownItem>
  )
}
