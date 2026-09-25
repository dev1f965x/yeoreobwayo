import type { Day } from "./day";
import type { Item } from "./fridge";
import type { Kind } from "./kinds";

/**
 * A name typed before, with the kind and the length it was given.
 *
 * Typing it again then costs one tap, which is what keeps the unpacking screen fast
 * (ADR 5).
 */
export interface Remembered {
  name: string;
  kind: Kind;
  days: number;
  usedOn: Day;
}

export function recall(names: readonly Remembered[], name: string): Remembered | undefined {
  const typed = name.trim();
  return names.find((each) => each.name === typed);
}

/** The names worth offering under what is being typed, most recently used first. */
export function suggest(names: readonly Remembered[], typed: string, limit = 4): Remembered[] {
  const asked = typed.trim();
  if (asked === "") return [];

  return [...names]
    .filter((each) => each.name !== asked && each.name.includes(asked))
    .sort(
      (one, other) =>
        Number(other.name.startsWith(asked)) - Number(one.name.startsWith(asked)) ||
        other.usedOn.localeCompare(one.usedOn),
    )
    .slice(0, limit);
}

/** Keeps what was just put in, so the next time the same thing is bought it comes back. */
export function remember(
  names: readonly Remembered[],
  item: Pick<Item, "name" | "kind" | "addedOn" | "expiresOn">,
  days: number,
): Remembered[] {
  const learnt: Remembered = {
    name: item.name,
    kind: item.kind,
    days,
    usedOn: item.addedOn,
  };
  return [learnt, ...names.filter((each) => each.name !== learnt.name)].slice(0, 300);
}
