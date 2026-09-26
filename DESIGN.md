# Design

## Source of truth
- Status: Active. Last refreshed: 2026-09-26.
- Surfaces: catalogue, filters, course details, prerequisite explorer.
- Evidence: app/screens, app/components, app/theme, README.md, docs/QA.md and prior Android screenshots. No existing design brief or brand assets found.

## Brand
- User direction: blue theme. Assumption: calm, clear academic utility.
- Trust: explicit semester, accurate source wording, honest missing-data states.
- Avoid: decorative imagery, heavy shadows, fixed-height text, ambiguous eligibility claims.

## Product goals
- Make course discovery and prerequisite exploration readable and efficient.
- Non-goals: redesigning data logic, authentication or timetable features.
- Success: essential content remains reachable on small screens and with large text/keyboard.

## Personas and jobs
- HKUST students finding courses and understanding prerequisites.
- Primary context: portrait phones; secondary: tablets and larger text settings.

## Information architecture
- Catalogue -> course detail -> prerequisite detail -> Back.
- Hierarchy: course code, title, credits/semester, descriptive content.

## Design principles
- Use blue for actions and identity, neutral surfaces for long reading.
- Preserve full titles and prerequisite wording; allow wrapping and scrolling.
- Tradeoff: one readable column on tablets instead of dense grids.

## Visual language
- Light: blue #1D4ED8, pale blue #EAF1FF, cool background #F3F6FC, white cards.
- Dark: navy background #0B1220, slate surface #152238, blue #93B4FF accents.
- Existing Space Grotesk typography; 32/40 page headings, 20/28 course codes, 16/24 body.
- Spacing: existing 8/12/16/24 tokens. Cards 16px radius, buttons 12px.
- Minimal motion and no decorative animations or new imagery.

## Components
- Extend existing Text, TextField, Button, Screen and theme system.
- Catalogue cards: blue code, credit badge, full title and semester metadata.
- Filters: wrapping triggers, blue selected state, scrollable choices.
- Details: pale-blue introduction and separate white reading panels.
- Theme tokens own surface, accent background, primary action and on-primary colors.

## Accessibility
- Target readable contrast (4.5:1 body text) and at least 48dp touch targets.
- Preserve font scaling, accessibility labels and selected/expanded states.
- Color is accompanied by text or selected marks; no essential motion.
- Keyboard dismisses on scrolling or submission; scrolling must expose results.

## Responsive behavior
- All widths: flexible single-column layout, 16dp gutters, max readable width 760dp.
- Search/filter header scrolls with FlatList, not a fixed block that can consume the viewport.
- Filters/badges wrap; titles and buttons grow with text. No fixed row heights.
- Filter triggers use a full row below 360dp or at font scales of 1.3 and above.
- Detail and picker content scrolls; no nested vertical ScrollView around FlatList.
- App remains portrait as configured; arbitrary rotation is not newly promised.

## Interaction states
- Local data loads synchronously as documented; no fake loading delays.
- Empty: useful reset guidance; missing detail/reference: clear recovery.
- Pressed buttons/cards change appearance; selected filters have blue treatment and text.
- No live course API; development Metro connectivity is separate from data availability.

## Content voice
- Concise English UI; explicit semester and prerequisite semantics.
- Use course records, not unique courses, for multi-semester counts.

## Implementation constraints
- React Native / Expo, existing themed styles, no new UI library.
- Retain FlatList virtualization and existing search/navigation behavior.
- Validate with npm run check and Android screenshots at normal and enlarged text/smaller display.
- Restore emulator display/theme settings after testing. iOS remains untested.

## Open questions
- No blocking design questions. Physical-device and iOS validation remain future coverage.
