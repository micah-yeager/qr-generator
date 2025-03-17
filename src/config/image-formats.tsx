import ExclamationTriangleIcon from "@heroicons/react/16/solid/ExclamationTriangleIcon"
import type React from "react"

/**
 * Image formats supported by the app.
 */
export const IMAGE_FORMATS = new Map([
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
