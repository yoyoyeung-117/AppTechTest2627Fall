import { useMemo, useRef, useState } from "react"
import { FlatList, Keyboard, Modal, useWindowDimensions, View, type ViewStyle } from "react-native"

import type { FilterOption } from "@/data/courseSearch"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { Button } from "./Button"
import { Screen } from "./Screen"
import { Text } from "./Text"
import { TextField } from "./TextField"

interface CourseFilterPickerProps {
  label: string
  options: readonly FilterOption[]
  value: string | null
  onChange: (value: string | null) => void
}

/** One reusable selector for semesters and departments; no native dependency needed. */
export function CourseFilterPicker({ label, options, value, onChange }: CourseFilterPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const listRef = useRef<FlatList<FilterOption>>(null)
  const { themed } = useAppTheme()
  const { width, fontScale } = useWindowDimensions()
  const selectedLabel = options.find((option) => option.value === value)?.label
  const searchLabel = `Search ${label.toLowerCase()}`
  const filteredOptions = useMemo(() => {
    const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
    return options.filter((option) => {
      const searchText = `${option.label} ${option.value ?? ""}`.toLowerCase()
      return words.every((word) => searchText.includes(word))
    })
  }, [options, query])

  function updateQuery(nextQuery: string) {
    setQuery(nextQuery)
    listRef.current?.scrollToOffset({ offset: 0, animated: false })
  }

  function closePicker() {
    Keyboard.dismiss()
    setIsOpen(false)
  }

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
          setQuery("")
          setIsOpen(true)
        }}
      />
      <Modal visible={isOpen} animationType="slide" onRequestClose={closePicker}>
        <Screen preset="fixed" safeAreaEdges={["top", "bottom"]} contentContainerStyle={$screen}>
          <FlatList
            ref={listRef}
            ListHeaderComponent={
              <View style={themed($header)}>
                <Text
                  text={`Choose ${label.toLowerCase()}`}
                  preset="heading"
                  accessibilityRole="header"
                />
                <Button text="Cancel" onPress={closePicker} />
                <TextField
                  label={searchLabel}
                  accessibilityLabel={searchLabel}
                  placeholder={`Type to search ${label.toLowerCase()}`}
                  value={query}
                  onChangeText={updateQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                  onSubmitEditing={Keyboard.dismiss}
                />
                {!!query && (
                  <Button text="Clear search" preset="filled" onPress={() => updateQuery("")} />
                )}
                <Text
                  text={`${filteredOptions.length} of ${options.length} options`}
                  size="sm"
                  accessibilityLiveRegion="polite"
                />
              </View>
            }
            style={$list}
            data={filteredOptions}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            onScrollBeginDrag={Keyboard.dismiss}
            extraData={value}
            keyExtractor={(option) => option.value ?? "all"}
            contentContainerStyle={themed($options)}
            ListEmptyComponent={
              <Text text="No matches. Try another search or clear your search." />
            }
            renderItem={({ item }) => (
              <Button
                text={`${item.value === value ? "✓ " : ""}${item.label}`}
                accessibilityRole="radio"
                accessibilityState={{ checked: item.value === value }}
                preset={item.value === value ? "reversed" : "default"}
                style={themed($option)}
                onPress={() => {
                  onChange(item.value)
                  closePicker()
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
