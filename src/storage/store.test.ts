import { describe, expect, it } from "vitest";
import { goneFrom, itemsFrom, namesFrom } from "./store";

describe("itemsFrom", () => {
  it("keeps what it understands and drops the rest, entry by entry", () => {
    const kept = itemsFrom([
      {
        id: "1",
        name: "우유",
        kind: "dairy",
        count: 2,
        expiresOn: "2026-09-30",
        addedOn: "2026-09-23",
      },
      { id: "2", name: "??", kind: "감", expiresOn: "2026-09-30", addedOn: "2026-09-23" },
      "not an item",
    ]);

    expect(kept).toEqual([
      {
        id: "1",
        name: "우유",
        kind: "dairy",
        count: 2,
        expiresOn: "2026-09-30",
        addedOn: "2026-09-23",
        photo: undefined,
      },
    ]);
  });

  it("stands in one for a count that was never written", () => {
    const kept = itemsFrom([
      { id: "1", name: "두부", kind: "other", expiresOn: "2026-09-30", addedOn: "2026-09-23" },
    ]);

    expect(kept[0].count).toBe(1);
  });

  it("gives an empty fridge back for anything that is not a list", () => {
    expect(itemsFrom({ items: [] })).toEqual([]);
  });
});

describe("goneFrom", () => {
  it("drops an entry that says neither eaten nor thrown", () => {
    const kept = goneFrom([
      { id: "1", name: "우유", kind: "dairy", count: 1, on: "2026-09-20", why: "잃어버림" },
      { id: "2", name: "상추", kind: "vegetable", count: 1, on: "2026-09-20", why: "thrown" },
    ]);

    expect(kept.map((each) => each.id)).toEqual(["2"]);
  });
});

describe("namesFrom", () => {
  it("falls back to a week for a length that makes no sense", () => {
    const kept = namesFrom([{ name: "우유", kind: "dairy", days: -3, usedOn: "2026-09-20" }]);

    expect(kept[0].days).toBe(7);
  });
});
