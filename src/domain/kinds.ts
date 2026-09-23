/**
 * What sort of thing it is — the one question that makes an expiry date guessable, and so
 * the only one the unpacking screen asks beyond the name (ADR 6).
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
 * How long each kind usually lasts in a fridge, in days. These are the careful end of what
 * food safety guidance says, because the app's mistake should be asking a person to eat
 * something early, never late.
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
