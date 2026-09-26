import assert from "node:assert/strict"
import { test } from "node:test"

import { findCourseInTerm } from "../app/data/courseDetails"
import type { CourseDetails } from "../app/data/courseTypes"
import {
  extractPrerequisiteCodes,
  getPrerequisiteBranches,
  MAX_PREREQUISITE_DEPTH,
} from "../app/data/prerequisites"

function course(code: string, prerequisite: string): CourseDetails {
  return {
    key: `2610:${code}`,
    code,
    prerequisite,
    title: code,
    termCode: "2610",
    termName: "2026-27 Fall",
    department: "COMP",
    minCredits: 3,
    maxCredits: 3,
    description: "",
    corequisite: "",
    exclusion: "",
    background: "",
    campus: "CWB",
  }
}

test("extracts mixed case, suffixes, parentheses, slash shorthand, and duplicate references", () => {
  assert.deepEqual(
    extractPrerequisiteCodes("(comp2012h OR COMP 1022P) AND LIFS 2040/2210; COMP 2012H"),
    ["COMP 2012H", "COMP 1022P", "LIFS 2040", "LIFS 2210"],
  )
  assert.deepEqual(extractPrerequisiteCodes("AESF 6910-6920"), ["AESF 6910-6920"])
  assert.deepEqual(extractPrerequisiteCodes("COMP 12345"), [])
  assert.deepEqual(
    extractPrerequisiteCodes("FINA 790I prior to 2011-12; FINA 7900A from 2011-12"),
    ["FINA 790I", "FINA 7900A"],
  )
})

test("empty and non-course requirements have no extracted course links", () => {
  assert.deepEqual(extractPrerequisiteCodes(""), [])
  assert.deepEqual(
    extractPrerequisiteCodes("Level 3 in HKDSE Mathematics or instructor approval"),
    [],
  )
})

test("stops self-cycles and indirect cycles while allowing shared courses on separate paths", () => {
  const a = course("COMP 1000", "COMP 2000 OR COMP 3000")
  const b = course("COMP 2000", "COMP 4000")
  const c = course("COMP 3000", "COMP 4000")
  const d = course("COMP 4000", "COMP 1000")
  const all = new Map([a, b, c, d].map((entry) => [entry.code, entry]))
  const resolve = (_term: string, code: string) => all.get(code)
  assert.equal(getPrerequisiteBranches(b, [a.key, b.key], resolve)[0].status, "available")
  assert.equal(getPrerequisiteBranches(c, [a.key, c.key], resolve)[0].status, "available")
  assert.equal(getPrerequisiteBranches(d, [a.key, b.key, d.key], resolve)[0].status, "cycle")
  const self = course("COMP 5000", "COMP 5000")
  assert.equal(getPrerequisiteBranches(self, [self.key], () => self)[0].status, "cycle")
})

test("missing references and long paths terminate with explicit states", () => {
  const root = course("COMP 1000", "COMP 9000")
  assert.equal(getPrerequisiteBranches(root, [root.key], () => undefined)[0].status, "missing")
  const target = course("COMP 9000", "")
  assert.equal(
    getPrerequisiteBranches(root, Array(MAX_PREREQUISITE_DEPTH).fill(root.key), () => target)[0]
      .status,
    "available",
  )
  assert.equal(
    getPrerequisiteBranches(root, Array(MAX_PREREQUISITE_DEPTH + 1).fill(root.key), () => target)[0]
      .status,
    "depth-limit",
  )
})

test("real references resolve only in the selected semester and preserve OR wording", () => {
  const root = findCourseInTerm("2610", "COMP 2011")
  assert.ok(root)
  assert.equal(root.prerequisite, "COMP 1023 OR COMP 1028")
  const branches = getPrerequisiteBranches(root, [root.key], findCourseInTerm)
  assert.deepEqual(
    branches.map((branch) => branch.code),
    ["COMP 1023", "COMP 1028"],
  )
  assert.ok(branches.every((branch) => branch.course?.termCode === "2610"))
  assert.equal(findCourseInTerm("9999", "COMP 2011"), undefined)
})
