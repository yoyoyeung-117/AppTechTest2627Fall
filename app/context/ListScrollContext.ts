import { createContext, useCallback, useContext, type RefObject } from "react"
import { useFocusEffect } from "@react-navigation/native"

export const ListScrollContext = createContext<RefObject<(() => void) | null> | null>(null)

/** Register only the focused list so the global Top button targets the visible page. */
export function useListScrollToTop(
  listRef: RefObject<{
    scrollToOffset: (options: { offset: number; animated: boolean }) => void
  } | null>,
) {
  const actionRef = useContext(ListScrollContext)
  useFocusEffect(
    useCallback(() => {
      if (!actionRef) return
      const scrollToTop = () => listRef.current?.scrollToOffset({ offset: 0, animated: true })
      actionRef.current = scrollToTop
      return () => {
        if (actionRef.current === scrollToTop) actionRef.current = null
      }
    }, [actionRef, listRef]),
  )
}
