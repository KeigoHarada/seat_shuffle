import { createServer } from "node:net";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const chromePath = process.env.RAKUGAE_CHROME || "/usr/bin/google-chrome-stable";
const screenshotDir =
  process.env.PHONE_LAYOUT_SHOTS ||
  "/opt/cursor/artifacts/screenshots/phone-layout-quality";

function loadPlaywright() {
  const candidates = [
    path.join(
      root,
      ".cursor/skills/verify-rakugae/helpers/node_modules/playwright-core",
    ),
    "playwright-core",
  ];
  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch {
      // try next
    }
  }
  throw new Error(
    "playwright-core is missing. Run: npm install --prefix .cursor/skills/verify-rakugae/helpers",
  );
}

function listenFreePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close();
        reject(new Error("Could not allocate a port"));
        return;
      }
      const port = address.port;
      server.close((error) => {
        if (error) reject(error);
        else resolve(port);
      });
    });
    server.on("error", reject);
  });
}

async function waitForUrl(url, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.ok || response.status === 304) return;
    } catch {
      // vite still starting
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function record(failures, label, ok, detail) {
  if (!ok) failures.push(`${label}: ${detail}`);
}

async function dismissWelcome(page) {
  const skip = page.getByRole("button", { name: "スキップ" });
  try {
    await skip.click({ timeout: 4000 });
  } catch {
    // already dismissed
  }
  await page.locator(".phone-app, .app-shell[data-kind]").first().waitFor();
}

async function noPageOverflow(page) {
  return page.evaluate(() => {
    const rootEl = document.documentElement;
    const body = document.body;
    return {
      clientWidth: rootEl.clientWidth,
      scrollWidth: Math.max(rootEl.scrollWidth, body.scrollWidth),
      clientHeight: rootEl.clientHeight,
      scrollHeight: Math.max(rootEl.scrollHeight, body.scrollHeight),
    };
  });
}

async function box(page, selector) {
  const handle = page.locator(selector).first();
  if ((await handle.count()) === 0) return null;
  return handle.boundingBox();
}

async function metrics(page, selector) {
  const handle = page.locator(selector).first();
  if ((await handle.count()) === 0) return null;
  return handle.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return {
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
    };
  });
}

