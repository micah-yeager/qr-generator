import KeyIcon from "@heroicons/react/16/solid/KeyIcon"
import TagIcon from "@heroicons/react/16/solid/TagIcon"
import WifiIcon from "@heroicons/react/16/solid/WifiIcon"
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
import { Input, InputGroup } from "../../../components/input"
import { Switch, SwitchField } from "../../../components/switch"
import type { TemplateDialogProps, TemplateDropdownItemProps } from "./shared"

const WIFI_ESCAPE_TARGET_REGEX = /([:;])/g

function escapeWiFiComponent(value: string): string {
  return value.replace(WIFI_ESCAPE_TARGET_REGEX, "\\$1")
}

export function WifiDialog({
  open,
  onClose,
  setText,
  ...rest
}: TemplateDialogProps) {
  const [ssid, setSSID] = useState<string>("")
  const [hasPassword, setHasPassword] = useState<boolean>(true)
  const [usesWEP, setUsesWEP] = useState<boolean>(false)
  const [password, setPassword] = useState<string>("")
  const [isHidden, setIsHidden] = useState<boolean>(false)

  const generateValue = useCallback(() => {
    let value = `WIFI:S:${escapeWiFiComponent(ssid)};`

    // Security type
    if (!hasPassword) value += "T:nopass;"
    else if (usesWEP) value += "T:WEP;"
    else value += "T:WPA;"

    // Password
    if (hasPassword && password) {
      value += `P:${escapeWiFiComponent(password)};`
    }

    // Hidden
    value += `H:${isHidden};;`

    return value
  }, [ssid, hasPassword, usesWEP, password, isHidden])

  return (
    <Dialog {...rest} open={open} onClose={onClose}>
      <DialogTitle>
        <WifiIcon className="size-4 mb-1 me-2 inline-block align-middle" />
        WiFi template
      </DialogTitle>
      <DialogDescription>
        Generate a QR code value to prompt users to automatically join the given
        WiFi network.
      </DialogDescription>

      <DialogBody>
        <FieldGroup>
          <Field>
            <Label>Network name (SSID)</Label>
            <Description>The name of the network to connect to.</Description>
            <InputGroup>
              <TagIcon />
              <Input value={ssid} onChange={(e) => setSSID(e.target.value)} />
            </InputGroup>
          </Field>

          <SwitchField>
            <Label>Has password?</Label>
            <Description>
              Whether a password is normally used when connecting.
            </Description>
            <Switch checked={hasPassword} onChange={setHasPassword} />
          </SwitchField>

          <SwitchField disabled={!hasPassword}>
            <Label>Uses WEP encryption?</Label>
            <Description>
              Whether WEP encryption is used when connecting (rare and highly
              discouraged). If unsure, leave this disabled.
            </Description>
            <Switch checked={usesWEP} onChange={setUsesWEP} />
          </SwitchField>

          <Field disabled={!hasPassword}>
            <Label>Password</Label>
            <Description>The password to use when connecting.</Description>
            <InputGroup>
              <KeyIcon />
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </InputGroup>
          </Field>

          <SwitchField>
            <Label>Is hidden?</Label>
            <Description>
              Whether the network is hidden (rare and discouraged). If unsure,
              leave this disabled.
            </Description>
            <Switch checked={isHidden} onChange={setIsHidden} />
          </SwitchField>
        </FieldGroup>
      </DialogBody>

      <DialogActions>
        <Button plain onClick={() => onClose(false)}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            setText(generateValue())
            setSSID("")
            setHasPassword(true)
            setUsesWEP(false)
            setPassword("")
            setIsHidden(false)
            onClose(false)
          }}
          disabled={!ssid || (hasPassword && !password)}
        >
          Use
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export function WifiDropdownItem(props: TemplateDropdownItemProps) {
  return (
    <DropdownItem {...props}>
      <WifiIcon />
      <DropdownLabel>WiFi</DropdownLabel>
      <DropdownDescription>Join a WiFi network</DropdownDescription>
    </DropdownItem>
  )
}
