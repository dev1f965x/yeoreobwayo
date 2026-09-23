# 2. A page and an Android app, and no desktop

Status: accepted
Date: 2026-09-23

## Context

The app is used standing at the fridge with a shopping bag at your feet, and again at
dinner. That is a phone. It is also worth trying without installing anything, which is a
page.

## Options

- **Android only.** The natural home, and nothing to try before installing.
- **Android and a page, from one code base.** Tauri 2 builds the same interface as a static
  page and as an APK. The page is the trial and the fallback; the APK is the real thing,
  with the camera and the home screen icon.
- **All three, as in the other apps here.** A Windows window would work and nobody would
  open it to unpack shopping. It would still cost an updater key, a signed installer, and
  a release job to maintain.

## Decision

The page and the APK. No Windows build in 1.0.0; the Tauri project can produce one the day
it is wanted.

## Consequences

- One code base, two artefacts, one release.
- The layout is designed for a phone and simply centres on a wide screen.
- There is no in-app update: the page is always current, and an APK is replaced by hand.
