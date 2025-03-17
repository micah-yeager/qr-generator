"use client"

import { useEffect, useState } from "react"
import type React from "react"

/**
 * Retrieve JSON-serializable state on load and store changes in local storage.
 *
 * @param key - The key to store the value under.
 * @param defaultValue - If no stored value is found, default to this.
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState(defaultValue)

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only run on client during first render.
  useEffect(() => {
    const storedValue = localStorage.getItem(key)
    setValue(storedValue ? JSON.parse(storedValue) : defaultValue)
  }, [])

  useEffect(() => {
    if (value === undefined) return
    localStorage.setItem(key, JSON.stringify(value))
  }, [value, key])

  return [value, setValue]
}
