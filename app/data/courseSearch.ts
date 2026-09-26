import type { CourseSummary } from "./courseTypes"

export interface CourseFilters {
  query: string
  termCode: string | null
  department: string | null
}

export interface FilterOption {
  value: string | null
  label: string
}

/** Normalize once when loading data, rather than once per record per keystroke. */
export function createCourseSearchIndex(courses: readonly CourseSummary[]) {
  return courses.map((course) => ({
    course,
    searchText: `${course.code} ${course.code.replace(/\s+/g, "")} ${course.title}`.toLowerCase(),
  }))
}

export function filterCourses(
  index: ReturnType<typeof createCourseSearchIndex>,
  { query, termCode, department }: CourseFilters,
): CourseSummary[] {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean)

  return index
    .filter(
      ({ course, searchText }) =>
        (termCode === null || course.termCode === termCode) &&
        (department === null || course.department === department) &&
        words.every((word) => searchText.includes(word)),
    )
    .map(({ course }) => course)
}

export function getCourseFilterOptions(courses: readonly CourseSummary[]) {
  const terms = new Map(courses.map((course) => [course.termCode, course.termName]))
  const departments = [...new Set(courses.map((course) => course.department))]

  const semesterOptions: FilterOption[] = [
    { value: null, label: "All semesters" },
    ...[...terms]
      .sort(([a], [b]) => b.localeCompare(a, "en"))
      .map(([value, label]) => ({ value, label })),
  ]
  const departmentOptions: FilterOption[] = [
    { value: null, label: "All departments" },
    ...departments
      .sort((a, b) => a.localeCompare(b, "en"))
      .map((value) => ({ value, label: value })),
  ]

  return { semesterOptions, departmentOptions }
}
