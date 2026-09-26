import { courses } from "./courses"
import type { CourseDetails } from "./courseTypes"
import { detailLoaders } from "./generated/detailLoaders"

const summariesByKey = new Map(courses.map((course) => [course.key, course]))
const keysByTermAndCode = new Map(
  courses.map((course) => [`${course.termCode}:${course.code.toUpperCase()}`, course.key]),
)

/** Stay in the selected semester; historical references may be absent from that term. */
export function findCourseInTerm(termCode: string, code: string): CourseDetails | undefined {
  const key = keysByTermAndCode.get(`${termCode}:${code.toUpperCase()}`)
  return key ? getCourseDetails(key) : undefined
}

export function getCourseDetails(courseKey: string): CourseDetails | undefined {
  const summary = summariesByKey.get(courseKey)
  if (!summary) return undefined

  // Literal require paths in the generated loaders let Metro bundle each local file.
  // Module evaluation is deferred until this term is visited, then cached by the runtime.
  const load = detailLoaders[summary.termCode]
  const content = load?.()[courseKey]
  return content ? { ...summary, ...content } : undefined
}
