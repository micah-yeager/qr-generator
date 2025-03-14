import { type ForwardedRef, useEffect, useRef } from "react"

/**
 * A hook to ensure a ref exists for a component, regardless whether it's
 * provided.
 *
 * @param ref - The ref to forward.
 * @param initialValue - The initial value of the ref. Defaults to `null`.
 * @returns The ref to use in the component.
 */
export const useForwardRef = <T>(
  ref: ForwardedRef<T>,
  initialValue: T | null = null,
) => {
  const targetRef = useRef<T>(initialValue)

  useEffect(() => {
    if (!ref) return

    if (typeof ref === "function") {
      ref(targetRef.current)
    } else {
      ref.current = targetRef.current
    }
  }, [ref])

  return targetRef
}
