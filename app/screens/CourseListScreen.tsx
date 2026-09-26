import { useEffect, useMemo, useRef, useState } from "react"
import { FlatList, View, type ViewStyle } from "react-native"

import { Button } from "@/components/Button"
import { CourseFilterPicker } from "@/components/CourseFilterPicker"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { courses, courseSearchIndex, departmentOptions, semesterOptions } from "@/data/courses"
import { filterCourses } from "@/data/courseSearch"
import type { CourseSummary } from "@/data/courseTypes"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export function CourseListScreen() {
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
      <View style={themed($header)}>
        <Text text="Course Explorer" preset="heading" accessibilityRole="header" />
        <TextField
          label="Search courses"
          accessibilityLabel="Search by course code or title"
          placeholder="Course code or title"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
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
        {hasFilters && <Button text="Reset search and filters" onPress={resetFilters} />}
      </View>
      <FlatList<CourseSummary>
        style={$list}
        ref={listRef}
        data={filteredCourses}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
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
        ListEmptyComponent={
          <Text text="No courses match. Try another search or reset your filters." />
        }
      />
    </Screen>
  )
}

const $screen: ViewStyle = { flex: 1 }
const $list: ViewStyle = { flex: 1 }

const $filters: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.xs,
})

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
