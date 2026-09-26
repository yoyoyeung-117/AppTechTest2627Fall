/** One catalogue record for one semester, not a unique course across all years. */
export interface CourseSummary {
  key: string
  code: string
  title: string
  department: string
  termCode: string
  termName: string
  minCredits: number
  maxCredits: number
}
