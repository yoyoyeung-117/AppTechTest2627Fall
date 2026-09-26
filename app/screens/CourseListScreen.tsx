import { useEffect, useMemo, useRef, useState } from "react"
import { FlatList, Keyboard, Pressable, View, type TextStyle, type ViewStyle } from "react-native"

import { Button } from "@/components/Button"
import { CourseFilterPicker } from "@/components/CourseFilterPicker"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { courses, courseSearchIndex, departmentOptions, semesterOptions } from "@/data/courses"
import { filterCourses } from "@/data/courseSearch"
import type { CourseSummary } from "@/data/courseTypes"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export function CourseListScreen({ navigation }: AppStackScreenProps<"CourseList">) {
  const { themed } = useAppTheme()
  const [query, setQuery] = useState("")
  const [termCode, setTermCode] = useState<string | null>(null)
  const [department, setDepartment] = useState<string | null>(null)
  const listRef = useRef<FlatList<CourseSummary>>(null)

  const filteredCourses = useMemo(
    () => filterCourses(courseSearchIndex, { query, termCode, department }),
    [query, termCode, department],
  )
  const hasFilters = query !== "" || termCode !== null || department !== null

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false })
  }, [query, termCode, department])

  function resetFilters() {
    setQuery("")
    setTermCode(null)
    setDepartment(null)
  }

  return (
    <Screen preset="fixed" safeAreaEdges={["top", "bottom"]} contentContainerStyle={$screen}>
      <FlatList<CourseSummary>
        ListHeaderComponent={
          <View style={themed($header)}>
            <Text
              text="HKUST / COURSE CATALOGUE"
              size="xxs"
              weight="bold"
              style={themed($accent)}
            />
            <Text
              text="Find your next course."
              preset="heading"
              style={$heading}
              accessibilityRole="header"
            />
            <Text
              text="Explore subjects. Understand what comes next."
              size="sm"
              style={themed($muted)}
            />
            <TextField
              label="Search courses"
              accessibilityLabel="Search by course code or title"
              placeholder="Course code or title"
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={Keyboard.dismiss}
            />
            <View style={themed($filters)}>
              <CourseFilterPicker
                label="Semester"
                options={semesterOptions}
                value={termCode}
                onChange={setTermCode}
              />
              <CourseFilterPicker
                label="Department"
                options={departmentOptions}
                value={department}
                onChange={setDepartment}
              />
            </View>
            <Text
              text={`${filteredCourses.length.toLocaleString()} of ${courses.length.toLocaleString()} course records`}
              size="sm"
              accessibilityLiveRegion="polite"
            />
            {hasFilters && (
              <Button text="Reset search and filters" preset="filled" onPress={resetFilters} />
            )}
          </View>
        }
        style={$list}
        ref={listRef}
        data={filteredCourses}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        keyExtractor={(course) => course.key}
        contentContainerStyle={themed($listContent)}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [themed($courseCard), pressed && $pressedCard]}
            accessibilityRole="button"
            accessibilityLabel={`${item.code}, ${item.title}, ${item.termName}`}
            accessibilityHint="Opens course details"
            onPress={() => {
              Keyboard.dismiss()
              navigation.navigate("CourseDetails", { courseKey: item.key })
            }}
          >
            <View style={$cardTop}>
              <Text text={item.code} preset="subheading" style={themed($code)} />
              <View style={themed($badge)}>
                <Text
                  text={
                    item.minCredits === item.maxCredits
                      ? `${item.minCredits} credits`
                      : `${item.minCredits}–${item.maxCredits} credits`
                  }
                  size="xxs"
                  weight="medium"
                  style={themed($accent)}
                />
              </View>
            </View>
            <Text text={item.title} weight="medium" />
            <Text text={`${item.department} · ${item.termName}`} size="xs" style={themed($muted)} />
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={themed($courseCard)}>
            <Text text="No matches yet" preset="subheading" />
            <Text
              text="Try a different course code or reset your filters."
              style={themed($muted)}
            />
          </View>
        }
      />
    </Screen>
  )
}

const $screen: ViewStyle = { flex: 1 }
const $list: ViewStyle = { flex: 1 }
const $pressedCard: ViewStyle = { opacity: 0.7 }

const $filters: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.xs,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.lg,
  paddingBottom: spacing.lg,
  gap: spacing.sm,
})

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: "100%",
  maxWidth: 760,
  alignSelf: "center",
  paddingHorizontal: spacing.md,
  paddingBottom: spacing.xl,
})

const $courseCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.surface,
  borderColor: colors.separator,
  borderWidth: 1,
  borderRadius: 16,
  padding: spacing.md,
  gap: spacing.xs,
  marginBottom: spacing.md,
})

const $heading: TextStyle = { fontSize: 32, lineHeight: 40 }
const $cardTop: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
}
const $code: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
  fontSize: 20,
  lineHeight: 28,
})
const $accent: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.tint })
const $muted: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.textDim })
const $badge: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.accentSurface,
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 8,
})
