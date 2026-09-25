import { mkdirSync, rmSync } from "node:fs";
import { chromium, type Page } from "@playwright/test";
import { createServer } from "vite";

/**
 * Photographs every state of the app, for design review and the README.
 *
 * The same page runs in a browser tab and in the Android app, so one set of shots covers
 * both, at a phone's width and at a desktop window's.
 *
 *   npm run screens        → screens/*.png
 */
const PHONE = { width: 420, height: 820 };
const DESKTOP = { width: 760, height: 780 };
const PORT = 1430;
const OUT = "screens";

interface Shot {
  name: string;
  items?: unknown[];
  gone?: unknown[];
  names?: unknown[];
  act?: (page: Page) => Promise<void>;
  viewport?: { width: number; height: number };
}

const day = (from: number) => new Date(Date.now() + from * 86_400_000).toISOString().slice(0, 10);
const today = day(0);

const items = [
  { id: "1", name: "삼겹살", kind: "meat", count: 1, expiresOn: day(-1), addedOn: day(-4) },
  { id: "2", name: "애호박", kind: "vegetable", count: 2, expiresOn: today, addedOn: day(-3) },
  { id: "3", name: "우유", kind: "dairy", count: 1, expiresOn: day(2), addedOn: day(-2) },
  { id: "4", name: "달걀", kind: "egg", count: 6, expiresOn: day(18), addedOn: day(-2) },
  { id: "5", name: "대파", kind: "vegetable", count: 1, expiresOn: day(5), addedOn: day(-2) },
  { id: "6", name: "김치", kind: "side", count: 1, expiresOn: day(30), addedOn: day(-9) },
  { id: "7", name: "간장", kind: "sauce", count: 1, expiresOn: day(170), addedOn: day(-9) },
];

const gone = [
  { id: "8", name: "두부", kind: "other", count: 2, on: day(-3), why: "eaten" },
  { id: "9", name: "상추", kind: "vegetable", count: 1, on: day(-2), why: "thrown" },
];

const names = [{ name: "우유", kind: "dairy", days: 9, usedOn: day(-2) }];

const open = (page: Page) => page.getByRole("button", { name: "장 본 것 담기" }).click();

const SHOTS: Shot[] = [
  { name: "empty" },
  { name: "fridge", items, gone },
  { name: "unpack", names, act: open },
  {
    name: "unpack-remembered",
    items,
    names,
    act: async (page) => {
      await open(page);
      await page.getByRole("textbox", { name: "이름" }).fill("우유");
    },
  },
  {
    name: "recipes",
    items,
    gone,
    act: (page) => page.getByRole("button", { name: "레시피" }).click(),
  },
  {
    name: "undo",
    items,
    gone,
    act: (page) => page.getByRole("button", { name: "애호박 먹음" }).click(),
  },
  { name: "desktop-fridge", items, gone, viewport: DESKTOP },
  {
    name: "desktop-recipes",
    items,
    gone,
    act: (page) => page.getByRole("button", { name: "레시피" }).click(),
    viewport: DESKTOP,
  },
];

async function main() {
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
  const server = await createServer({
    server: { port: PORT, strictPort: true },
    logLevel: "error",
  });
  await server.listen();
  // Headless Chromium hides scrollbars, which the real window shows and gives room to.
  const browser = await chromium.launch({
    channel: "msedge",
    ignoreDefaultArgs: ["--hide-scrollbars"],
  });

  try {
    for (const shot of SHOTS) {
      const page = await browser.newPage({
        viewport: shot.viewport ?? PHONE,
        deviceScaleFactor: 2,
      });
      await page.addInitScript(
        ([items, gone, names]) => {
          window.localStorage.setItem("yeoreobwayo.items", JSON.stringify(items));
          window.localStorage.setItem("yeoreobwayo.gone", JSON.stringify(gone));
          window.localStorage.setItem("yeoreobwayo.names", JSON.stringify(names));
        },
        [shot.items ?? [], shot.gone ?? [], shot.names ?? []],
      );
      await page.goto(`http://localhost:${PORT}`);
      await page.getByRole("heading", { name: "열어봐요", level: 1 }).waitFor();
      await shot.act?.(page);
      // Park the pointer clear of the page, so no hover state is photographed.
      await page.mouse.move(1, (shot.viewport ?? PHONE).height - 1);
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${OUT}/${shot.name}.png` });
      await page.close();
      console.log(`${OUT}/${shot.name}.png`);
    }
  } finally {
    await browser.close();
    await server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
