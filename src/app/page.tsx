"use client"

import ArrowTopRightOnSquareIcon from "@heroicons/react/16/solid/ArrowTopRightOnSquareIcon"
import ArrowDownTrayIcon from "@heroicons/react/24/solid/ArrowDownTrayIcon"
import ClipboardDocumentIcon from "@heroicons/react/24/solid/ClipboardDocumentIcon"
import CodeBracketIcon from "@heroicons/react/24/solid/CodeBracketIcon"
import QrCodeIcon from "@heroicons/react/24/solid/QrCodeIcon"
import UserIcon from "@heroicons/react/24/solid/UserIcon"
import type React from "react"
import { useEffect } from "react"
import { useCallback } from "react"
import { useRef } from "react"
import { useState } from "react"
import { DebounceInput } from "react-debounce-input"
import QRCode from "react-qr-code"
import type { Entries } from "type-fest"
import { Button } from "../components/button"
import { Divider } from "../components/divider"
import {
  Description,
  Field,
  FieldGroup,
  Fieldset,
  Label,
  Legend,
} from "../components/fieldset"
import { Heading, Subheading } from "../components/heading"
import { Input } from "../components/input"
import { Radio, RadioField, RadioGroup } from "../components/radio"
import { Switch, SwitchField } from "../components/switch"
import { Strong, Text } from "../components/text"

const BORDER_RATIO = 3 / 64

const FORMATS = new Map([
  ["image/png", { label: "PNG", notes: "Recommended" }],
  ["image/jpeg", { label: "JPEG", notes: "Copy button unavailable" }],
  ["image/svg+xml", { label: "SVG" }],
] as const) satisfies Map<
  string,
  { label: React.ReactNode; notes?: React.ReactNode }
>
type Format = Entries<typeof FORMATS>[1][0]

const SIZES = new Map([
  [128, { label: "128px" }],
  [256, { label: "256px", notes: "Default, same size as above" }],
  [512, { label: "512px" }],
  [1024, { label: "1024px" }],
] as const) satisfies Map<number, { label: string; notes?: React.ReactNode }>
type Size = Entries<typeof SIZES>[1][0]

function addQRCodeBorder(svg: SVGSVGElement): void {
  // Round up to avoid inadvertently rounding to zero.
  const borderSize = Math.ceil(svg.viewBox.baseVal.width * BORDER_RATIO)
  const newViewBoxSize = borderSize * 2 + svg.viewBox.baseVal.width
  svg.viewBox.baseVal.width = newViewBoxSize
  svg.viewBox.baseVal.height = newViewBoxSize

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
  const [text, setText] = useState<string>("")
  const [format, setFormat] = useState<Format>("image/png")
  const [size, setSize] = useState<Size>(256)
  const [addBorder, setAddBorder] = useState<boolean>(true)
  const [showCopied, setShowCopied] = useState<boolean>(false)

  const qrCode = useRef<SVGSVGElement>(null)

  // Reset `showCopied` after several seconds.
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
    if (!qrCode.current) throw new Error("Could not find QR code")
    // Clone the SVG, since we want to modify it if adding a border.
    const svg = qrCode.current.cloneNode(true) as SVGSVGElement

    // Add a border, if specified.
    if (addBorder) addQRCodeBorder(svg)

    // Serialize SVG and convert it to a data string.
    const serialized = new XMLSerializer().serializeToString(svg)
    const dataString = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`

    return { serialized, dataString }
  }, [addBorder])

  const copyQRCode = useCallback((): Promise<void> => {
    const { serialized, dataString } = serializeSVG()

    // Copy SVG to clipboard if selected.
    if (format === "image/svg+xml") {
      return navigator.clipboard.writeText(serialized)
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
    return navigator.clipboard
      .write([clipboardItem])
      .then(() => setShowCopied(true))
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
      <a href="#text-input" className="sr-only">
        Skip to QR code generator input
      </a>

      <div className="text-center sm:text-start sm:flex gap-2 items-start">
        <QrCodeIcon className="size-14 inline-block shrink-0" />
        <div>
          <Heading>QR code generator</Heading>
          <Text>
            Privately generate QR codes that don't depend on 3rd-party services.
          </Text>
        </div>
      </div>

      <form className="flex flex-col gap-[32px] w-full sm:max-w-[600px] row-start-2 items-center sm:items-start">
        <FieldGroup className="w-full">
          <Field className="w-full">
            <Label>QR code content</Label>
            <DebounceInput
              element={Input}
              placeholder="e.g. https://qr.micahyeager.com/"
              id="text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              debounceTimeout={300}
              forceNotifyOnBlur={true}
              forceNotifyByEnter={true}
            />
            <Description>
              The text to store in the QR code (e.g. a link). Shorter values are
              easier to scan.
            </Description>
          </Field>
        </FieldGroup>

        <div className="flex flex-col gap-1 sm:self-center items-center">
          <Text aria-hidden="true">Preview</Text>

          {text ? (
            <div className="p-3 bg-white rounded-md size-64">
              <QRCode
                className="h-full w-full"
                size={size}
                value={text}
                aria-label="QR code preview."
                // biome-ignore lint/suspicious/noExplicitAny: Cast is needed due to missing types.
                ref={qrCode as React.RefObject<any>}
              />
            </div>
          ) : (
            <Text className="flex justify-center items-center p-2 text-center border-zinc-950/10 dark:border-white/10 border-1 border-dashed rounded-md size-64">
              Enter text above to generate a preview.
            </Text>
          )}
        </div>

        <div className="flex flex-col w-full gap-2">
          <div className="text-center space-x-4 *:w-32">
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
        <Subheading>Options</Subheading>
        <Text>If in doubt, you can safely leave these options alone.</Text>
        <FieldGroup className="flex flex-col w-full sm:grid grid-cols-2">
          <div className="w-full space-y-8 sm:pe-8">
            <SwitchField>
              <Label>Include white border</Label>
              <Description>Recommended</Description>
              <Switch
                checked={addBorder}
                onChange={(value) => setAddBorder(value)}
              />
            </SwitchField>

            <Fieldset>
              <Legend>Format</Legend>
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
          </div>

          {format !== "image/svg+xml" && (
            <Fieldset className="sm:ps-8 sm:border-l border-zinc-950/10 dark:border-white/10">
              <Legend>Size</Legend>
              <RadioGroup
                value={`${size}`}
                onChange={(value) => setSize(Number(value) as Size)}
              >
                {Array.from(SIZES).map(([size, { label, notes }]) => (
                  <RadioField key={size}>
                    <Radio value={`${size}`} />
                    <Label>{label}</Label>
                    {notes && <Description>{notes}</Description>}
                  </RadioField>
                ))}
              </RadioGroup>
              <Text className="!mt-6">
                <Strong className="block">Need even larger?</Strong>
                Use the SVG format instead, then export it to the desired size
                with an app like{" "}
                <a
                  href="https://inkscape.org"
                  className="hover:underline hover:underline-offset-4"
                >
                  InkScape
                  <ArrowTopRightOnSquareIcon className="size-4 inline-block ms-1 mb-1" />
                </a>
                .
              </Text>
            </Fieldset>
          )}
        </FieldGroup>
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
    </main>
  )
}
