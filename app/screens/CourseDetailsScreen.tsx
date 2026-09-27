import { useMemo } from "react"
import { View, type TextStyle, type ViewStyle } from "react-native"

import { FavoriteButton } from "@/components/FavoriteButton"
import { PrerequisiteExplorer } from "@/components/PrerequisiteExplorer"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { getCourseDetails } from "@/data/courseDetails"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export function CourseDetailsScreen({ navigation, route }: AppStackScreenProps<"CourseDetails">) {
  const { themed } = useAppTheme()
  const courseKey = route.params?.courseKey
  const course = useMemo(() => getCourseDetails(courseKey), [courseKey])

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($container)}
    >
      {!course ? (
        <>
          <Text text="Course not found" preset="heading" accessibilityRole="header" />
          <Text text="This record is not available in the local catalogue. Return to the list and choose a course." />
        </>
      ) : (
        <>
          <View style={themed($hero)}>
            <View style={$heroTop}>
              <Text
                text="COURSE DETAILS"
                size="xxs"
                weight="bold"
                style={[themed($accent), $heroLabel]}
              />
              <FavoriteButton course={course} />
            </View>
            <Text
              text={course.code}
              preset="heading"
              style={themed($accent)}
              accessibilityRole="header"
            />
            <Text text={course.title} preset="subheading" />
            <Text text={`${course.termName} · ${course.department} · ${course.campus}`} />
            <Text
              text={
                course.minCredits === course.maxCredits
                  ? `${course.minCredits} credits`
                  : `${course.minCredits}–${course.maxCredits} credits`
              }
            />
          </View>
          <DetailSection
            title="Description"
            content={course.description || "No description listed."}
          />
          <View style={themed($section)}>
            <PrerequisiteExplorer
              key={course.key}
              course={course}
              onOpen={(key) => navigation.push("CourseDetails", { courseKey: key })}
            />
          </View>
          {!!course.corequisite && (
            <DetailSection title="Corequisites" content={course.corequisite} />
          )}
          {!!course.exclusion && <DetailSection title="Exclusions" content={course.exclusion} />}
          {!!course.background && (
            <DetailSection title="Recommended background" content={course.background} />
          )}
        </>
      )}
    </Screen>
  )
}

function DetailSection({ title, content }: { title: string; content: string }) {
  const { themed } = useAppTheme()
  return (
    <View style={themed($section)}>
      <Text text={title} preset="subheading" accessibilityRole="header" />
      <Text text={content} selectable />
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: "100%",
  maxWidth: 760,
  alignSelf: "center",
  padding: spacing.md,
  gap: spacing.md,
})

const $section: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.surface,
  borderRadius: 16,
  padding: spacing.md,
  gap: spacing.sm,
})
const $hero: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.accentSurface,
  borderRadius: 20,
  padding: spacing.lg,
  gap: spacing.sm,
})
const $accent: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.tint })
const $heroTop: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 12 }
const $heroLabel: TextStyle = { flex: 1 }
