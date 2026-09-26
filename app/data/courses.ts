import type { CourseSummary } from "./courseTypes"
import summaries from "./generated/course-summaries.json"

// Generated on the development machine; no filesystem or network access on the phone.
export const courses: readonly CourseSummary[] = summaries