async function assertPhone(page, url, viewport, failures) {
  await page.setViewportSize(viewport);
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await dismissWelcome(page);
  await page.waitForSelector('[data-kind="phone"]');
  await page.waitForSelector(".app-canvas-toolbar");
  await page.waitForTimeout(400);

  const label = `${viewport.width}x${viewport.height}`;
  const shot = path.join(screenshotDir, `phone-seats-${viewport.width}.png`);
  await page.screenshot({ path: shot, fullPage: false });

  const kind = await page.locator("[data-kind]").first().getAttribute("data-kind");
  record(failures, `${label} shell`, kind === "phone", `kind=${kind}`);

  const overflow = await noPageOverflow(page);
  record(
    failures,
    `${label} page width`,
    overflow.scrollWidth <= overflow.clientWidth + 1,
    `scrollWidth ${overflow.scrollWidth} > clientWidth ${overflow.clientWidth}`,
  );

  const header = await metrics(page, ".phone-header");
  record(failures, `${label} header present`, !!header, "missing .phone-header");
  if (header) {
    record(
      failures,
      `${label} header height`,
      header.height <= 56,
      `height ${header.height}`,
    );
    record(
      failures,
      `${label} header overflow`,
      header.scrollWidth <= header.clientWidth + 1,
      `scrollWidth ${header.scrollWidth} > clientWidth ${header.clientWidth}`,
    );
  }

  const toolbar = await box(page, ".app-canvas-toolbar");
  record(failures, `${label} toolbar present`, !!toolbar, "missing toolbar");
  if (toolbar) {
    record(
      failures,
      `${label} toolbar single row`,
      toolbar.height <= 52,
      `height ${toolbar.height}`,
    );
    const buttons = page.locator(".app-canvas-toolbar .app-canvas-toolbar-btn");
    const count = await buttons.count();
    record(failures, `${label} toolbar actions`, count >= 4, `count=${count}`);
    const first = await buttons.nth(0).boundingBox();
    const last = await buttons.nth(count - 1).boundingBox();
    if (first && last) {
      record(
        failures,
        `${label} toolbar y-align`,
        Math.abs(first.y - last.y) < 4,
        `first.y=${first.y} last.y=${last.y}`,
      );
    }
  }

  const shuffle = await box(page, ".phone-shuffle-bar");
  record(failures, `${label} shuffle bar`, !!shuffle, "missing shuffle bar");
  if (shuffle) {
    record(
      failures,
      `${label} shuffle height`,
      shuffle.height <= 64,
      `height ${shuffle.height}`,
    );
    record(
      failures,
      `${label} shuffle width`,
      shuffle.width <= viewport.width + 1,
      `width ${shuffle.width}`,
    );
  }

  const canvas = await box(page, ".phone-seats-canvas");
  record(failures, `${label} canvas`, !!canvas, "missing canvas");
  if (canvas) {
    record(
      failures,
      `${label} canvas height`,
      canvas.height >= 240,
      `height ${canvas.height}`,
    );
  }

  const scaleText = (await page.locator(".app-canvas-controls-scale").innerText())
    .trim();
  const scale = Number.parseInt(scaleText, 10);
  record(
    failures,
    `${label} classroom zoom`,
    Number.isFinite(scale) && scale < 50 && scale >= 25,
    `scale=${scaleText}`,
  );

  record(
    failures,
    `${label} seats shuffle`,
    (await page.locator("#btn-phone-shuffle").count()) === 1,
    "missing #btn-phone-shuffle",
  );
  record(
    failures,
    `${label} seats view toggle`,
    (await page.locator("#btn-phone-viewmode").count()) === 1,
    "missing #btn-phone-viewmode",
  );
  record(
    failures,
    `${label} no desktop shuffle`,
    (await page.locator("#btn-footer-shuffle").count()) === 0,
    "desktop shuffle leaked onto phone",
  );
  record(
    failures,
    `${label} no settings drawer`,
    (await page.locator("#btn-header-settings").count()) === 0,
    "desktop settings button on phone",
  );

  const tabs = page.locator(".phone-tab");
  record(failures, `${label} tab count`, (await tabs.count()) === 3, "need 3 tabs");
  for (let i = 0; i < (await tabs.count()); i += 1) {
    const tabBox = await tabs.nth(i).boundingBox();
    const name = await tabs.nth(i).innerText();
    record(
      failures,
      `${label} tab target ${name}`,
      !!tabBox && tabBox.height >= 44 && tabBox.width >= 80,
      `box=${JSON.stringify(tabBox)}`,
    );
  }

  await page.locator("#tab-phone-roster").click();
  await page.waitForSelector('[data-phone-destination="roster"]');
  await page.screenshot({
    path: path.join(screenshotDir, `phone-roster-${viewport.width}.png`),
  });
  record(
    failures,
    `${label} roster hides shuffle`,
    (await page.locator("#btn-phone-shuffle").count()) === 0,
    "shuffle still on roster",
  );
  record(
    failures,
    `${label} roster hides view toggle`,
    (await page.locator("#btn-phone-viewmode").count()) === 0,
    "view toggle on roster",
  );
  const rosterOverflow = await noPageOverflow(page);
  record(
    failures,
    `${label} roster width`,
    rosterOverflow.scrollWidth <= rosterOverflow.clientWidth + 1,
    `scrollWidth ${rosterOverflow.scrollWidth} > clientWidth ${rosterOverflow.clientWidth}`,
  );
  record(
    failures,
    `${label} roster switch`,
    (await page.locator("#tab-phone-roster-students").count()) === 1,
    "missing roster page switch",
  );
  record(
    failures,
    `${label} no duplicate 生徒設定`,
    !(await page.locator("h2", { hasText: "生徒設定" }).count()),
    "desktop settings heading leaked",
  );

  await page.locator("#phone-more-btn").click();
  await page.getByRole("menuitem", { name: "全体設定" }).click();
  await page.locator(".phone-overlay").waitFor();
  await page.screenshot({
    path: path.join(screenshotDir, `phone-global-${viewport.width}.png`),
  });
  record(
    failures,
    `${label} global overlay`,
    (await page.locator(".phone-overlay-title", { hasText: "全体設定" }).count()) ===
      1,
    "missing 全体設定 overlay",
  );
  await page.getByRole("button", { name: "戻る" }).click();
  record(
    failures,
    `${label} global close`,
    (await page.locator(".phone-overlay").count()) === 0,
    "overlay stayed open",
  );

  await page.locator("#tab-phone-constraints").click();
  await page.waitForSelector('[data-phone-destination="constraints"]');
  await page.screenshot({
    path: path.join(screenshotDir, `phone-constraints-${viewport.width}.png`),
  });
  record(
    failures,
    `${label} constraints title`,
    (await page.locator(".phone-screen-title", { hasText: "条件" }).count()) === 1,
    "missing 条件 title",
  );
}

