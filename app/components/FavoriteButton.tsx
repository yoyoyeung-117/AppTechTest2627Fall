import { Pressable, type TextStyle, type ViewStyle } from "react-native"

import { useFavorites } from "@/context/FavoritesContext"
import type { CourseSummary } from "@/data/courseTypes"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { Text } from "./Text"

export function FavoriteButton({ course }: { course: CourseSummary }) {
  const { favoriteKeys, toggleFavorite } = useFavorites()
  const { themed } = useAppTheme()
  const saved = favoriteKeys.has(course.key)
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: saved }}
      accessibilityLabel={`${saved ? "Remove" : "Add"} ${course.code}, ${course.termName} ${saved ? "from" : "to"} favorites`}
      onPress={() => toggleFavorite(course.key)}
      style={({ pressed }) => [themed($button), pressed && { opacity: 0.6 }]}
    >
      <Text text={saved ? "★" : "☆"} style={themed($star)} accessible={false} />
    </Pressable>
  )
}

const $button: ThemedStyle<ViewStyle> = ({ colors }) => ({
  minWidth: 48,
  minHeight: 48,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 12,
  backgroundColor: colors.accentSurface,
})
const $star: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontFamily: undefined,
  fontSize: 28,
  lineHeight: 36,
  color: colors.tint,
})
