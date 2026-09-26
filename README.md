# HKUST Course Explorer

An Expo and React Native course explorer built incrementally from the Ignite starter.
The current app displays local course records across all supplied semesters. Search,
filters, detail navigation, and prerequisite traversal are not implemented yet.

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
new dataset-backed list still needs manual device review. iOS has not been tested.

## Local course data

Keep the supplied `courses.json` in the repository root. Run `npm run data:prepare`
after replacing it. The generated `app/data/generated/course-summaries.json` should
be committed alongside source changes; do not edit it manually.

The supplied file contains 15,178 semester-specific records across four terms.
The preparation script validates required fields and credit ranges, rejects duplicate
semester/course keys, and produces a compact list model. All records are retained.
The original file is 28,878,583 bytes; the generated list file is 2,752,545 bytes.
These are file sizes, not measurements of application memory or launch performance.

Only the generated summaries are imported into the app. They include course code,
title, department, semester, and minimum/maximum credits. Descriptions and raw
prerequisite text remain in the original dataset for future detail/explorer work.
Data preparation runs in Node.js on the development machine, not on the phone.

`CourseListScreen` uses a `FlatList` inside a non-scrolling `Screen`. The list
virtualizes its rows; the summary array itself is still loaded in full. A row's
identity combines `term_code` and `id` because course IDs repeat across semesters.
Sorting uses descending term codes, then course codes, then keys. This chronological
term ordering is based on the supplied dataset's term-code format. A semester record
is not proof that a class section is scheduled or has seats available.

No mutable list state is needed yet. Navigation uses React Navigation; appearance
uses the starter's theme context. Dataset summary types are in
`app/data/courseTypes.ts`, transformation logic is in `scripts/course-data.ts`, and
the app-facing data export is in `app/data/courses.ts`.

## Checks

```bash
npm run compile
npm run lint:check
npm run test:data
```

The data checks use Node's test runner separately from the starter's Jest tests.
They cover repeated courses across semesters, credit ranges, duplicate identities,
malformed records, and an empty dataset.

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
