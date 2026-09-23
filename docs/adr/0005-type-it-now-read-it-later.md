# 5. Type it now, read the receipt later

Status: accepted
Date: 2026-09-23

## Context

The draft of this app began with reading receipts and product photos on the device. That
is the right ambition — the typing is what makes people give up — but it decides the whole
shape of the first version.

## Options

- **On-device text recognition through ML Kit.** Accurate and free, and reachable only from
  Kotlin: it needs a Tauri plugin of its own, and it does not exist for the page at all.
- **Text recognition in the browser** (Tesseract in WebAssembly). Works everywhere, is
  several megabytes, and reads a crumpled Korean receipt badly enough to need correcting
  line by line — which is the typing again, with extra steps.
- **A barcode and a product database.** The barcode is easy; the database is a network
  service, a key, and a bill, and Korean groceries are poorly covered.
- **Make typing nearly free instead.** One screen, one field, a remembered name, a guessed
  expiry, a quantity that starts at one.

## Decision

1.0.0 makes typing nearly free and reads nothing. Receipts and barcodes are 1.1.0, behind
a plugin, once the rest of the app has earned them.

## Consequences

- The thing that blocks people — putting items in — is solved by the interface rather than
  by a model that may or may not read the receipt.
- What is learned about a name (its usual shelf life) is kept, so the second shop is faster
  than the first.
- When recognition does arrive it fills the same fields this screen does, and the person
  corrects them in the same place.
