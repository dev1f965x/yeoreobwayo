import type { Page } from "@playwright/test";

/** Opens the app with a fridge already stored, as someone coming back to it finds it. */
export async function openApp(page: Page, items: unknown[] = [], names: unknown[] = []) {
  // Seeded once, not on every navigation, so a reload sees what the app itself wrote.
  await page.addInitScript(
    ([items, names]) => {
      if (window.localStorage.getItem("yeoreobwayo.items") !== null) return;
      window.localStorage.setItem("yeoreobwayo.items", JSON.stringify(items));
      window.localStorage.setItem("yeoreobwayo.names", JSON.stringify(names));
    },
    [items, names],
  );
  await page.goto("/");
  await page.getByRole("heading", { name: "열어봐요", level: 1 }).waitFor();
}

/** What the app has stored under one of its keys. */
export function stored(page: Page, key: "items" | "gone" | "names") {
  return page.evaluate(
    (key) => JSON.parse(window.localStorage.getItem(`yeoreobwayo.${key}`) ?? "[]"),
    key,
  );
}

/** A day relative to today, written the way the app writes days. */
export function day(from: number): string {
  const date = new Date();
  date.setDate(date.getDate() + from);
  return date.toISOString().slice(0, 10);
}
