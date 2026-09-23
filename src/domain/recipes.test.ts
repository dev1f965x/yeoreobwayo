import { describe, expect, it } from "vitest";
import { addDays } from "./day";
import type { Item } from "./fridge";
import { inCookingOrder, match, type Recipe } from "./recipes";

const TODAY = "2026-09-23";

function item(name: string, days = 30): Item {
  return {
    id: name,
    name,
    kind: "other",
    count: 1,
    expiresOn: addDays(TODAY, days),
    addedOn: TODAY,
  };
}

function recipe(name: string, needs: string[], minutes = 20): Recipe {
  return { id: name, name, needs, seasoning: ["간장"], minutes };
}

describe("match", () => {
  it("counts a cut of pork as pork", () => {
    const found = match(recipe("제육볶음", ["돼지고기"]), [item("삼겹살")], TODAY);

    expect(found.has).toEqual(["돼지고기"]);
    expect(found.missing).toEqual([]);
  });

  it("counts what the fridge calls a thing by a longer name", () => {
    const found = match(recipe("계란말이", ["달걀"]), [item("유정란 계란 한 판")], TODAY);

    expect(found.missing).toEqual([]);
  });

  it("says what is not there", () => {
    const found = match(recipe("김치찌개", ["김치", "두부"]), [item("김치")], TODAY);

    expect(found.missing).toEqual(["두부"]);
  });

  it("marks what is held and about to go as worth using", () => {
    const found = match(recipe("김치전", ["김치"]), [item("김치", 2)], TODAY);

    expect(found.urgent).toEqual(["김치"]);
  });
});

describe("inCookingOrder", () => {
  it("puts what can be cooked now before what needs one more thing", () => {
    const sorted = inCookingOrder(
      [recipe("한 개 모자람", ["달걀", "우유"]), recipe("바로 됨", ["달걀"])],
      [item("달걀")],
      TODAY,
    );

    expect(sorted.map((each) => each.recipe.name)).toEqual(["바로 됨", "한 개 모자람"]);
  });

  it("lifts the one that uses up what is about to go, among equals", () => {
    const sorted = inCookingOrder(
      [recipe("여유 있는 것", ["우유"]), recipe("급한 것", ["달걀"])],
      [item("우유", 20), item("달걀", 1)],
      TODAY,
    );

    expect(sorted.map((each) => each.recipe.name)).toEqual(["급한 것", "여유 있는 것"]);
  });

  it("offers the quicker dish when nothing else separates them", () => {
    const sorted = inCookingOrder(
      [recipe("오래 걸림", ["달걀"], 40), recipe("금방", ["달걀"], 10)],
      [item("달걀")],
      TODAY,
    );

    expect(sorted.map((each) => each.recipe.name)).toEqual(["금방", "오래 걸림"]);
  });
});
