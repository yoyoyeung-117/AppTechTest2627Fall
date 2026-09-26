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
new prerequisite interactions still need manual device review. iOS has not been tested.

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
the generated loaders. Device navigation and visual checks remain pending.
Prerequisite checks cover extraction, historical codes, shorthand, duplicate references,
free-form conditions, missing nodes, self/indirect cycles, shared descendants, depth
limits, and real semester-specific resolution.

## Original Ignite starter documentation

> The latest and greatest boilerplate for Infinite Red opinions

This is the boilerplate that [Infinite Red](https://infinite.red) uses as a way to test bleeding-edge changes to our React Native stack.

- [Quick start documentation](https://github.com/infinitered/ignite/blob/master/docs/boilerplate/Boilerplate.md)
- [Full documentation](https://github.com/infinitered/ignite/blob/master/docs/README.md)

## Getting Started

```bash
yarn install
yarn start
```

To make things work on your local simulator, or on your phone, you need first to [run `eas build`](https://github.com/infinitered/ignite/blob/master/docs/expo/EAS.md). We have many shortcuts on `package.json` to make it easier:

```bash
yarn build:ios:sim # build for ios simulator
yarn build:ios:device # build for ios device
yarn build:ios:prod # build for ios device
```

### `./assets`

This directory is designed to organize and store various assets, making it easy for you to manage and use them in your application. The assets are further categorized into subdirectories, including `icons` and `images`:

```tree
assets
├── icons
└── images
```

**icons**
This is where your icon assets will live. These icons can be used for buttons, navigation elements, or any other UI components. The recommended format for icons is PNG, but other formats can be used as well.

Ignite comes with a built-in `Icon` component. You can find detailed usage instructions in the [docs](https://github.com/infinitered/ignite/blob/master/docs/boilerplate/app/components/Icon.md).

**images**
This is where your images will live, such as background images, logos, or any other graphics. You can use various formats such as PNG, JPEG, or GIF for your images.

Another valuable built-in component within Ignite is the `AutoImage` component. You can find detailed usage instructions in the [docs](https://github.com/infinitered/ignite/blob/master/docs/Components-AutoImage.md).

How to use your `icon` or `image` assets:

```typescript
import { Image } from 'react-native';

const MyComponent = () => {
  return (
    <Image source={require('assets/images/my_image.png')} />
  );
};
```

## Running Maestro end-to-end tests

Follow our [Maestro Setup](https://ignitecookbook.com/docs/recipes/MaestroSetup) recipe.

## Next Steps

### Ignite Cookbook

[Ignite Cookbook](https://ignitecookbook.com/) is an easy way for developers to browse and share code snippets (or “recipes”) that actually work.

### Upgrade Ignite boilerplate

Read our [Upgrade Guide](https://ignitecookbook.com/docs/recipes/UpdatingIgnite) to learn how to upgrade your Ignite project.

## Community

⭐️ Help us out by [starring on GitHub](https://github.com/infinitered/ignite), filing bug reports in [issues](https://github.com/infinitered/ignite/issues) or [ask questions](https://github.com/infinitered/ignite/discussions).

💬 Join us on [Slack](https://join.slack.com/t/infiniteredcommunity/shared_invite/zt-1f137np4h-zPTq_CbaRFUOR_glUFs2UA) to discuss.

📰 Make our Editor-in-chief happy by [reading the React Native Newsletter](https://reactnativenewsletter.com/).
