import { Pressable, View, type TextStyle, type ViewStyle } from "react-native"

import type { CourseSummary } from "@/data/courseTypes"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { FavoriteButton } from "./FavoriteButton"
import { Text } from "./Text"

export function CourseCard({ course, onOpen }: { course: CourseSummary; onOpen: () => void }) {
  const { themed } = useAppTheme()
  return (
    <View style={themed($card)}>
      <View style={$top}>
        <Pressable
          onPress={onOpen}
          accessibilityRole="button"
          accessibilityLabel={`Open ${course.code}, ${course.termName}`}
          style={$codeButton}
        >
          <Text text={course.code} preset="subheading" style={themed($code)} />
        </Pressable>
        <FavoriteButton course={course} />
      </View>
      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`${course.code}, ${course.title}, ${course.termName}`}
        accessibilityHint="Opens course details"
        style={({ pressed }) => [$body, pressed && { opacity: 0.7 }]}
      >
        <Text text={course.title} weight="medium" />
        <View style={themed($badge)}>
          <Text
            text={
              course.minCredits === course.maxCredits
                ? `${course.minCredits} credits`
                : `${course.minCredits}–${course.maxCredits} credits`
            }
            size="xxs"
            style={themed($accent)}
          />
        </View>
        <Text text={`${course.department} · ${course.termName}`} size="xs" style={themed($muted)} />
      </Pressable>
    </View>
  )
}

const $card: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.surface,
  borderColor: colors.separator,
  borderWidth: 1,
  borderRadius: 16,
  padding: spacing.md,
  gap: spacing.xs,
  marginBottom: spacing.md,
})
const $top: ViewStyle = { flexDirection: "row", alignItems: "flex-start", gap: 8 }
const $codeButton: ViewStyle = { flex: 1, minHeight: 48, justifyContent: "center" }
const $body: ViewStyle = { gap: 8 }
const $code: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
  fontSize: 20,
  lineHeight: 28,
})
const $accent: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.tint })
const $muted: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.textDim })
const $badge: ThemedStyle<ViewStyle> = ({ colors }) => ({
  alignSelf: "flex-start",
  backgroundColor: colors.accentSurface,
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 8,
})