async function assertDesktop(page, url, viewport, failures) {
  await page.setViewportSize(viewport);
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await dismissWelcome(page);
  await page.waitForSelector('[data-kind="desktop"]');
  const label = `${viewport.width}x${viewport.height}`;
  await page.screenshot({
    path: path.join(screenshotDir, `desktop-${viewport.width}.png`),
  });

  const kind = await page.locator("[data-kind]").first().getAttribute("data-kind");
  record(failures, `${label} shell`, kind === "desktop", `kind=${kind}`);
  record(
    failures,
    `${label} footer shuffle`,
    (await page.locator("#btn-footer-shuffle").count()) === 1,
    "missing desktop shuffle",
  );
  record(
    failures,
    `${label} settings`,
    (await page.locator("#btn-header-settings").count()) === 1,
    "missing settings button",
  );
  record(
    failures,
    `${label} no phone tabs`,
    (await page.locator(".phone-tabbar").count()) === 0,
    "phone tabs on desktop",
  );
  const overflow = await noPageOverflow(page);
  record(
    failures,
    `${label} page width`,
    overflow.scrollWidth <= overflow.clientWidth + 1,
    `scrollWidth ${overflow.scrollWidth} > clientWidth ${overflow.clientWidth}`,
  );
}

async function main() {
  mkdirSync(screenshotDir, { recursive: true });
  const { chromium } = loadPlaywright();
  const port = await listenFreePort();
  const url = `http://127.0.0.1:${port}/`;
  const viteBin = path.join(root, "node_modules/.bin/vite");
  const vite = spawn(
    viteBin,
    ["--host", "127.0.0.1", "--port", String(port), "--strictPort"],
    {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let viteLog = "";
  vite.stdout.on("data", (chunk) => {
    viteLog += chunk.toString();
  });
  vite.stderr.on("data", (chunk) => {
    viteLog += chunk.toString();
  });

  const failures = [];
  let browser;
  try {
    await waitForUrl(url);
    browser = await chromium.launch({
      executablePath: chromePath,
      args: ["--headless=new", "--disable-gpu", "--no-sandbox"],
    });
    const page = await browser.newPage();
    await assertPhone(page, url, { width: 375, height: 667 }, failures);
    await assertPhone(page, url, { width: 390, height: 844 }, failures);
    await assertDesktop(page, url, { width: 1280, height: 800 }, failures);
  } catch (error) {
    failures.push(`runner: ${error instanceof Error ? error.message : String(error)}`);
    if (viteLog) failures.push(`vite log: ${viteLog.slice(-800)}`);
  } finally {
    if (browser) await browser.close();
    if (vite.pid) {
      try {
        process.kill(vite.pid, "SIGTERM");
      } catch {
        // already gone
      }
      await new Promise((resolve) => setTimeout(resolve, 400));
      try {
        process.kill(vite.pid, 0);
        process.kill(vite.pid, "SIGKILL");
      } catch {
        // already gone
      }
    }
  }

  if (failures.length > 0) {
    console.error("Phone layout quality failed:\n- " + failures.join("\n- "));
    process.exit(1);
  }
  console.log(
    `Phone layout quality passed. Screenshots: ${screenshotDir}`,
  );
  process.exit(0);
}

main();
