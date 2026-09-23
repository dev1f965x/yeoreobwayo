import { describe, expect, it } from "vitest";
import { addDays } from "./day";
import { eat, freshness, type Item, inOrder, tally, throwOut } from "./fridge";

const TODAY = "2026-09-23";

function item(name: string, expiresOn: string, over: Partial<Item> = {}): Item {
  return {
    id: name,
    name,
    kind: "vegetable",
    count: 1,
    expiresOn,
    addedOn: TODAY,
    ...over,
  };
}

describe("freshness", () => {
  it("calls the day itself and everything after it past", () => {
    expect(freshness(item("우유", addDays(TODAY, -1)), TODAY)).toBe("past");
    expect(freshness(item("우유", TODAY), TODAY)).toBe("today");
  });

  it("gives three days' warning, and nothing before that", () => {
    expect(freshness(item("우유", addDays(TODAY, 3)), TODAY)).toBe("soon");
    expect(freshness(item("우유", addDays(TODAY, 4)), TODAY)).toBe("fine");
  });
});

describe("inOrder", () => {
  it("puts what is past first, then what is close, then the rest", () => {
    const held = [
      item("간장", addDays(TODAY, 100)),
      item("삼겹살", addDays(TODAY, 2)),
      item("상추", addDays(TODAY, -2)),
    ];

    expect(inOrder(held, TODAY).map((each) => each.name)).toEqual(["상추", "삼겹살", "간장"]);
  });

  it("keeps the order things went in when they expire on the same day", () => {
    const held = [
      item("나중", TODAY, { addedOn: "2026-09-22" }),
      item("먼저", TODAY, { addedOn: "2026-09-20" }),
    ];

    expect(inOrder(held, TODAY).map((each) => each.name)).toEqual(["먼저", "나중"]);
  });
});

describe("eat", () => {
  it("takes one away and leaves the rest", () => {
    const [left, gone] = eat([item("달걀", TODAY, { count: 6 })], "달걀", TODAY);

    expect(left[0].count).toBe(5);
    expect(gone).toMatchObject({ name: "달걀", count: 1, why: "eaten" });
  });

  it("empties the fridge of the last one", () => {
    const [left, gone] = eat([item("우유", TODAY)], "우유", TODAY);

    expect(left).toEqual([]);
    expect(gone?.count).toBe(1);
  });

  it("does nothing to something that is not there", () => {
    const held = [item("우유", TODAY)];
    const [left, gone] = eat(held, "없는것", TODAY);

    expect(left).toEqual(held);
    expect(gone).toBeUndefined();
  });
});

describe("throwOut", () => {
  it("takes the whole entry and counts every unit as waste", () => {
    const [left, gone] = throwOut([item("애호박", TODAY, { count: 3 })], "애호박", TODAY);

    expect(left).toEqual([]);
    expect(gone).toMatchObject({ count: 3, why: "thrown" });
  });
});

describe("tally", () => {
  it("counts what was eaten apart from what was wasted, since a day", () => {
    const gone = [
      { id: "1", name: "우유", kind: "dairy", count: 2, on: "2026-09-10", why: "eaten" },
      { id: "2", name: "상추", kind: "vegetable", count: 1, on: "2026-09-20", why: "thrown" },
      { id: "3", name: "달걀", kind: "egg", count: 4, on: "2026-09-21", why: "eaten" },
    ] as const;

    expect(tally(gone, "2026-09-15")).toEqual({ eaten: 4, thrown: 1 });
  });
});
