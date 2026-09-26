import type { CourseDetailContent, CourseSummary } from "../app/data/courseTypes"

/** Validate external JSON before converting it to the app's smaller data model. */
export function buildCourseSummaries(input: unknown): CourseSummary[] {
  if (!Array.isArray(input)) throw new Error("Expected a course array")

  const keys = new Set<string>()
  const courses = input.map((value: unknown, index): CourseSummary => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error(`Record ${index}: expected an object`)
    }
    const row = value as Record<string, unknown>

    function text(field: string): string {
      const value = row[field]
      if (typeof value !== "string" || !value.trim()) {
        throw new Error(`Record ${index}: invalid ${field}`)
      }
      return value.trim()
    }

    function credits(field: string): number {
      const value = row[field]
      if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
        throw new Error(`Record ${index}: invalid ${field}`)
      }
      return value
    }

    const termCode = text("term_code")
    const key = `${termCode}:${text("id")}`
    if (keys.has(key)) throw new Error(`Duplicate semester/course key: ${key}`)
    keys.add(key)

    const minCredits = credits("min_credits")
    const maxCredits = credits("max_credits")
    if (minCredits > maxCredits) throw new Error(`Record ${index}: reversed credit range`)

    return {
      key,
      code: `${text("prefix")} ${text("number")}`,
      title: text("title"),
      department: text("department_code"),
      termCode,
      termName: text("term_name"),
      minCredits,
      maxCredits,
    }
  })

  // The supplied term codes sort chronologically. Show the newest term first.
  return courses.sort(
    (a, b) =>
      b.termCode.localeCompare(a.termCode, "en") ||
      a.code.localeCompare(b.code, "en") ||
      a.key.localeCompare(b.key, "en"),
  )
}

/** Keep detailed text separate from the small list summaries, grouped by term. */
export function buildCourseDetails(
  input: unknown,
): Record<string, Record<string, CourseDetailContent>> {
  // Validate identities using the same rules as the summary generator.
  buildCourseSummaries(input)
  const terms: Record<string, Record<string, CourseDetailContent>> = {}
  for (const value of input as Record<string, unknown>[]) {
    const termCode = (value.term_code as string).trim()
    const id = (value.id as string).trim()
    // Term codes become filenames; reject unexpected path characters.
    if (!/^\d{4}$/.test(termCode)) throw new Error(`Invalid term code: ${termCode}`)

    function text(field: string): string {
      const content = value[field]
      if (typeof content !== "string") throw new Error(`${termCode}:${id}: invalid ${field}`)
      return content.trim()
    }

    terms[termCode] ??= {}
    terms[termCode][`${termCode}:${id}`] = {
      description: text("description"),
      prerequisite: text("prerequisite"),
      corequisite: text("corequisite"),
      exclusion: text("exclusion"),
      background: text("background"),
      campus: text("campus_name"),
    }
  }
  return terms
}
