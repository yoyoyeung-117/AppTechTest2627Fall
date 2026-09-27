import type { AppStackParamList } from "./navigationTypes"

// Only standalone destinations belong here; course details require a course key.
export type NavigationPage = {
  [Name in keyof AppStackParamList]: AppStackParamList[Name] extends undefined ? Name : never
}[keyof AppStackParamList]

export const navigationPages: ReadonlyArray<{
  name: NavigationPage
  title: string
  description: string
}> = [
  { name: "CourseList", title: "Course explorer", description: "Browse and search the catalogue" },
  { name: "Favorites", title: "My favorites", description: "Return to your saved courses" },
]
