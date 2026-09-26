import { useState } from "react"
import { FlatList, Keyboard, Modal, useWindowDimensions, View, type ViewStyle } from "react-native"

import type { FilterOption } from "@/data/courseSearch"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { Button } from "./Button"
import { Screen } from "./Screen"
import { Text } from "./Text"

interface CourseFilterPickerProps {
  label: string
  options: readonly FilterOption[]
  value: string | null
  onChange: (value: string | null) => void
}

/** One reusable selector for semesters and departments; no native dependency needed. */
export function CourseFilterPicker({ label, options, value, onChange }: CourseFilterPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { themed } = useAppTheme()
  const { width, fontScale } = useWindowDimensions()
  const selectedLabel = options.find((option) => option.value === value)?.label

  return (
    <>
      <Button
        text={selectedLabel}
        preset={value === null ? "default" : "filled"}
        accessibilityLabel={`${label}: ${selectedLabel}`}
        accessibilityState={{ expanded: isOpen }}
        style={[$trigger, (width < 360 || fontScale >= 1.3) && $fullWidthTrigger]}
        onPress={() => {
          Keyboard.dismiss()
          setIsOpen(true)
        }}
      />
      <Modal visible={isOpen} animationType="slide" onRequestClose={() => setIsOpen(false)}>
        <Screen preset="fixed" safeAreaEdges={["top", "bottom"]} contentContainerStyle={$screen}>
          <FlatList
            ListHeaderComponent={
              <View style={themed($header)}>
                <Text
                  text={`Choose ${label.toLowerCase()}`}
                  preset="heading"
                  accessibilityRole="header"
                />
                <Button text="Cancel" onPress={() => setIsOpen(false)} />
              </View>
            }
            style={$list}
            data={options}
            extraData={value}
            keyExtractor={(option) => option.value ?? "all"}
            contentContainerStyle={themed($options)}
            renderItem={({ item }) => (
              <Button
                text={`${item.value === value ? "✓ " : ""}${item.label}`}
                accessibilityRole="radio"
                accessibilityState={{ checked: item.value === value }}
                preset={item.value === value ? "reversed" : "default"}
                style={themed($option)}
                onPress={() => {
                  onChange(item.value)
                  setIsOpen(false)
                }}
              />
            )}
          />
        </Screen>
      </Modal>
    </>
  )
}

const $screen: ViewStyle = { flex: 1 }
const $list: ViewStyle = { flex: 1 }
const $trigger: ViewStyle = { flexGrow: 1, flexBasis: 140 }
const $fullWidthTrigger: ViewStyle = { flexBasis: "100%" }
const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.lg,
  gap: spacing.sm,
})
const $options: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: "100%",
  maxWidth: 760,
  alignSelf: "center",
  paddingHorizontal: spacing.md,
  paddingBottom: spacing.lg,
})
const $option: ThemedStyle<ViewStyle> = ({ spacing }) => ({ marginBottom: spacing.xs })
