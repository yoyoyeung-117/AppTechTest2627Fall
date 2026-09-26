import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"

import { buildCourseDetails } from "./course-data"
import { getCourseDetails } from "../app/data/courseDetails"

const row = {
  id: "001",
  prefix: "TEST",
  number: "1000",
  title: "Test Course",
  department_code: "TEST",
  term_code: "2610",
  term_name: "2026-27 Fall",
  min_credits: 1,
  max_credits: 4,
  description: "Current description",
  prerequisite: "TEST 0900 OR instructor approval",
  corequisite: "",
  exclusion: "",
  background: "",
  campus_name: "CWB Campus",
}

test("details preserve semester versions and raw prerequisite wording", () => {
  const details = buildCourseDetails([
    row,
    { ...row, term_code: "2530", description: "Older description", prerequisite: "" },
  ])
  assert.equal(details["2610"]["2610:001"].description, "Current description")
  assert.equal(details["2530"]["2530:001"].description, "Older description")
  assert.equal(details["2610"]["2610:001"].prerequisite, row.prerequisite)
  assert.equal(details["2530"]["2530:001"].prerequisite, "")
})

test("generation rejects malformed detail text and unsafe term filenames", () => {
  assert.throws(() => buildCourseDetails([{ ...row, description: null }]), /description/)
  assert.throws(() => buildCourseDetails([{ ...row, term_code: "../x" }]), /term code/)
  assert.deepEqual(buildCourseDetails([]), {})
})

test("unknown course keys have no fallback to another course or semester", () => {
  for (const key of ["", "missing", "9999:007920", "__proto__"]) {
    assert.equal(getCourseDetails(key), undefined)
  }
})

test("every generated detail matches its source semester record", () => {
  const source = JSON.parse(readFileSync("courses.json", "utf8")) as (typeof row)[]
  for (const record of source) {
    const key = `${record.term_code}:${record.id}`
    const details = getCourseDetails(key)
    assert.ok(details, `Missing ${key}`)
    assert.equal(details.termCode, record.term_code)
    assert.equal(details.description, record.description.trim())
    assert.equal(details.prerequisite, record.prerequisite.trim())
    assert.equal(details.corequisite, record.corequisite.trim())
    assert.equal(details.exclusion, record.exclusion.trim())
    assert.equal(details.background, record.background.trim())
    assert.equal(details.campus, record.campus_name.trim())
    assert.equal(details.minCredits, record.min_credits)
    assert.equal(details.maxCredits, record.max_credits)
  }
})
