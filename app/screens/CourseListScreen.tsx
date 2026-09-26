import { View, type ViewStyle } from "react-native"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

// A learning example, not a record loaded from courses.json.
const sampleCourse = {
  code: "COMP 2011",
  title: "Programming with C++",
  credits: 4,
}

export function CourseListScreen() {
  const { themed } = useAppTheme()

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($container)}
    >
      <Text text="Course Explorer" preset="heading" accessibilityRole="header" />
      <Text text="Explore HKUST courses and their prerequisites." />

      <View style={themed($courseCard)}>
        <Text text="Sample course" size="xs" />
        <Text text={sampleCourse.code} preset="subheading" />
        <Text text={sampleCourse.title} />
        <Text text={`${sampleCourse.credits} credits`} />
      </View>
    </Screen>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.lg,
  gap: spacing.md,
})

const $courseCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderColor: colors.border,
  borderWidth: 1,
  borderRadius: 12,
  padding: spacing.md,
  gap: spacing.xs,
})
