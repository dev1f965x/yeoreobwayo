# 6. Guess the expiry from what it is

Status: accepted
Date: 2026-09-23

## Context

Most of what goes in a fridge has no printed date worth typing — vegetables, leftovers,
eggs out of a carton. Asking for a date every time is how a person stops using the app;
asking for nothing is how the app stops being useful.

## Decision

Every item is filed under a kind — 채소, 과일, 고기, 생선, 유제품, 달걀, 반찬, 소스, 음료,
냉동, 기타 — and each kind carries a usual shelf life. Choosing the kind fills the date,
which can then be nudged a day at a time or set outright. A name that has been used before
brings back the kind and the shelf life that were used with it, which beats any default.

## Consequences

- An item goes in with two taps and no keyboard beyond its name.
- The guess is stated, not hidden: the date is shown and can be changed, so nobody is
  surprised by it.
- The shelf lives are a table in the code, not a setting, until someone wants to argue with
  one; then it becomes a setting.
