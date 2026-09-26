# HKUST Course Explorer

An Expo and React Native course explorer built incrementally from the Ignite starter.
The current app displays local course records with code/title search and combined
semester/department filters, semester-specific details, and an expandable prerequisite
explorer with links to referenced courses.

## Run the current app

Use Node.js and the existing Yarn Classic lockfile:

```bash
npx --yes yarn@1.22.22 install --frozen-lockfile
npm run data:prepare
npx expo run:android --device
```

The first Android build requires a configured JDK, Android SDK, and an emulator or
connected device. For subsequent JavaScript-only changes, run
`npx expo start --dev-client`. The starter's native dependencies require a development
build. The original starter was launched successfully on an Android emulator; the
catalogue, semester/department filters, empty/reset states, details, prerequisite
expansion, and Back navigation were also checked on that Android development build.
iOS has not been tested; see docs/QA.md for remaining coverage.

## Local course data

Keep the supplied `courses.json` in the repository root. Run `npm run data:prepare`
after replacing it. Commit the generated files in `app/data/generated/` alongside
source changes; do not edit them manually.

The supplied file contains 15,178 semester-specific records across four terms.
The preparation script validates required fields and credit ranges, rejects duplicate
semester/course keys, and produces a compact list model. All records are retained.
The original file is 28,878,583 bytes; the generated list file is 2,752,545 bytes.
These are file sizes, not measurements of application memory or launch performance.

The list imports generated summaries containing course code, title, department,
semester, and minimum/maximum credits. Detailed text is generated separately by term
and accessed only when a detail page for that term is visited. Data preparation runs
in Node.js on the development machine, not on the phone.

`CourseListScreen` uses a `FlatList` inside a non-scrolling `Screen`. The list
virtualizes its rows; the summary array itself is still loaded in full. A row's
identity combines `term_code` and `id` because course IDs repeat across semesters.
Sorting uses descending term codes, then course codes, then keys. This chronological
term ordering is based on the supplied dataset's term-code format. A semester record
is not proof that a class section is scheduled or has seats available.

Navigation uses React Navigation; appearance uses the starter's theme context.
Dataset summary types are in
`app/data/courseTypes.ts`, transformation logic is in `scripts/course-data.ts`, and
the app-facing data export is in `app/data/courses.ts`.

## Search and filters

The screen stores the search query, selected term code, and selected department in
React state. `null` means all semesters/departments. Results are derived with
`useMemo`, not maintained as a second independent state value. Changing criteria
returns the list to the top; Reset clears all three criteria.

`app/data/courseSearch.ts` builds lowercase search strings once at module load.
They contain the spaced code, compact code, and title. The query is case-insensitive,
trimmed, and split on whitespace; every query token must occur somewhere in that
combined text. Thus `COMP2011` and `comp 2011` both match the expected code, and title
words may appear in any order. This is substring matching, not fuzzy or exact-code
matching. Search does not include descriptions or prerequisite text yet.

The search query, semester, and department use AND semantics. Options are derived
from the full dataset (four semesters and 72 departments), so selections remain
stable even when a combination has no results. Department uses `department_code`,
not the course prefix: for example, COMP 2011 belongs to CSE. Semester options are
newest-first and departments alphabetical. Scrollable selection modals support
Cancel and Android Back without changing the selection, plus an explicit All option.
State is local to the screen and is not persisted across a fresh app launch.

Filtering scans the prepared index in O(n) record visits for a fixed query. It still
runs synchronously on the JavaScript thread; `useMemo` is not a worker or debounce.
A local 50-query Node.js check measured approximately 0.55 ms median and 0.66 ms p95
on 15,178 records. This does not measure mobile rendering or typing responsiveness.

## Course details and navigation

Tapping a card navigates with `{ courseKey: "2610:007920" }`, rather than passing an
entire course object. `CourseDetailsScreen` looks up that exact semester/course key
using `getCourseDetails`. It displays the description, credits/range, semester,
department, campus, and raw prerequisite text. Corequisites, exclusions, and
recommended background are shown when present. Empty prerequisites are described as
"No prerequisites listed", not treated as a verified eligibility decision.

Back returns to the existing list screen, preserving its in-memory query, filters,
and scroll position during normal stack navigation. A direct detail link without
history can return to the catalogue via the on-screen button. Unknown/stale keys
show a recoverable "Course not found" state. Links use `courses/:courseKey`.

The generated detail loader uses literal `require` paths so Metro can include the
files without requesting a server. Each term's JSON module is evaluated when first
accessed and cached by the runtime. All term modules remain included in the app
bundle: this is deferred evaluation, not a reduction in download size. Loading is
synchronous and first-visit latency still needs device measurement. The four detail
files contain 2,139,393; 2,271,026; 2,290,874; and 2,381,181 bytes respectively for
terms 2520, 2530, 2540, and 2610.

## Prerequisite explorer

The detail screen lists direct references and lets users expand their prerequisites
or open their details. Navigation uses `push` so Back returns to the previous course.
Empty text is labelled "No prerequisites listed"; nonempty conditions without course
codes remain visible with a separate no-references message.

`app/data/prerequisites.ts` extracts four-letter prefixes and three/four-digit numbers
with optional letter suffixes, numeric ranges, and slash shorthand such as
`LIFS 2040/2210`. It normalizes case and deduplicates references per parent. A regression
check excludes academic-year wording such as `from 2011-12`. This heuristic is not
an eligibility parser; unusual shorthand may be missed. Original AND/OR conditions,
grades, and permission text remain visible at every level.

References resolve only within the current semester through a term/code map. The
supplied dataset has unique term/code pairs. Missing historical codes are labelled
unavailable rather than silently replaced with another semester's data.

Children are resolved and mounted only when expanded. Each branch carries its own
ancestor keys: a repeated key on that path stops expansion as a cycle. Shared courses
on different paths remain independently explorable. Eight levels may be expanded;
the next level shows a limit message and a detail link to continue from a new root.
No entire graph is recursively constructed at startup. Explicit level labels avoid
deep indentation squeezing text on a narrow display.

## Checks

```bash
npm run compile
npm run lint:check
npm run test:data
npm run test:search
npm run test:details
npm run test:prerequisites
```

The data checks use Node's test runner separately from the starter's Jest tests.
They cover repeated courses across semesters, credit ranges, duplicate identities,
malformed records, and an empty dataset.
Search checks cover code/title normalization, combined filters, reset/empty results,
stable source order, and distinct department options. Full-dataset checks confirmed
15,178 unfiltered records and 3,928 records for term 2610.
Detail checks cover semester isolation, raw prerequisite wording, empty text,
malformed data, invalid course keys, and equality of all generated detail records
with their original source fields.
An offline Expo Android bundle export passed after adding detail navigation and
the generated loaders. The device scenarios observed in the subsequent QA session
and remaining visual/performance coverage are listed in docs/QA.md.
Prerequisite checks cover extraction, historical codes, shorthand, duplicate references,
free-form conditions, missing nodes, self/indirect cycles, shared descendants, depth
limits, and real semester-specific resolution.

## Quality assurance

Run `npm run check` for type checking, linting, all 16 course logic tests, and the
20 existing Jest tests. See [QA record](docs/QA.md) for device observations, repeatable
scenarios, and pending platform/performance coverage.

## Credits

Built from the USThing technical-test template using the
[Infinite Red Ignite starter](https://github.com/infinitered/ignite).
The supplied course dataset is based on the public UST Archive catalogue.
