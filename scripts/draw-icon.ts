import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";

/**
 * Draws the app's icon, the same fridge the window shows, at the size Tauri's generator
 * expects. `npx tauri icon` cuts it into every format.
 *
 *   npm run art:icon   → src-tauri/icons/source.png
 */
const SIZE = 1024;
const OUT = "src-tauri/icons";

const mark = `
<!doctype html>
<html>
  <body style="margin:0">
    <svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 40 40">
      <defs>
        <linearGradient id="light" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ffffff" />
          <stop offset="1" stop-color="#d9efdf" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="9" fill="#2f6d47" />
      <g fill="none" stroke="#f6f8f4" stroke-width="2.2" stroke-linecap="round">
        <rect x="8.5" y="4.5" width="23" height="31" rx="5" fill="url(#light)" fill-opacity="0.12" />
        <path d="M8.5 15.5h23" />
        <path d="M26.8 9.5v3.4" />
        <path d="M26.8 18.2v4.4" />
      </g>
    </svg>
  </body>
</html>`;

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE } });
await page.setContent(mark);
await page.locator("svg").screenshot({ path: `${OUT}/source.png`, omitBackground: true });
await browser.close();

console.log(`${OUT}/source.png`);
