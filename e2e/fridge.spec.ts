import { expect, test } from "@playwright/test";
import { day, openApp, stored } from "./app";

const milk = {
  id: "1",
  name: "우유",
  kind: "dairy",
  count: 2,
  expiresOn: day(2),
  addedOn: day(-1),
};

test("a first visit asks for the shopping, and takes it one thing at a time", async ({ page }) => {
  await openApp(page);
  await expect(page.getByText("아직 비어 있어요")).toBeVisible();

  await page.getByRole("button", { name: "장 본 것 담기" }).click();
  await page.getByLabel("이름").fill("애호박");
  await page.getByRole("button", { name: "넣기" }).click();

  await expect(page.getByText(/애호박 넣었어요/)).toBeVisible();
  await page.getByLabel("이름").fill("달걀");
  await page.getByRole("button", { name: "달걀", exact: true }).click();
  await page.getByRole("button", { name: "넣기" }).click();
  await page.getByRole("button", { name: "다 넣었어요" }).click();

  await expect(page.getByText("애호박")).toBeVisible();
  await expect
    .poll(() => stored(page, "items"))
    .toMatchObject([
      { name: "애호박", kind: "vegetable" },
      { name: "달걀", kind: "egg" },
    ]);
});

test("the fridge survives a reload, sorted by what has to go first", async ({ page }) => {
  await openApp(page, [
    { ...milk, id: "2", name: "간장", kind: "sauce", expiresOn: day(100) },
    { ...milk, name: "상추", kind: "vegetable", expiresOn: day(-1) },
  ]);

  await page.reload();

  const names = page.locator(".item__name");
  await expect(names.first()).toHaveText(/상추/);
  await expect(page.getByText("어제까지였어요")).toBeVisible();
});

test("eating one leaves the rest, and can be taken back", async ({ page }) => {
  await openApp(page, [milk]);

  await page.getByRole("button", { name: "우유 먹음" }).click();
  await expect(page.locator(".item__count")).toHaveCount(0);
  await expect.poll(() => stored(page, "gone")).toMatchObject([{ why: "eaten", count: 1 }]);

  await page.getByRole("button", { name: "되돌리기" }).click();

  await expect(page.locator(".item__count")).toHaveText("2개");
  await expect.poll(() => stored(page, "gone")).toEqual([]);
});

test("a name typed before comes back with what was said about it", async ({ page }) => {
  await openApp(page, [], [{ name: "우유", kind: "dairy", days: 5, usedOn: day(-10) }]);

  await page.getByRole("button", { name: "장 본 것 담기" }).click();
  await page.getByLabel("이름").fill("우유");

  await expect(page.getByText("지난번엔 유제품으로 담았어요")).toBeVisible();
  await expect(page.getByText("5일 남았어요")).toBeVisible();
});

test("the recipes put what the fridge can already make first", async ({ page }) => {
  await openApp(page, [
    { ...milk, id: "3", name: "달걀", kind: "egg", count: 6, expiresOn: day(14) },
    { ...milk, id: "4", name: "대파", kind: "vegetable", count: 1, expiresOn: day(2) },
  ]);

  await page.getByRole("button", { name: "레시피" }).click();

  const first = page.getByRole("listitem").first();
  await expect(first.getByText("지금 바로")).toBeVisible();
  await expect(first.getByText(/쓰기 좋아요/)).toBeVisible();
});
