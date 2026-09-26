import { useState } from "react"
import { View, type TextStyle, type ViewStyle } from "react-native"

import { findCourseInTerm } from "@/data/courseDetails"
import type { CourseDetails } from "@/data/courseTypes"
import { getPrerequisiteBranches, type PrerequisiteBranch } from "@/data/prerequisites"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { Button } from "./Button"
import { Text } from "./Text"

interface ExplorerProps {
  course: CourseDetails
  onOpen: (courseKey: string) => void
}

export function PrerequisiteExplorer({ course, onOpen }: ExplorerProps) {
  const { themed } = useAppTheme()
  return (
    <View style={themed($group)}>
      <Text text="Prerequisites" preset="subheading" accessibilityRole="header" />
      <Text
        text="Explore the courses below. The original wording defines AND/OR choices and other conditions; links do not confirm eligibility."
        size="sm"
      />
      <PrerequisiteLevel course={course} ancestors={[course.key]} onOpen={onOpen} />
    </View>
  )
}

function PrerequisiteLevel({
  course,
  ancestors,
  onOpen,
}: ExplorerProps & { ancestors: readonly string[] }) {
  const { themed } = useAppTheme()
  const branches = getPrerequisiteBranches(course, ancestors, findCourseInTerm)
  return (
    <View style={themed($group)}>
      <Text text={course.prerequisite || "No prerequisites listed."} selectable />
      {!!course.prerequisite && branches.length === 0 && (
        <Text text="No course references detected. See the conditions above." size="sm" />
      )}
      {branches.map((branch) => (
        <PrerequisiteItem key={branch.code} branch={branch} ancestors={ancestors} onOpen={onOpen} />
      ))}
    </View>
  )
}

function PrerequisiteItem({
  branch,
  ancestors,
  onOpen,
}: {
  branch: PrerequisiteBranch
  ancestors: readonly string[]
  onOpen: ExplorerProps["onOpen"]
}) {
  const [expanded, setExpanded] = useState(false)
  const { themed } = useAppTheme()
  const target = branch.course
  return (
    <View style={themed($branch)}>
      <Text
        text={`Level ${ancestors.length} · ${branch.code}`}
        preset="bold"
        style={themed($accent)}
      />
      {target && (
        <Button
          text={`Open ${branch.code}: ${target.title}`}
          preset="filled"
          onPress={() => onOpen(target.key)}
        />
      )}
      {branch.status === "missing" && (
        <Text text="Not found in this semester's local catalogue." size="sm" />
      )}
      {branch.status === "cycle" && (
        <Text text="Already on this path. Expansion stopped to avoid a cycle." size="sm" />
      )}
      {branch.status === "depth-limit" && (
        <Text text="Expansion limit reached. Open this course to continue exploring." size="sm" />
      )}
      {branch.status === "available" && target && (
        <>
          <Button
            text={
              expanded
                ? `Hide prerequisites of ${branch.code}`
                : `Show prerequisites of ${branch.code}`
            }
            accessibilityState={{ expanded }}
            onPress={() => setExpanded((previous) => !previous)}
          />
          {expanded && (
            <PrerequisiteLevel
              course={target}
              ancestors={[...ancestors, target.key]}
              onOpen={onOpen}
            />
          )}
        </>
      )}
    </View>
  )
}

const $group: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.sm })
// Avoid accumulating horizontal padding as branches get deeper on a small screen.
const $branch: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderTopColor: colors.border,
  borderTopWidth: 1,
  paddingTop: spacing.sm,
  paddingBottom: spacing.sm,
  gap: spacing.xs,
})

const $accent: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.tint })
