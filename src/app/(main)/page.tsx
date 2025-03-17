"use client"

import ArrowsPointingOutIcon from "@heroicons/react/16/solid/ArrowsPointingOutIcon"
import ExclamationTriangleIcon from "@heroicons/react/16/solid/ExclamationTriangleIcon"
import ArrowDownTrayIcon from "@heroicons/react/24/solid/ArrowDownTrayIcon"
import ChevronDownIcon from "@heroicons/react/24/solid/ChevronDownIcon"
import ClipboardDocumentIcon from "@heroicons/react/24/solid/ClipboardDocumentIcon"
import CodeBracketIcon from "@heroicons/react/24/solid/CodeBracketIcon"
import QrCodeIconLarge from "@heroicons/react/24/solid/QrCodeIcon"
import UserIcon from "@heroicons/react/24/solid/UserIcon"
import clsx from "clsx"
import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { DebounceInput } from "react-debounce-input"
import QRCode from "react-qr-code"
import type { Entries } from "type-fest"
import { Button } from "../../components/button"
import { Divider } from "../../components/divider"
import {
  Dropdown,
  DropdownButton,
  DropdownDescription,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from "../../components/dropdown"
import {
  Description,
  Field,
  FieldGroup,
  Fieldset,
  Label,
  Legend,
} from "../../components/fieldset"
import { Heading } from "../../components/heading"
import { Input, InputGroup } from "../../components/input"
import { Radio, RadioField, RadioGroup } from "../../components/radio"
import { Switch, SwitchField } from "../../components/switch"
import { Text } from "../../components/text"
import { Textarea } from "../../components/textarea"
import { useLocalStorage } from "../../hooks/useLocalStorage"
import { MailDialog, MailDropdownItem } from "./_dialogs/mail-dialog"
import { PhoneDialog, PhoneDropdownItem } from "./_dialogs/phone-dialog"
import { WifiDialog, WifiDropdownItem } from "./_dialogs/wifi-dialog"

const BORDER_RATIO = 3 / 64

/**
 * Number of cells in a QR code generated with a blank string.
 */
const DEFAULT_MIN_SIZE = 21

const FORMATS = new Map([
  ["image/png", { label: "PNG", notes: "Recommended" }],
  [
    "image/jpeg",
    {
      label: "JPEG",
      notes: (
        <>
          <ExclamationTriangleIcon className="inline-block mb-0.5 me-0.5 size-4 text-yellow-600 dark:text-yellow-500" />{" "}
          Copy button will be unavailable
        </>
      ),
    },
  ],
  ["image/svg+xml", { label: "SVG" }],
] as const) satisfies Map<
  string,
  { label: React.ReactNode; notes?: React.ReactNode }
>
type Format = Entries<typeof FORMATS>[1][0]

function calcQRCodeSizeWithBorder(viewBoxSize: number) {
  const borderSize = Math.ceil(viewBoxSize * BORDER_RATIO)
  const totalSize = borderSize * 2 + viewBoxSize

  return { borderSize, totalSize }
}

function addQRCodeBorder(svg: SVGSVGElement): void {
  // Round up to avoid inadvertently rounding to zero.
  const { borderSize, totalSize } = calcQRCodeSizeWithBorder(
    svg.viewBox.baseVal.width,
  )
  svg.viewBox.baseVal.width = totalSize
  svg.viewBox.baseVal.height = totalSize

  // Translate all path children.
  const transform = svg.createSVGTransform()
  transform.setTranslate(borderSize, borderSize)
  for (const child of svg.children) {
    if (child.tagName !== "path") continue
    const child_ = child as SVGPathElement
    child_.transform.baseVal.appendItem(transform)
  }

  // Add white background for visibility.
  const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect")
  // `2` represents percentages.
  bg.width.baseVal.newValueSpecifiedUnits(2, 100)
  bg.height.baseVal.newValueSpecifiedUnits(2, 100)
  bg.style.fill = "#ffffff"
  svg.prepend(bg)
}

function saveFile(dataString: string): void {
  const downloadLink = document.createElement("a")
  document.body.appendChild(downloadLink)

  downloadLink.href = dataString
  downloadLink.target = "_self"
  downloadLink.download = "QR code"
  downloadLink.click()

  downloadLink.remove()
}

export default function Home() {
  // Stored states.
  const [format, setFormat] = useLocalStorage<Format>("format", "image/png")
  const [size, setSize] = useLocalStorage<number>("size", 256)
  const [border, setBorder] = useLocalStorage<boolean>("border", true)

  // Transient states.
  const [text, setText] = useState<string>("")
  const [prevText, setPrevText] = useState<string>("")
  const [showCopied, setShowCopied] = useState<boolean>(false)
  const [sizeInput, setSizeInput] = useState<string>(String(size))
  const [minSize, setMinSize] = useState<number>(DEFAULT_MIN_SIZE)

  // Dialog states
  const [mailDialogOpen, setMailDialogOpen] = useState<boolean>(false)
  const [phoneDialogOpen, setPhoneDialogOpen] = useState<boolean>(false)
  const [wifiDialogOpen, setWifiDialogOpen] = useState<boolean>(false)

  const qrCodeRef = useRef<SVGSVGElement>(null)

  // Update minimum size when text value changes, since we can't use QRCode's
  // view box as a dependency.
  useEffect(() => {
    const qrCodeSize =
      text && qrCodeRef.current
        ? qrCodeRef.current.viewBox.baseVal.width
        : DEFAULT_MIN_SIZE
    const newMinSize = border
      ? calcQRCodeSizeWithBorder(qrCodeSize).totalSize
      : qrCodeSize

    if (newMinSize !== minSize) {
      setMinSize(newMinSize)
      if (size < newMinSize) {
        setSize(newMinSize)
        setSizeInput(String(newMinSize))
      }
    }
  }, [text, minSize, size, setSize, border])

  // Reset `showCopied` after being enabled.
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!showCopied) return
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setShowCopied(false), 3_000)
  }, [showCopied])

  const canvasQRCode = useCallback(
    async (dataString: string): Promise<HTMLCanvasElement> => {
      // Load the data string into an img element.
      const svgImg = document.createElement("img")
      await new Promise<void>((resolve, reject) => {
        svgImg.onload = () => resolve()
        svgImg.onerror = reject
        svgImg.src = dataString
      })

      // Import the img into a canvas, then export with the desired format and size.
      const canvas = document.createElement("canvas")
      canvas.width = size
      canvas.height = size
      // biome-ignore lint/style/noNonNullAssertion: we can safely assume this will be non-null
      canvas.getContext("2d")!.drawImage(svgImg, 0, 0, size, size)

      return canvas
    },
    [size],
  )

  const serializeSVG = useCallback((): {
    serialized: string
    dataString: string
  } => {
    if (!qrCodeRef.current) throw new Error("Could not find QR code")
    // Clone the SVG, since we want to modify it if adding a border.
    const svg = qrCodeRef.current.cloneNode(true) as SVGSVGElement

    // Add a border, if specified.
    if (border) addQRCodeBorder(svg)

    // Serialize SVG and convert it to a data string.
    const serialized = new XMLSerializer().serializeToString(svg)
    const dataString = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`

    return { serialized, dataString }
  }, [border])

  // This function cannot be async due to restrictions within Safari.
  const copyQRCode = useCallback((): void => {
    const { serialized, dataString } = serializeSVG()

    // Copy SVG to clipboard if selected.
    if (format === "image/svg+xml") {
      navigator.clipboard.writeText(serialized).catch(console.error)
      return
    }

    // Copy rasterized image blob to clipboard.
    const clipboardItem = new ClipboardItem({
      // Need to use a promise to properly support Safari.
      [format]: canvasQRCode(dataString).then(
        (canvas) =>
          // `toBlob` callback seems to be async, so we need to wrap it in a promise.
          new Promise<Blob>((resolve, reject) =>
            canvas.toBlob((blob) => (blob === null ? reject() : resolve(blob))),
          ),
      ),
    })
    navigator.clipboard
      .write([clipboardItem])
      .then(() => setShowCopied(true))
      .catch(console.error)
  }, [format, serializeSVG, canvasQRCode])

  const downloadQRCode = useCallback(async () => {
    const { dataString } = serializeSVG()

    // Download as SVG if selected.
    if (format === "image/svg+xml") return saveFile(dataString)
    // Load the data string into a canvas for rasterization.
    const canvas = await canvasQRCode(dataString)
    saveFile(canvas.toDataURL(format, 1.0))
  }, [format, serializeSVG, canvasQRCode])

  return (
    <main className="flex flex-col items-center justify-items-center min-h-screen p-8 px-4 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <a href="#input" className="sr-only">
        Skip to QR code generator input
      </a>

      <div className="text-center sm:text-start sm:flex gap-2 items-start">
        <QrCodeIconLarge className="size-14 inline-block shrink-0" />
        <div>
          <Heading>QR code generator</Heading>
          <Text>
            Privately generate QR codes that don't depend on 3rd-party services.
          </Text>
        </div>
      </div>

      <form
        id="input"
        className="flex flex-col gap-[32px] w-full sm:max-w-[600px] row-start-2 items-center sm:items-start"
      >
        <FieldGroup className="w-full">
          <Field>
            <Label>QR code content</Label>
            <Description>The text used to generate the QR code.</Description>
            <div className="flex flex-col justify-stretch sm:flex-row items-start gap-2">
              <DebounceInput
                // @ts-expect-error: Weird type requirements from `DebounceInput`.
                element={Textarea}
                rows={1}
                placeholder="e.g. https://qr.micahyeager.com/"
                value={text}
                onChange={(e) => {
                  // Ensure duplicate events don't inadvertently overwrite the previous value.
                  if (text !== prevText) setPrevText(text)
                  setText(e.target.value)
                }}
                debounceTimeout={100}
                forceNotifyOnBlur={true}
                forceNotifyByEnter={true}
              />
              <Dropdown>
                <DropdownButton
                  outline={true}
                  className="shrink-0 w-full sm:w-auto grow-0"
                >
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

        <div className="w-full flex flex-col gap-2 items-center">
          <div className="size-64 relative *:absolute *:size-64 *:rounded-md *:motion-safe:transition-all *:motion-safe:duration-300 *:motion-safe:ease-in-out">
            <div
              className={clsx(
                "p-3 bg-white select-none starting:opacity-0",
                text ? "opacity-100 scale-100" : "opacity-0 scale-95",
              )}
            >
              <QRCode
                className="h-full w-full"
                size={size}
                // Fall back to previous value if current value is "". This prevents changes as it's fading out, which looks odd.
                value={text || prevText}
                aria-label="QR code preview."
                // biome-ignore lint/suspicious/noExplicitAny: Cast is needed due to missing types.
                ref={qrCodeRef as React.RefObject<any>}
              />
            </div>

            <Text
              className={clsx(
                "flex justify-center items-center p-10 text-center border-zinc-950/10 dark:border-white/10 border-1 border-dashed",
                text ? "opacity-0 scale-95" : "opacity-100 scale-100",
              )}
            >
              Enter text above to generate the QR code.
            </Text>
          </div>

          <div className="text-center space-x-2 *:w-31">
            <Button
              type="button"
              className="self-center"
              disabled={!text || format === "image/jpeg"}
              onClick={() => copyQRCode()}
            >
              <ClipboardDocumentIcon />
              {showCopied ? "Copied!" : "Copy"}
            </Button>

            <Button
              type="button"
              className="self-center"
              disabled={!text}
              onClick={() => downloadQRCode()}
            >
              <ArrowDownTrayIcon />
              Download
            </Button>
          </div>
        </div>

        <Divider />

        <Fieldset>
          <Legend>Options</Legend>
          <Text>If in doubt, you can safely leave these options alone.</Text>
          <FieldGroup className="sm:grid grid-cols-2 items-start sm:*:last:mb-0 sm:*:nth-last-2:mb-0 sm:*:odd:pe-8 sm:*:even:ps-8 sm:*:even:border-l sm:*:even:border-zinc-950/10 sm:*:even:dark:border-white/10">
            <SwitchField>
              <Label>Include white border</Label>
              <Description>Recommended</Description>
              <Switch checked={border} onChange={(value) => setBorder(value)} />
            </SwitchField>

            <Fieldset className="row-span-3">
              <Legend>Format</Legend>
              <Text className="!mt-0">The image type to export.</Text>
              <RadioGroup
                value={format}
                onChange={(value) => setFormat(value as Format)}
              >
                {Array.from(FORMATS).map(([format, { label, notes }]) => (
                  <RadioField key={format}>
                    <Radio value={format} />
                    <Label>{label}</Label>
                    {notes && <Description>{notes}</Description>}
                  </RadioField>
                ))}
              </RadioGroup>
            </Fieldset>

            <Field>
              <Label>Size</Label>
              <Description>Width and height, in pixels.</Description>
              <div className="flex gap-2">
                <InputGroup>
                  <ArrowsPointingOutIcon />
                  <Input
                    id="text-input"
                    inputClassName="!pe-9"
                    type="number"
                    min={minSize}
                    value={sizeInput}
                    onChange={(e) => {
                      setSizeInput(e.target.value)
                      // Split the actual value into a separate state, so users can clear the field if needed.
                      const value = Number(e.target.value)
                      setSize(
                        Number.isNaN(value) || value < minSize
                          ? minSize
                          : value,
                      )
                    }}
                    onBlur={(e) => {
                      const value = Number(e.target.value)
                      if (Number.isNaN(value) || value < minSize) {
                        setSize(minSize)
                        setSizeInput(String(minSize))
                      }
                    }}
                    disabled={format === "image/svg+xml"}
                  />
                  <Text className="absolute right-3 pointer-events-none select-none top-1/2 -translate-y-1/2">
                    px
                  </Text>
                </InputGroup>
                <Dropdown>
                  <DropdownButton
                    outline={true}
                    className="shrink-0 grow-0"
                    disabled={format === "image/svg+xml"}
                  >
                    Presets
                    <ChevronDownIcon />
                  </DropdownButton>
                  <DropdownMenu>
                    <DropdownItem onClick={() => setSize(128)}>
                      <DropdownLabel>128px</DropdownLabel>
                    </DropdownItem>
                    <DropdownItem onClick={() => setSize(256)}>
                      <DropdownLabel>256px</DropdownLabel>
                      <DropdownDescription>
                        Default, same as above
                      </DropdownDescription>
                    </DropdownItem>
                    <DropdownItem onClick={() => setSize(512)}>
                      <DropdownLabel>512px</DropdownLabel>
                    </DropdownItem>
                    <DropdownItem onClick={() => setSize(1024)}>
                      <DropdownLabel>1024px</DropdownLabel>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </Field>
          </FieldGroup>
        </Fieldset>
      </form>

      <footer className="space-y-4">
        <div className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://micahyeager.com/"
          >
            <UserIcon className="size-4" aria-label="Author: " />
            Micah Yeager
          </a>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://github.com/micah-yeager/qr-generator"
          >
            <CodeBracketIcon className="size-4" aria-label="Source code: " />
            GitHub
          </a>
        </div>
        <Text className="text-center">
          All QR codes are generated locally on your device — in other words, no
          data that you enter is sent to any server.
        </Text>
      </footer>

      <MailDialog
        open={mailDialogOpen}
        onClose={setMailDialogOpen}
        setText={setText}
      />
      <PhoneDialog
        open={phoneDialogOpen}
        onClose={setPhoneDialogOpen}
        setText={setText}
      />
      <WifiDialog
        open={wifiDialogOpen}
        onClose={setWifiDialogOpen}
        setText={setText}
      />
    </main>
  )
}
