# Quality Assurance Record

## Automated checks

On 2026-09-26, `npm run check` passed TypeScript, ESLint, 16 course logic tests,
and 20 existing Jest tests. These checks do not establish visual correctness.

## Earlier functional baseline

The existing learning notebook, Lesson 6, records Android observations for search,
combined semester/department filters, empty/reset states, details, prerequisite
expansion, child/parent navigation, and preserving the query after Back. This
section summarizes that earlier record; those complete flows were not all repeated
as part of the appearance update.

## Blue theme and responsive layout: 2026-09-26

Environment: Pixel_7_Pro Android emulator, Expo development build.

- Normal light mode: inspected the catalogue, search field, filter buttons, credit
  badges, and full course titles. The list scrolled successfully.
- Narrow display: configured 1080x1920 pixels at 540dpi, giving 320dp logical width,
  with system font scale 1.3. Restarted the app after changing system settings.
- Dark mode: observed navy surfaces, light text, and blue accents.
- Filter buttons initially wrapped their labels awkwardly. They now occupy separate
  rows below 360dp or at font scale 1.3 and above; inspected the corrected layout.
- Searched for comp2011 and observed four semester records. Scrolled to results,
  opened the Fall course, and inspected its wrapping title and metadata.
- Keyboard input was exercised with the emulator's floating input toolbar. A normal
  docked software keyboard and its viewport occlusion remain unverified.
- Live display/font changes initially left stale text measurements; restarting the
  development app resolved them. Seamless changes while running remain unverified.
- Restored the original physical resolution/density, font scale 1.0, light mode,
  and hardware-keyboard setting. Relaunched and inspected the light catalogue.

Representative calculated contrast ratios: blue #1D4ED8 on white 6.70:1;
dark-mode blue #93B4FF on #152238 7.75:1. These are selected color pairs, not a
complete accessibility audit.

## Repeatable manual review

1. Search by compact and spaced code, then by title.
2. Combine semester and department filters; test an empty combination and Reset.
3. Open a course, expand prerequisites, open a child, and navigate Back twice.
4. Repeat with large system text and a narrow display; scroll all content.
5. Show a docked software keyboard and verify results remain reachable.
6. Review light/dark modes, screen-reader labels, and touch targets.

## Remaining coverage

iOS, physical devices, tablet rendering, screen-reader operation, docked keyboard
behavior, extreme font sizes, live system-setting transitions, release performance,
and standalone offline startup remain pending. The configured maximum column width
is an implementation rule, not evidence of tablet testing.
