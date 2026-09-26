import { FlatList, View, type ViewStyle } from "react-native"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { courses } from "@/data/courses"
import type { CourseSummary } from "@/data/courseTypes"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export function CourseListScreen() {
  const { themed } = useAppTheme()

  return (
    <Screen preset="fixed" safeAreaEdges={["top", "bottom"]} contentContainerStyle={$screen}>
      <View style={themed($header)}>
        <Text text="Course Explorer" preset="heading" accessibilityRole="header" />
        <Text text={`${courses.length.toLocaleString()} course records · All semesters`} />
      </View>
      <FlatList<CourseSummary>
        style={$list}
        data={courses}
        keyExtractor={(course) => course.key}
        contentContainerStyle={themed($listContent)}
        renderItem={({ item }) => (
          <View style={themed($courseCard)}>
            <Text text={item.code} preset="subheading" />
            <Text text={item.title} />
            <Text
              text={
                item.minCredits === item.maxCredits
                  ? `${item.minCredits} credits`
                  : `${item.minCredits}–${item.maxCredits} credits`
              }
            />
            <Text text={`${item.department} · ${item.termName}`} size="sm" />
          </View>
        )}
        ListEmptyComponent={<Text text="No courses available." />}
      />
    </Screen>
  )
}

const $screen: ViewStyle = { flex: 1 }
const $list: ViewStyle = { flex: 1 }

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.lg,
  gap: spacing.xs,
})

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.lg,
})

const $courseCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderColor: colors.border,
  borderWidth: 1,
  borderRadius: 12,
  padding: spacing.md,
  gap: spacing.xs,
  marginBottom: spacing.md,
})
