import assert from "node:assert/strict"
import { test } from "node:test"

import { buildCourseSummaries } from "./course-data"

const row = {
  id: "001234",
  prefix: "COMP",
  number: "1000",
  title: "Example Course",
  department_code: "COMP",
  term_code: "2610",
  term_name: "2026-27 Fall",
  min_credits: 1,
  max_credits: 4,
}

test("retains semester versions and credit ranges, sorted newest first", () => {
  const result = buildCourseSummaries([
    { ...row, term_code: "2530", term_name: "2025-26 Spring" },
    row,
  ])
  assert.deepEqual(
    result.map((course) => course.key),
    ["2610:001234", "2530:001234"],
  )
  assert.equal(result[0].minCredits, 1)
  assert.equal(result[0].maxCredits, 4)
  assert.equal(result[0].code, "COMP 1000")
})

test("rejects duplicate identities instead of silently losing records", () => {
  assert.throws(() => buildCourseSummaries([row, row]), /Duplicate/)
})

test("rejects malformed external data and allows an empty dataset", () => {
  assert.deepEqual(buildCourseSummaries([]), [])
  assert.throws(() => buildCourseSummaries({}), /array/)
  assert.throws(() => buildCourseSummaries([null]), /object/)
  assert.throws(() => buildCourseSummaries([{ ...row, title: " " }]), /title/)
  assert.throws(() => buildCourseSummaries([{ ...row, min_credits: "1" }]), /min_credits/)
  assert.throws(() => buildCourseSummaries([{ ...row, min_credits: 5 }]), /credit range/)
})
