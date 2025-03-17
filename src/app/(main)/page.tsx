"use client"
import CodeBracketIcon from "@heroicons/react/24/solid/CodeBracketIcon"
import QrCodeIconLarge from "@heroicons/react/24/solid/QrCodeIcon"
import UserIcon from "@heroicons/react/24/solid/UserIcon"
import { Divider } from "../../components/divider"
import { FieldGroup, Fieldset, Legend } from "../../components/fieldset"
import { Heading } from "../../components/heading"
import { Text } from "../../components/text"
import { GlobalStoreProvider } from "../../stores/global-store"
import { BorderOption } from "./options/border"
import { FormatOption } from "./options/format"
import { SizeOption } from "./options/size"
import { QRContentInput } from "./qr-content/input"
import { QRContentPreview } from "./qr-content/preview"
import { QRContentSave } from "./qr-content/save"

export default function Home() {
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
        <GlobalStoreProvider>
          <QRContentInput className="w-full" />

          <div className="w-full flex flex-col gap-2 items-center">
            <QRContentPreview className="size-64 relative *:absolute *:size-64 *:rounded-md *:motion-safe:transition-all *:motion-safe:duration-300 *:motion-safe:ease-in-out" />
            <QRContentSave className="text-center space-x-2 *:w-31" />
          </div>

          <Divider />

          <Fieldset>
            <Legend>Options</Legend>
            <Text>If in doubt, you can safely leave these options alone.</Text>

            <FieldGroup className="sm:grid grid-cols-2 items-start sm:*:last:mb-0 sm:*:nth-last-2:mb-0 sm:*:odd:pe-8 sm:*:even:ps-8 sm:*:even:border-l sm:*:even:border-zinc-950/10 sm:*:even:dark:border-white/10">
              <BorderOption />
              <FormatOption className="row-span-3" />
              <SizeOption />
            </FieldGroup>
          </Fieldset>
        </GlobalStoreProvider>
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
