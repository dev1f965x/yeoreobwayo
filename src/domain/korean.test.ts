import { describe, expect, it } from "vitest";
import { about, asA } from "./korean";

describe("asA", () => {
  it("says 로 after a vowel and 으로 after a consonant", () => {
    expect(asA("채소")).toBe("채소로");
    expect(asA("유제품")).toBe("유제품으로");
  });

  it("says 로 after ㄹ, as Korean does", () => {
    expect(asA("과일")).toBe("과일로");
  });
});

describe("about", () => {
  it("says 는 after a vowel and 은 after a consonant", () => {
    expect(about("고기")).toBe("고기는");
    expect(about("달걀")).toBe("달걀은");
  });
});
