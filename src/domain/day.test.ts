import { describe, expect, it } from "vitest";
import { addDays, dayOf, daysBetween } from "./day";

describe("dayOf", () => {
  it("writes the local day, zero-padded so that it sorts", () => {
    expect(dayOf(new Date(2026, 8, 3, 23, 30))).toBe("2026-09-03");
  });
});

describe("addDays", () => {
  it("rolls over the end of a month", () => {
    expect(addDays("2026-09-30", 1)).toBe("2026-10-01");
  });

  it("goes backwards over the end of a year", () => {
    expect(addDays("2027-01-01", -1)).toBe("2026-12-31");
  });

  it("crosses the spring clock change as one whole day", () => {
    expect(addDays("2026-03-28", 1)).toBe("2026-03-29");
  });
});

describe("daysBetween", () => {
  it("counts forwards and backwards", () => {
    expect(daysBetween("2026-09-23", "2026-09-30")).toBe(7);
    expect(daysBetween("2026-09-23", "2026-09-21")).toBe(-2);
  });
});
