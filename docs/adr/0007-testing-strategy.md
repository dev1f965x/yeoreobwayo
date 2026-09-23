# 7. Testing strategy

Status: accepted
Date: 2026-09-23

## Context

The risky parts are the arithmetic — when something goes off, what a recipe is missing,
how the list is sorted — and the states the screen shows while the shopping is unpacked.
None of them needs a fridge, a camera, or a phone to be tested.

## Decision

- **Vitest and Testing Library** for the domain — freshness, shelf lives, recipe scoring
  and ordering — and for the screens, with the clock fixed by the test.
- **Playwright** against the real page for the flows that cross components: unpack three
  things, eat one, see the recipes reorder.
- The photo store is tested against a stand-in, since IndexedDB is the browser's and not
  this app's to prove.
- Every one of them runs in CI on each pull request.

## Consequences

- Today is a parameter everywhere it is read, so a test can stand on any date and nothing
  is flaky.
- The camera and the APK are checked by hand on a phone before a release.
