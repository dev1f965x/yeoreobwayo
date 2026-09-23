import { describe, expect, it } from "vitest";
import type { Remembered } from "./names";
import { recall, remember, suggest } from "./names";

const NAMES: Remembered[] = [
  { name: "우유", kind: "dairy", days: 10, usedOn: "2026-09-20" },
  { name: "저지방 우유", kind: "dairy", days: 9, usedOn: "2026-09-22" },
  { name: "삼겹살", kind: "meat", days: 3, usedOn: "2026-09-21" },
];

describe("recall", () => {
  it("brings back what was said about the same name", () => {
    expect(recall(NAMES, " 우유 ")).toMatchObject({ kind: "dairy", days: 10 });
  });

  it("knows nothing about a name typed for the first time", () => {
    expect(recall(NAMES, "두부")).toBeUndefined();
  });
});

describe("suggest", () => {
  it("offers names that start with what is typed before names that merely contain it", () => {
    expect(suggest(NAMES, "우").map((each) => each.name)).toEqual(["우유", "저지방 우유"]);
  });

  it("does not offer back the name already typed in full", () => {
    expect(suggest(NAMES, "우유").map((each) => each.name)).toEqual(["저지방 우유"]);
  });

  it("offers nothing for an empty field", () => {
    expect(suggest(NAMES, "  ")).toEqual([]);
  });
});

describe("remember", () => {
  it("keeps the newest answer for a name, once", () => {
    const learnt = remember(
      NAMES,
      { name: "우유", kind: "drink", addedOn: "2026-09-23", expiresOn: "2026-09-30" },
      7,
    );

    expect(learnt.filter((each) => each.name === "우유")).toHaveLength(1);
    expect(learnt[0]).toMatchObject({ name: "우유", kind: "drink", days: 7 });
  });
});
