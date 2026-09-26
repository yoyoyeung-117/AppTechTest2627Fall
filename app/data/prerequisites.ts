import type { CourseDetails } from "./courseTypes"

export const MAX_PREREQUISITE_DEPTH = 8

/** Extract references, not eligibility logic. The original AND/OR text stays visible. */
export function extractPrerequisiteCodes(text: string): string[] {
  const codes = new Set<string>()
  const pattern =
    /\b([A-Z]{4})\s*(\d{3,4}[A-Z]{0,2}(?:-\d{4}[A-Z]{0,2})?)(?![A-Z0-9]|-\d{2}\b)((?:\s*\/\s*\d{3,4}[A-Z]{0,2}(?![A-Z0-9]))*)/gi
  for (const match of text.matchAll(pattern)) {
    const prefix = match[1].toUpperCase()
    codes.add(`${prefix} ${match[2].toUpperCase()}`)
    // Handle abbreviated references such as LIFS 2040/2210.
    for (const number of match[3]
      .split("/")
      .map((part) => part.trim())
      .filter(Boolean)) {
      codes.add(`${prefix} ${number.toUpperCase()}`)
    }
  }
  return [...codes]
}

export interface PrerequisiteBranch {
  code: string
  course: CourseDetails | undefined
  status: "available" | "missing" | "cycle" | "depth-limit"
}

/** Only resolve one level. Descendants are requested when the user expands a branch. */
export function getPrerequisiteBranches(
  course: CourseDetails,
  ancestors: readonly string[],
  resolve: (termCode: string, code: string) => CourseDetails | undefined,
): PrerequisiteBranch[] {
  return extractPrerequisiteCodes(course.prerequisite).map((code) => {
    const target = resolve(course.termCode, code)
    const status = !target
      ? "missing"
      : ancestors.includes(target.key)
        ? "cycle"
        : ancestors.length > MAX_PREREQUISITE_DEPTH
          ? "depth-limit"
          : "available"
    return { code, course: target, status }
  })
}
