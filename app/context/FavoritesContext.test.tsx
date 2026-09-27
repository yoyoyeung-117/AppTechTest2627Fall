import { Alert } from "react-native"
import { act, renderHook } from "@testing-library/react-native"

import { load, saveString } from "@/utils/storage"

import { FavoritesProvider, useFavorites } from "./FavoritesContext"

jest.mock("@/utils/storage", () => ({ load: jest.fn(), saveString: jest.fn() }))

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(load).mockReturnValue(null)
  jest.mocked(saveString).mockReturnValue(true)
})

it("persists semester-specific favorites and restores them in a new provider", () => {
  let stored: string | null = null
  jest.mocked(saveString).mockImplementation((_key, value) => {
    stored = value
    return true
  })
  jest.mocked(load).mockImplementation(() => (stored ? JSON.parse(stored) : null))
  const first = renderHook(() => useFavorites(), { wrapper: FavoritesProvider })
  act(() => {
    first.result.current.toggleFavorite("2610:007920")
    first.result.current.toggleFavorite("2540:007920")
  })
  first.unmount()
  const second = renderHook(() => useFavorites(), { wrapper: FavoritesProvider })
  expect([...second.result.current.favoriteKeys]).toEqual(["2610:007920", "2540:007920"])
  act(() => second.result.current.toggleFavorite("2610:007920"))
  expect([...second.result.current.favoriteKeys]).toEqual(["2540:007920"])
  expect(JSON.parse(stored!)).toEqual(["2540:007920"])
})

it("handles two rapid toggles without retaining a favorite", () => {
  const { result } = renderHook(() => useFavorites(), { wrapper: FavoritesProvider })
  act(() => {
    result.current.toggleFavorite("2610:007920")
    result.current.toggleFavorite("2610:007920")
  })
  expect(result.current.favoriteKeys.size).toBe(0)
})

it("does not claim a change was saved when persistence fails", () => {
  const alert = jest.spyOn(Alert, "alert").mockImplementation(() => {})
  jest.mocked(load).mockReturnValue(["2610:007920"])
  jest.mocked(saveString).mockReturnValue(false)
  const { result } = renderHook(() => useFavorites(), { wrapper: FavoritesProvider })
  act(() => result.current.toggleFavorite("2610:007920"))
  expect(result.current.favoriteKeys.has("2610:007920")).toBe(true)
  expect(alert).toHaveBeenCalled()
  alert.mockRestore()
})

it.each(["invalid JSON", {}, null, [null, 42]])(
  "tolerates invalid saved favorites: %j",
  (saved) => {
    jest.mocked(load).mockReturnValue(saved)
    const { result } = renderHook(() => useFavorites(), { wrapper: FavoritesProvider })
    expect(result.current.favoriteKeys.size).toBe(0)
  },
)
