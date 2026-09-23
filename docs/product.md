# 열어봐요 — product definition

## Problem

The fridge is a drawer that hides things. Something was bought twice because nobody could
remember; something else went off behind the milk. The fix everybody knows — write down
what is in there — fails at the same place every time: **putting it in**. Nobody opens an
app after the shopping to type fourteen lines.

## Who it is for

Someone who does the household shopping — living alone or cooking for a family — and wants
two answers without opening the door: **what do I have**, and **what has to be eaten
first**. They are not organised by nature; the app has to be faster than the shame of
throwing food away.

## 1.0.0 scope

The app is built around the two minutes after the shopping, and around dinner.

- **Unpacking.** One screen, one item at a time: take it out of the bag, tap, it is in.
  The name is typed once and remembered; the quantity starts at one; the expiry is guessed
  from what kind of thing it is and can be nudged with one tap. A photo is optional, taken
  with the phone's camera, and is how a thing is recognised later at a glance.
- **The fridge.** Everything held, sorted by what has to go first, with what is past and
  what is close marked plainly. A tap takes one away when it is used up; another says it
  was thrown out, which is different.
- **Recipes.** A short list of everyday dishes, sorted by how much of each is already in
  the fridge: what can be cooked right now, and what needs one or two more things. What is
  missing becomes a shopping list, and a recipe prefers what is about to go off.
- **Two places.** A page in the browser and an app on Android, from one code base. Nothing
  leaves the device.

## Acceptance criteria

- Ten items go in, from an empty fridge, in under two minutes without leaving the screen.
- A name typed once is offered the next time it is typed, with the expiry that was used.
- The fridge is sorted with what is past at the top, then what is close, then the rest.
- An item eaten drops its count; its last unit leaves the fridge; something thrown out
  leaves it the same way and is recorded as waste rather than as a meal.
- The recipe list puts "can be cooked now" first, then one missing thing, then two, and
  each says what is missing.
- A recipe that uses something expiring within three days is lifted above one that does
  not, among those with the same number of missing items.
- A photo taken on a phone is kept small enough that a fridge of a hundred items is still
  a few megabytes.
- Everything survives a restart, and clearing the browser's data is the only way to lose it.

## Non-goals

- No account, no sync between phone and browser, no sharing a fridge with the family in
  1.0.0. The kitchen is one device's problem until the app earns more.
- No barcode database and no receipt reading in 1.0.0 (ADR 5): both need either a network
  service or a native model, and neither is worth delaying the thing that actually blocks
  people — putting the items in.
- No nutrition, no calories, no meal planning for the week.
- No notifications in 1.0.0. The app is opened when the fridge is opened.

## Non-functional requirements

- The unpacking screen answers a tap in well under a tenth of a second on a mid-range
  phone; nothing waits on a network, because there is none.
- A photo is resized on the device before it is stored.
- The whole interface is reachable one-handed on a phone, with the primary actions inside
  the thumb's reach.
- Nothing about the person or their shopping leaves the device.

## Roadmap

| Version | Adds |
|---|---|
| 1.0.0 | Unpacking, the fridge, expiry, recipes sorted by what is in it |
| 1.1.0 | Reading a receipt on the device, and a barcode for the name |
| later | A fridge shared with the household, if sync ever earns an account |
