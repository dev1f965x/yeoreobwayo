import { type Day, daysBetween } from "./day";
import type { Kind } from "./kinds";

/** One thing in the fridge, as many of it as were bought. */
export interface Item {
  id: string;
  name: string;
  kind: Kind;
  count: number;
  expiresOn: Day;
  addedOn: Day;
  /** Where its picture is kept, when one was taken (ADR 4). */
  photo?: string;
}

/** One unit that left the fridge, and whether it was worth buying. */
export interface Gone {
  id: string;
  name: string;
  kind: Kind;
  count: number;
  on: Day;
  why: "eaten" | "thrown";
}

/** How close a thing is to the day it should not be eaten past. */
export type Freshness = "past" | "today" | "soon" | "fine";

/** Three days is how far ahead a person plans dinner, so it is what counts as soon. */
export const SOON_DAYS = 3;

export function daysLeft(item: Item, today: Day): number {
  return daysBetween(today, item.expiresOn);
}

export function freshness(item: Item, today: Day): Freshness {
  const left = daysLeft(item, today);
  if (left < 0) return "past";
  if (left === 0) return "today";
  return left <= SOON_DAYS ? "soon" : "fine";
}

/** What has to go first, first — and among equals, what came in first. */
export function inOrder(items: readonly Item[], today: Day): Item[] {
  return [...items].sort(
    (one, other) =>
      daysLeft(one, today) - daysLeft(other, today) ||
      one.addedOn.localeCompare(other.addedOn) ||
      one.name.localeCompare(other.name, "ko"),
  );
}

/** One of them was eaten; the last one leaves the fridge. */
export function eat(items: readonly Item[], id: string, on: Day): [Item[], Gone?] {
  const item = items.find((each) => each.id === id);
  if (!item) return [[...items]];

  const gone: Gone = { id, name: item.name, kind: item.kind, count: 1, on, why: "eaten" };
  if (item.count <= 1) return [items.filter((each) => each.id !== id), gone];

  return [items.map((each) => (each.id === id ? { ...each, count: each.count - 1 } : each)), gone];
}

/** It went off. Whatever is left of it leaves at once, and is counted as waste. */
export function throwOut(items: readonly Item[], id: string, on: Day): [Item[], Gone?] {
  const item = items.find((each) => each.id === id);
  if (!item) return [[...items]];

  return [
    items.filter((each) => each.id !== id),
    { id, name: item.name, kind: item.kind, count: item.count, on, why: "thrown" },
  ];
}

/** How much was eaten and how much was thrown out since a day, counted in units. */
export function tally(gone: readonly Gone[], since: Day): { eaten: number; thrown: number } {
  let eaten = 0;
  let thrown = 0;

  for (const each of gone) {
    if (each.on < since) continue;
    if (each.why === "eaten") eaten += each.count;
    else thrown += each.count;
  }

  return { eaten, thrown };
}
