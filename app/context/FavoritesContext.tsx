import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { Alert } from "react-native"

import { load, saveString } from "@/utils/storage"

const STORAGE_KEY = "COURSE_FAVORITES_V1"
const FavoritesContext = createContext<{
  favoriteKeys: ReadonlySet<string>
  toggleFavorite: (key: string) => void
} | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteKeys, setFavoriteKeys] = useState<ReadonlySet<string>>(() => {
    const saved = load<unknown>(STORAGE_KEY)
    return new Set(
      Array.isArray(saved) ? saved.filter((key): key is string => typeof key === "string") : [],
    )
  })
  const currentKeys = useRef(favoriteKeys)
  const toggleFavorite = useCallback((key: string) => {
    const next = new Set(currentKeys.current)
    if (next.has(key)) next.delete(key)
    else next.add(key)

    if (!saveString(STORAGE_KEY, JSON.stringify([...next]))) {
      Alert.alert("Could not save favorites", "Please try again. Your favorites have not changed.")
      return
    }
    currentKeys.current = next
    setFavoriteKeys(next)
  }, [])
  const value = useMemo(() => ({ favoriteKeys, toggleFavorite }), [favoriteKeys, toggleFavorite])
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const value = useContext(FavoritesContext)
  if (!value) throw new Error("useFavorites must be used within FavoritesProvider")
  return value
}
