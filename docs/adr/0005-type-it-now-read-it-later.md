# 5. Type it now, read the receipt later

Status: accepted
Date: 2026-09-23

## Context

The draft of this app began with reading receipts and product photos on the device.
Typing is what makes people abandon a fridge app, so removing it is the right target, but
the choice decides the shape of the first version.

## Options

- **On-device text recognition through ML Kit.** Accurate and free, but reachable only from
  Kotlin: it needs a Tauri plugin of its own and is unavailable to the page.
- **Text recognition in the browser** (Tesseract in WebAssembly). Works everywhere, weighs
  several megabytes, and reads a creased Korean receipt poorly enough that each line has to
  be corrected by hand.
- **A barcode and a product database.** The barcode is straightforward; the database is a
  network service with a key and a cost, and Korean groceries are poorly covered.
- **Reduce the typing instead.** One screen, one field, a remembered name, a guessed expiry,
  a quantity that starts at one.

## Decision

1.0.0 reduces the typing and reads nothing. Receipts and barcodes are planned for 1.1.0,
behind a plugin.

## Consequences

- What blocks people, putting items in, is addressed by the interface rather than by a
  model whose accuracy is unknown.
- What is learned about a name, its kind and usual shelf life, is kept, so the second shop
  is faster than the first.
- Recognition, when it arrives, fills the same fields this screen does and is corrected in
  the same place.
