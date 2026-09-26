import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"

import { buildCourseSummaries } from "./course-data"

const sourcePath = resolve("courses.json")
const outputDirectory = resolve("app/data/generated")
const source = readFileSync(sourcePath, "utf8")
const input: unknown = JSON.parse(source)
const courses = buildCourseSummaries(input)
const output = JSON.stringify(courses) + "\n"

mkdirSync(outputDirectory, { recursive: true })
writeFileSync(resolve(outputDirectory, "course-summaries.json"), output)

console.log(`Prepared ${courses.length} course records.`)
console.log(
  `Source: ${Buffer.byteLength(source)} bytes; summaries: ${Buffer.byteLength(output)} bytes.`,
)
