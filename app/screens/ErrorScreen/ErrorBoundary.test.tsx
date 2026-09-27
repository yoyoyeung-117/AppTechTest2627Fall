import { View } from "react-native"
import { render } from "@testing-library/react-native"

import { ErrorBoundary } from "./ErrorBoundary"

jest.mock("./ErrorDetails", () => ({ ErrorDetails: () => null }))

it("allows navigation-dependent children to update without an error", () => {
  const screen = render(
    <ErrorBoundary catchErrors="always">
      <View testID="catalogue" />
    </ErrorBoundary>,
  )
  screen.rerender(
    <ErrorBoundary catchErrors="always">
      <View testID="favorites" />
    </ErrorBoundary>,
  )
  expect(screen.queryByTestId("catalogue")).toBeNull()
  expect(screen.getByTestId("favorites")).toBeTruthy()
})
