# 6. Guess the expiry from what it is

Status: accepted
Date: 2026-09-23

## Context

Most of what goes in a fridge has no printed date worth typing: vegetables, leftovers,
eggs out of a carton. Asking for a date every time costs too much to keep up; asking for
nothing leaves the app with no expiry to sort by.

## Decision

Every item is filed under a kind — 채소, 과일, 고기, 생선, 유제품, 달걀, 반찬, 소스, 음료,
냉동, 기타 — and each kind carries a usual shelf life. Choosing the kind fills the date,
which can then be moved a day at a time or set outright. A name used before brings back the
kind and shelf life it was given, which takes precedence over the default.

## Consequences

- An item goes in with two taps and no keyboard beyond its name.
- The guess is shown rather than applied silently: the date is on screen and can be changed.
- The shelf lives are a table in the code rather than a setting. They become a setting if
  one of them turns out to be wrong for someone.
