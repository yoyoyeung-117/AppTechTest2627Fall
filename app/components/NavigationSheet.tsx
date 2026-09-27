import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  AccessibilityInfo,
  Animated,
  Keyboard,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { navigationPages, type NavigationPage } from "@/navigators/navigationPages"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { Text } from "./Text"

interface NavigationSheetProps {
  currentRoute?: string
  onNavigate: (page: NavigationPage) => void
  onGoBack?: () => void
  onGoTop?: () => void
}

export function NavigationSheet({
  currentRoute,
  onNavigate,
  onGoBack,
  onGoTop,
}: NavigationSheetProps) {
  const { themed } = useAppTheme()
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()
  const sheetHeight = Math.min(Math.max(280, height * 0.52), height - insets.top - 12)
  const [visible, setVisible] = useState(false)
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const progress = useRef(new Animated.Value(0)).current
  const closing = useRef(false)
  const reduceMotion = useRef(false)
  const showTop = (currentRoute === "CourseList" || currentRoute === "Favorites") && !!onGoTop

  useEffect(() => {
    let mounted = true
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) reduceMotion.current = enabled
      })
      .catch(() => {})
    const motion = AccessibilityInfo.addEventListener("reduceMotionChanged", (enabled) => {
      reduceMotion.current = enabled
    })
    const show = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true))
    const hide = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false))
    return () => {
      mounted = false
      motion.remove()
      show.remove()
      hide.remove()
    }
  }, [])

  const open = useCallback(() => {
    Keyboard.dismiss()
    closing.current = false
    progress.setValue(0)
    setVisible(true)
  }, [progress])

  const close = useCallback(
    (destination?: NavigationPage) => {
      if (closing.current) return
      closing.current = true
      Animated.timing(progress, {
        toValue: 0,
        duration: reduceMotion.current ? 0 : 180,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished) return
        setVisible(false)
        if (destination) onNavigate(destination)
      })
    },
    [onNavigate, progress],
  )

  const revealGesture = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          gesture.dy < -8 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dy < -24) open()
        },
      }),
    [open],
  )
  const dismissGesture = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          gesture.dy > 8 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dy > 30) close()
        },
      }),
    [close],
  )

  return (
    <>
      {!keyboardVisible && (
        <View style={[themed($dock), { paddingBottom: insets.bottom }]}>
          {showTop && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Scroll to top"
              onPress={onGoTop}
              style={({ pressed }) => [$back, pressed && $pressed]}
            >
              <Text text="↑ Top" weight="medium" style={themed($accent)} />
            </Pressable>
          )}
          {currentRoute === "CourseDetails" && onGoBack && <View style={$backSpacer} />}
          <View style={$fill} {...revealGesture.panHandlers}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open page navigation"
              accessibilityHint="Tap or swipe up to switch pages"
              accessibilityState={{ expanded: visible }}
              onPress={open}
              style={$launcher}
            >
              <View style={themed($handle)} />
              <Text text="Pages" size="xxs" weight="medium" style={themed($accent)} />
            </Pressable>
          </View>
          {showTop && <View style={$backSpacer} />}
          {currentRoute === "CourseDetails" && onGoBack && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back to previous page"
              onPress={onGoBack}
              style={({ pressed }) => [$back, pressed && $pressed]}
            >
              <Text text="‹ Back" weight="medium" style={themed($accent)} />
            </Pressable>
          )}
        </View>
      )}
      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => close()}
        onShow={() =>
          Animated.timing(progress, {
            toValue: 1,
            duration: reduceMotion.current ? 0 : 220,
            useNativeDriver: true,
          }).start()
        }
      >
        <View style={$overlay}>
          <Animated.View style={[$backdrop, { opacity: progress }]}>
            <Pressable
              style={$fill}
              accessibilityRole="button"
              accessibilityLabel="Close page navigation"
              onPress={() => close()}
            />
          </Animated.View>
          <Animated.View
            accessibilityViewIsModal
            style={[
              themed($sheet),
              {
                height: sheetHeight,
                paddingBottom: Math.max(insets.bottom, 16),
                transform: [
                  {
                    translateY: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [sheetHeight, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View {...dismissGesture.panHandlers}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Collapse page navigation"
                onPress={() => close()}
                style={$grabber}
              >
                <View style={themed($handle)} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={$content} keyboardShouldPersistTaps="handled">
              <Text text="Go to page" preset="subheading" accessibilityRole="header" />
              {navigationPages.map((page) => (
                <Pressable
                  key={page.name}
                  accessibilityRole="button"
                  accessibilityLabel={page.title}
                  accessibilityState={{ selected: currentRoute === page.name }}
                  onPress={() => close(page.name)}
                  style={({ pressed }) => [
                    themed($destination),
                    currentRoute === page.name && themed($selected),
                    pressed && $pressed,
                  ]}
                >
                  <Text text={page.title} weight="bold" style={themed($accent)} />
                  <Text text={page.description} size="sm" />
                  {currentRoute === page.name && (
                    <Text text="Current page" size="xxs" style={themed($accent)} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </>
  )
}

const $fill: ViewStyle = { flex: 1 }
const $dock: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.surface,
  borderTopColor: colors.separator,
  borderTopWidth: 1,
})
const $back: ViewStyle = {
  width: 96,
  minHeight: 48,
  paddingHorizontal: 12,
  justifyContent: "center",
  alignItems: "center",
}
const $backSpacer: ViewStyle = { width: 96 }
const $launcher: ViewStyle = {
  minHeight: 48,
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
}
const $handle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 40,
  height: 4,
  borderRadius: 2,
  backgroundColor: colors.tint,
})
const $accent: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.tint })
const $overlay: ViewStyle = { flex: 1, justifyContent: "flex-end" }
const $backdrop: ViewStyle = {
  position: "absolute",
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: "rgba(0, 0, 0, 0.4)",
}
const $sheet: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.surface,
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  overflow: "hidden",
})
const $grabber: ViewStyle = { minHeight: 40, alignItems: "center", justifyContent: "center" }
const $content: ViewStyle = {
  width: "100%",
  maxWidth: 760,
  alignSelf: "center",
  paddingHorizontal: 20,
  paddingBottom: 12,
  gap: 12,
}
const $destination: ThemedStyle<ViewStyle> = ({ colors }) => ({
  minHeight: 64,
  padding: 16,
  gap: 4,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: colors.separator,
})
const $selected: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.accentSurface,
  borderColor: colors.tint,
})
const $pressed: ViewStyle = { opacity: 0.7 }
