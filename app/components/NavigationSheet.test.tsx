import { Modal } from "react-native"
import { act, fireEvent, render } from "@testing-library/react-native"

import { ThemeProvider } from "@/theme/context"

import { NavigationSheet } from "./NavigationSheet"

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 24, right: 0, bottom: 24, left: 0 }),
}))

beforeEach(() => jest.useFakeTimers())
afterEach(() => jest.useRealTimers())

function setup() {
  const onNavigate = jest.fn()
  const screen = render(
    <ThemeProvider>
      <NavigationSheet currentRoute="CourseList" onNavigate={onNavigate} />
    </ThemeProvider>,
  )
  function open() {
    fireEvent.press(screen.getByLabelText("Open page navigation"))
    fireEvent(screen.UNSAFE_getByType(Modal), "show")
    act(() => jest.runAllTimers())
  }
  return { ...screen, onNavigate, open }
}

it("starts collapsed and opens a selected-page-aware menu", () => {
  const screen = setup()
  expect(screen.queryByText("Go to page")).toBeNull()
  screen.open()
  expect(screen.getByRole("button", { name: "Course explorer", selected: true })).toBeTruthy()
  expect(screen.getByRole("button", { name: "My favorites" })).toBeTruthy()
})

it("closes after choosing a destination and dispatches it once", () => {
  const screen = setup()
  screen.open()
  fireEvent.press(screen.getByRole("button", { name: "My favorites" }))
  act(() => jest.runAllTimers())
  expect(screen.onNavigate).toHaveBeenCalledTimes(1)
  expect(screen.onNavigate).toHaveBeenCalledWith("Favorites")
  expect(screen.queryByText("Go to page")).toBeNull()
})

it("dismisses by backdrop or Android Back without navigating", () => {
  const screen = setup()
  screen.open()
  // The backdrop sits outside the modal accessibility group but accepts touch.
  fireEvent.press(screen.getByLabelText("Close page navigation", { includeHiddenElements: true }))
  act(() => jest.runAllTimers())
  expect(screen.queryByText("Go to page")).toBeNull()
  screen.open()
  fireEvent(screen.UNSAFE_getByType(Modal), "requestClose")
  act(() => jest.runAllTimers())
  expect(screen.queryByText("Go to page")).toBeNull()
  expect(screen.onNavigate).not.toHaveBeenCalled()
})
