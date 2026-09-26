import { useMemo } from "react"
import { View, type ViewStyle } from "react-native"

import { Button } from "@/components/Button"
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

  function goBack() {
    if (navigation.canGoBack()) navigation.goBack()
    else navigation.replace("CourseList")
  }

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($container)}
    >
      <Button text="Back to courses" onPress={goBack} />
      {!course ? (
        <>
          <Text text="Course not found" preset="heading" accessibilityRole="header" />
          <Text text="This record is not available in the local catalogue. Return to the list and choose a course." />
        </>
      ) : (
        <>
          <Text text={course.code} preset="heading" accessibilityRole="header" />
          <Text text={course.title} preset="subheading" />
          <Text text={`${course.termName} · ${course.department} · ${course.campus}`} />
          <Text
            text={
              course.minCredits === course.maxCredits
                ? `${course.minCredits} credits`
                : `${course.minCredits}–${course.maxCredits} credits`
            }
          />
          <DetailSection
            title="Description"
            content={course.description || "No description listed."}
          />
          <DetailSection
            title="Prerequisites"
            content={course.prerequisite || "No prerequisites listed."}
          />
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
  padding: spacing.lg,
  gap: spacing.md,
})

const $section: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.xs })
