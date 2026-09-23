# 4. Keep the fridge on the device, photos included

Status: accepted
Date: 2026-09-23

## Context

The app holds what is in someone's fridge and, optionally, a photo of each thing. Photos
are the part that does not fit in the few kilobytes the other apps here store.

## Options

- **An account and a server.** The fridge follows the person and the household could share
  it — and the app grows a backend, a login, a bill, and a place where photos of someone's
  kitchen live.
- **Everything in `localStorage`.** Simple, and photos would blow past its few megabytes.
- **The list in `localStorage`, the photos in IndexedDB.** The list is read at once on
  start; a photo is fetched only when it is shown, and a fridge of a hundred items stays
  a few megabytes because each photo is resized before it is stored.

## Decision

The list in `localStorage`, read defensively; photos in IndexedDB, one record per item,
resized to at most 640px on the long side and stored as JPEG.

## Consequences

- No account, no sync, and no photo of anyone's kitchen anywhere but their own phone.
- A fridge does not follow the person from the phone to the browser, which is the price.
- Deleting an item deletes its photo; nothing is orphaned.
