import type { Gone, Item } from "../domain/fridge";
import { isKind } from "../domain/kinds";
import type { Remembered } from "../domain/names";

const ITEMS = "yeoreobwayo.items";
const GONE = "yeoreobwayo.gone";
const NAMES = "yeoreobwayo.names";

/** Where the fridge lives: this device, and nowhere else (ADR 4). */
export interface Store {
  readItems(): Item[];
  writeItems(items: readonly Item[]): void;
  readGone(): Gone[];
  writeGone(gone: readonly Gone[]): void;
  readNames(): Remembered[];
  writeNames(names: readonly Remembered[]): void;
}

export const localStore: Store = {
  readItems: () => itemsFrom(read(ITEMS)),
  writeItems: (items) => write(ITEMS, items),
  readGone: () => goneFrom(read(GONE)),
  writeGone: (gone) => write(GONE, gone),
  readNames: () => namesFrom(read(NAMES)),
  writeNames: (names) => write(NAMES, names),
};

function read(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]");
  } catch {
    // Blocked or full storage is reported as an empty fridge rather than as an error.
    return [];
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

/**
 * Keeps only what this build understands.
 *
 * An entry written by another version, or edited by hand, is dropped on its own rather
 * than failing the read.
 */
export function itemsFrom(stored: unknown): Item[] {
  if (!Array.isArray(stored)) return [];

  return stored.flatMap((entry) => {
    if (!isRecord(entry)) return [];
    const { id, name, kind, count, expiresOn, addedOn, photo } = entry;
    if (typeof id !== "string" || typeof name !== "string" || name.trim() === "") return [];
    if (!isKind(kind) || typeof expiresOn !== "string" || typeof addedOn !== "string") return [];

    return [
      {
        id,
        name,
        kind,
        count: typeof count === "number" && count > 0 ? Math.round(count) : 1,
        expiresOn,
        addedOn,
        photo: typeof photo === "string" ? photo : undefined,
      },
    ];
  });
}

export function goneFrom(stored: unknown): Gone[] {
  if (!Array.isArray(stored)) return [];

  return stored.flatMap((entry) => {
    if (!isRecord(entry)) return [];
    const { id, name, kind, count, on, why } = entry;
    if (typeof id !== "string" || typeof name !== "string" || !isKind(kind)) return [];
    if (typeof on !== "string" || (why !== "eaten" && why !== "thrown")) return [];

    return [{ id, name, kind, count: typeof count === "number" ? count : 1, on, why }];
  });
}

export function namesFrom(stored: unknown): Remembered[] {
  if (!Array.isArray(stored)) return [];

  return stored.flatMap((entry) => {
    if (!isRecord(entry)) return [];
    const { name, kind, days, usedOn } = entry;
    if (typeof name !== "string" || !isKind(kind) || typeof usedOn !== "string") return [];

    return [{ name, kind, days: typeof days === "number" && days >= 0 ? days : 7, usedOn }];
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
