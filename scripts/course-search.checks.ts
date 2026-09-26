import assert from "node:assert/strict"
import { test } from "node:test"

import {
  createCourseSearchIndex,
  filterCourses,
  getCourseFilterOptions,
} from "../app/data/courseSearch"
import type { CourseSummary } from "../app/data/courseTypes"

const programming: CourseSummary = {
  key: "2610:1",
  code: "COMP 2011",
  title: "Programming with C++",
  department: "CSE",
  termCode: "2610",
  termName: "2026-27 Fall",
  minCredits: 4,
  maxCredits: 4,
}
const courses: CourseSummary[] = [
  programming,
  { ...programming, key: "2530:1", termCode: "2530", termName: "2025-26 Spring" },
  { ...programming, key: "2610:2", code: "MATH 1011", title: "Calculus I", department: "MATH" },
]
const index = createCourseSearchIndex(courses)
const all = { query: "", termCode: null, department: null }

test("search matches spaced and compact codes, case, whitespace, and title words", () => {
  for (const query of ["comp2011", "  CoMp   2011 ", "PROGRAMMING", "C++ programming"]) {
    assert.deepEqual(filterCourses(index, { ...all, query }), courses.slice(0, 2))
  }
  assert.deepEqual(filterCourses(index, { ...all, query: "calculus" }), [courses[2]])
})

test("search, semester, and department must all match", () => {
  assert.deepEqual(
    filterCourses(index, { query: "comp2011", termCode: "2610", department: "CSE" }),
    [programming],
  )
  assert.deepEqual(
    filterCourses(index, { query: "comp2011", termCode: "2610", department: "MATH" }),
    [],
  )
  assert.deepEqual(filterCourses(index, { ...all, termCode: "2530" }), [courses[1]])
  assert.deepEqual(filterCourses(index, { ...all, department: "MATH" }), [courses[2]])
})

test("empty queries and reset restore records without changing source order", () => {
  assert.deepEqual(filterCourses(index, { ...all, query: " \t " }), courses)
  assert.deepEqual(filterCourses(index, { ...all, query: "not-a-course" }), [])
  assert.deepEqual(filterCourses(index, all), courses)
  assert.deepEqual(filterCourses([], all), [])
  assert.deepEqual(
    courses.map((course) => course.key),
    ["2610:1", "2530:1", "2610:2"],
  )
})

test("filter options are unique, sorted, and use department rather than course prefix", () => {
  const { semesterOptions, departmentOptions } = getCourseFilterOptions(courses)
  assert.deepEqual(semesterOptions, [
    { value: null, label: "All semesters" },
    { value: "2610", label: "2026-27 Fall" },
    { value: "2530", label: "2025-26 Spring" },
  ])
  assert.deepEqual(departmentOptions, [
    { value: null, label: "All departments" },
    { value: "CSE", label: "CSE" },
    { value: "MATH", label: "MATH" },
  ])
  assert.equal(getCourseFilterOptions([]).semesterOptions.length, 1)
})
