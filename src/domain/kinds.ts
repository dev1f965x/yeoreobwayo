/**
 * What sort of thing it is.
 *
 * This is what makes an expiry date guessable, and so the only question the unpacking
 * screen asks beyond the name (ADR 6).
 */
export type Kind =
  | "vegetable"
  | "fruit"
  | "meat"
  | "fish"
  | "dairy"
  | "egg"
  | "side"
  | "sauce"
  | "drink"
  | "frozen"
  | "other";

export const KINDS: readonly Kind[] = [
  "vegetable",
  "fruit",
  "meat",
  "fish",
  "dairy",
  "egg",
  "side",
  "sauce",
  "drink",
  "frozen",
  "other",
];

/**
 * How long each kind usually lasts in a fridge, in days.
 *
 * These sit at the cautious end of published food safety guidance, so that an error asks
 * for something to be eaten early rather than late.
 */
const SHELF_LIFE: Record<Kind, number> = {
  vegetable: 7,
  fruit: 7,
  meat: 3,
  fish: 2,
  dairy: 10,
  egg: 21,
  side: 5,
  sauce: 180,
  drink: 14,
  frozen: 90,
  other: 7,
};

export function shelfLife(kind: Kind): number {
  return SHELF_LIFE[kind];
}

export function isKind(value: unknown): value is Kind {
  return typeof value === "string" && (KINDS as readonly string[]).includes(value);
}
