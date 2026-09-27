import { useMemo, useRef, useState } from "react"
import { FlatList, View, type ViewStyle } from "react-native"

import { Button } from "@/components/Button"
import { CourseCard } from "@/components/CourseCard"
import { CourseFilterPicker } from "@/components/CourseFilterPicker"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useFavorites } from "@/context/FavoritesContext"
import { useListScrollToTop } from "@/context/ListScrollContext"
import { courses, semesterOptions } from "@/data/courses"
import type { CourseSummary } from "@/data/courseTypes"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export function FavoritesScreen({ navigation }: AppStackScreenProps<"Favorites">) {
  const { themed } = useAppTheme()
  const { favoriteKeys } = useFavorites()
  const [termCode, setTermCode] = useState<string | null>(null)
  const listRef = useRef<FlatList<CourseSummary>>(null)
  useListScrollToTop(listRef)
  const favorites = useMemo(
    () => courses.filter((course) => favoriteKeys.has(course.key)),
    [favoriteKeys],
  )
  const visibleCourses = useMemo(
    () => favorites.filter((course) => termCode === null || course.termCode === termCode),
    [favorites, termCode],
  )

  return (
    <Screen preset="fixed" safeAreaEdges={["top", "bottom"]} contentContainerStyle={$screen}>
      <FlatList
        ref={listRef}
        data={visibleCourses}
        keyExtractor={(course) => course.key}
        contentContainerStyle={themed($content)}
        ListHeaderComponent={
          <View style={$header}>
            <View style={$toolbar}>
              <View style={$filter}>
                <CourseFilterPicker
                  label="Semester"
                  options={semesterOptions}
                  value={termCode}
                  onChange={(value) => {
                    setTermCode(value)
                    listRef.current?.scrollToOffset({ offset: 0, animated: false })
                  }}
                />
              </View>
            </View>
            <Text text="My favorites" preset="heading" accessibilityRole="header" />
            <Text
              text={`${visibleCourses.length} of ${favorites.length} saved course records`}
              accessibilityLiveRegion="polite"
              size="sm"
            />
          </View>
        }
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            onOpen={() => navigation.navigate("CourseDetails", { courseKey: item.key })}
          />
        )}
        ListEmptyComponent={
          <View style={$header}>
            <Text
              text={favorites.length === 0 ? "No favorites yet" : "No favorites in this semester"}
              preset="subheading"
            />
            <Text
              text={
                favorites.length === 0
                  ? "Tap a star on a course to save it here."
                  : "Choose another semester or show all semesters."
              }
            />
            {termCode !== null && (
              <Button text="Show all semesters" onPress={() => setTermCode(null)} />
            )}
            {favorites.length === 0 && (
              <Button
                text="Explore courses"
                preset="filled"
                onPress={() => navigation.navigate("CourseList")}
              />
            )}
          </View>
        }
      />
    </Screen>
  )
}

const $screen: ViewStyle = { flex: 1 }
const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: "100%",
  maxWidth: 760,
  alignSelf: "center",
  padding: spacing.md,
  paddingBottom: spacing.xl,
})
const $header: ViewStyle = { gap: 12, paddingVertical: 16 }
const $toolbar: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 12,
  alignItems: "flex-start",
}
const $filter: ViewStyle = { flexGrow: 1, flexBasis: 180, flexDirection: "row", flexWrap: "wrap" }
