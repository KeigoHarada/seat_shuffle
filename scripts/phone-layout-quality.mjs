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
    } catch {}
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
    } catch {}
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
  } catch {}
  await page.locator(".app-shell").first().waitFor();
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

async function hitAtBoxCenter(page, selector) {
  return page.evaluate((selector) => {
    const el = document.querySelector(selector);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const hit = document.elementFromPoint(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
    );
    const closest =
      hit instanceof Element
        ? hit.closest(
            ".app-canvas-toolbar-menu, .app-settings, .app-settings-scrim, .app-canvas-toolbar, .app-canvas-controls",
          )
        : null;
    return {
      tag: hit?.tagName ?? null,
      className: hit instanceof Element ? String(hit.className) : null,
      closest: closest instanceof Element ? closest.className : null,
      text: hit?.textContent?.trim().slice(0, 40) ?? null,
    };
  }, selector);
}

async function metrics(page, selector) {
  const handle = page.locator(selector).first();
  if ((await handle.count()) === 0) return null;
  return handle.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return {
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
      flexDirection: style.flexDirection,
      position: style.position,
    };
  });
}

async function pickEmptyCanvasPoint(page) {
  return page.evaluate(() => {
    const canvas = document.getElementById("canvas-main-area");
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const avoidEls = [
      document.querySelector(".app-canvas-toolbar"),
      document.querySelector(".app-canvas-controls"),
      document.querySelector(".canvas-context-menu"),
    ].filter(Boolean);
    const avoid = avoidEls.map((el) => el.getBoundingClientRect());
    const seats = [...document.querySelectorAll(".seat-node-item")].map((el) =>
      el.getBoundingClientRect(),
    );
    const hits = (boxes, x, y) =>
      boxes.some(
        (box) =>
          x >= box.left && x <= box.right && y >= box.top && y <= box.bottom,
      );
    const candidates = [
      { x: rect.right - 28, y: rect.top + 28 },
      { x: rect.right - 28, y: rect.bottom - 28 },
      { x: rect.left + 28, y: rect.bottom - 28 },
      { x: rect.left + rect.width * 0.82, y: rect.top + rect.height * 0.18 },
    ];
    return (
      candidates.find(
        (point) => !hits(avoid, point.x, point.y) && !hits(seats, point.x, point.y),
      ) || candidates[0]
    );
  });
}

async function dispatchTouchPan(page, selector, dx, dy, point) {
  const before = await page.locator("#canvas-main-area").evaluate((el) => {
    return el.style.backgroundPosition;
  });
  const ok = await page.evaluate(
    async ({ selector, dx, dy, point }) => {
      const el = document.querySelector(selector);
      const canvas = document.getElementById("canvas-main-area");
      if (!el || !canvas) return false;
      const rect = el.getBoundingClientRect();
      const x = point?.x ?? rect.left + Math.min(48, Math.max(8, rect.width / 2));
      const y = point?.y ?? rect.top + Math.min(48, Math.max(8, rect.height / 2));
      const fire = (target, type, cx, cy, buttons) => {
        target.dispatchEvent(
          new PointerEvent(type, {
            bubbles: true,
            cancelable: true,
            composed: true,
            pointerId: 1,
            pointerType: "touch",
            isPrimary: true,
            button: 0,
            buttons,
            clientX: cx,
            clientY: cy,
          }),
        );
      };
      fire(el, "pointerdown", x, y, 1);
      fire(el, "pointermove", x + dx, y + dy, 1);
      fire(canvas, "pointermove", x + dx, y + dy, 1);
      fire(el, "pointerup", x + dx, y + dy, 0);
      fire(canvas, "pointerup", x + dx, y + dy, 0);
      return true;
    },
    { selector, dx, dy, point: point ?? null },
  );
  await page.waitForTimeout(80);
  const after = await page.locator("#canvas-main-area").evaluate((el) => {
    return el.style.backgroundPosition;
  });
  return { before, after, ok };
}

async function dispatchTouchLongPress(page, point) {
  return page.evaluate(async ({ x, y }) => {
    const canvas = document.getElementById("canvas-main-area");
    if (!canvas) return false;
    const fire = (type, buttons) => {
      canvas.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          cancelable: true,
          composed: true,
          pointerId: 7,
          pointerType: "touch",
          isPrimary: true,
          button: 0,
          buttons,
          clientX: x,
          clientY: y,
        }),
      );
    };
    fire("pointerdown", 1);
    await new Promise((resolve) => setTimeout(resolve, 650));
    fire("pointerup", 0);
    return true;
  }, point);
}

async function assertSharedChrome(page, url, viewport, failures, expectCompact) {
  await page.setViewportSize(viewport);
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await dismissWelcome(page);
  await page.waitForSelector(".app-shell");
  await page.waitForSelector("#canvas-main-area");
  await page.waitForTimeout(400);

  const label = `${viewport.width}x${viewport.height}`;
  const shotName = expectCompact
    ? `compact-${viewport.width}`
    : `wide-${viewport.width}`;
  await page.screenshot({
    path: path.join(screenshotDir, `${shotName}.png`),
    fullPage: false,
  });

  const compact = await page
    .locator(".app-shell")
    .first()
    .getAttribute("data-compact");
  record(
    failures,
    `${label} compact flag`,
    compact === (expectCompact ? "true" : "false"),
    `data-compact=${compact}`,
  );

  const overflow = await noPageOverflow(page);
  record(
    failures,
    `${label} page width`,
    overflow.scrollWidth <= overflow.clientWidth + 1,
    `scrollWidth ${overflow.scrollWidth} > clientWidth ${overflow.clientWidth}`,
  );
  record(
    failures,
    `${label} page height`,
    overflow.scrollHeight <= overflow.clientHeight + 1,
    `scrollHeight ${overflow.scrollHeight} > clientHeight ${overflow.clientHeight}`,
  );

  const header = await metrics(page, ".app-header");
  record(failures, `${label} header present`, !!header, "missing .app-header");
  if (header) {
    record(
      failures,
      `${label} header overflow`,
      header.scrollWidth <= header.clientWidth + 8,
      `scrollWidth ${header.scrollWidth} > clientWidth ${header.clientWidth}`,
    );
    if (expectCompact) {
      record(
        failures,
        `${label} header height`,
        header.height <= 56,
        `height ${header.height}`,
      );
    }
  }

  const footer = await metrics(page, ".app-footer");
  record(failures, `${label} footer present`, !!footer, "missing .app-footer");
  if (footer) {
    record(
      failures,
      `${label} footer overflow`,
      footer.scrollWidth <= footer.clientWidth + 8,
      `scrollWidth ${footer.scrollWidth} > clientWidth ${footer.clientWidth}`,
    );
  }

  const main = await metrics(page, ".app-main");
  record(
    failures,
    `${label} main stays a row`,
    !!main && main.flexDirection === "row",
    `flexDirection=${main?.flexDirection}`,
  );

  const canvas = await box(page, ".app-canvas");
  record(failures, `${label} canvas`, !!canvas, "missing canvas");
  if (canvas) {
    record(
      failures,
      `${label} canvas height`,
      canvas.height >= 240,
      `height ${canvas.height}`,
    );
  }

  record(
    failures,
    `${label} footer shuffle`,
    (await page.locator("#btn-footer-shuffle").count()) === 1,
    "missing #btn-footer-shuffle",
  );
  record(
    failures,
    `${label} settings button`,
    (await page.locator("#btn-header-settings").count()) === 1,
    "missing #btn-header-settings",
  );
  record(
    failures,
    `${label} view toggle`,
    (await page.locator("#btn-footer-viewmode").count()) === 1,
    "missing #btn-footer-viewmode",
  );
  record(
    failures,
    `${label} no phone tabs`,
    (await page.locator(".phone-tabbar, #tab-phone-seats, #btn-phone-shuffle").count()) ===
      0,
    "phone destination chrome leaked",
  );

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
    const seatsBefore = await page.locator(".seat-node-item").count();
    const addSeatBtn = page.locator(".app-canvas-toolbar-btn").first();
    if (expectCompact) {
      await addSeatBtn.tap();
    } else {
      await addSeatBtn.click();
    }
    const seatsAfter = await page.locator(".seat-node-item").count();
    record(
      failures,
      `${label} toolbar adds a seat`,
      seatsAfter === seatsBefore + 1,
      `before=${seatsBefore} after=${seatsAfter}`,
    );

    const shapesBtn = page.getByRole("button", { name: "図形", exact: true });
    if (expectCompact) {
      await shapesBtn.tap();
    } else {
      await shapesBtn.click();
    }
    const shapesHit = await hitAtBoxCenter(page, ".app-canvas-toolbar-menu");
    record(
      failures,
      `${label} shapes menu hittable`,
      !!shapesHit &&
        /四角形|toolbar-menu/.test(`${shapesHit.text} ${shapesHit.closest}`),
      `hit=${JSON.stringify(shapesHit)}`,
    );
    const objectsBefore = await page.locator(".canvas-object-node").count();
    const rectBtn = page.getByRole("button", { name: "四角形", exact: true });
    try {
      if (expectCompact) {
        await rectBtn.tap({ timeout: 2000 });
      } else {
        await rectBtn.click({ timeout: 2000 });
      }
    } catch (error) {
      record(
        failures,
        `${label} shapes place a rectangle`,
        false,
        error instanceof Error ? error.message : String(error),
      );
    }
    const objectsAfter = await page.locator(".canvas-object-node").count();
    record(
      failures,
      `${label} shapes place a rectangle`,
      objectsAfter === objectsBefore + 1,
      `before=${objectsBefore} after=${objectsAfter}`,
    );

    const templatesBtn = page.getByRole("button", {
      name: "テンプレート",
      exact: true,
    });
    if (expectCompact) {
      await templatesBtn.tap();
    } else {
      await templatesBtn.click();
    }
    await page.locator(".app-canvas-toolbar-menu").first().waitFor({
      state: "attached",
      timeout: 2000,
    });
    const templatesHit = await hitAtBoxCenter(page, ".app-canvas-toolbar-menu");
    record(
      failures,
      `${label} templates menu hittable`,
      !!templatesHit &&
        /教室|toolbar-menu/.test(`${templatesHit.text} ${templatesHit.closest}`),
      `hit=${JSON.stringify(templatesHit)}`,
    );
    await page.evaluate(() => {
      document.body.dispatchEvent(
        new PointerEvent("pointerdown", { bubbles: true, clientX: 1, clientY: 1 }),
      );
    });

    const shuffleBox = await box(page, "#btn-footer-shuffle");
    if (shuffleBox) {
      const center = shuffleBox.x + shuffleBox.width / 2;
      record(
        failures,
        `${label} shuffle centered`,
        Math.abs(center - viewport.width / 2) < 56,
        `center=${center} viewport=${viewport.width / 2}`,
      );
    }
  }

  if (expectCompact) {
    const settings = await metrics(page, ".app-settings");
    record(
      failures,
      `${label} settings overlay`,
      !!settings && settings.position === "absolute",
      `position=${settings?.position}`,
    );
    record(
      failures,
      `${label} settings closed on load`,
      (await page.locator('.app-settings[data-open="true"]').count()) === 0,
      "settings covered the canvas on compact load",
    );

    const canvasBefore = await box(page, ".app-canvas");
    await page.locator("#btn-header-settings").click();
    await page.waitForSelector('.app-settings[data-open="true"]');
    const openSettings = await metrics(page, ".app-settings");
    record(
      failures,
      `${label} settings overlay width`,
      !!openSettings && openSettings.width >= 280,
      `width=${openSettings?.width}`,
    );
    await page.screenshot({
      path: path.join(screenshotDir, `${shotName}-settings.png`),
      fullPage: false,
    });
    const stack = await page.evaluate(() => {
      const toolbar = document.querySelector(".app-canvas-toolbar");
      const controls = document.querySelector(".app-canvas-controls");
      const settings = document.querySelector(".app-settings");
      const boxes = (el) => {
        const rect = el.getBoundingClientRect();
        return {
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
        };
      };
      const overlap = (a, b) =>
        a.right > b.left &&
        a.left < b.right &&
        a.bottom > b.top &&
        a.top < b.bottom;
      return {
        toolbarZ: toolbar ? getComputedStyle(toolbar).zIndex : null,
        controlsZ: controls ? getComputedStyle(controls).zIndex : null,
        settingsZ: settings ? getComputedStyle(settings).zIndex : null,
        overlapToolbar:
          toolbar && settings && overlap(boxes(toolbar), boxes(settings)),
        overlapControls:
          controls && settings && overlap(boxes(controls), boxes(settings)),
      };
    });
    record(
      failures,
      `${label} settings above toolbar z-index`,
      Number(stack.settingsZ) > Number(stack.toolbarZ),
      `settings=${stack.settingsZ} toolbar=${stack.toolbarZ}`,
    );
    record(
      failures,
      `${label} settings above controls z-index`,
      Number(stack.settingsZ) > Number(stack.controlsZ),
      `settings=${stack.settingsZ} controls=${stack.controlsZ}`,
    );
    if (stack.overlapToolbar) {
      const toolbarHit = await hitAtBoxCenter(page, ".app-canvas-toolbar");
      record(
        failures,
        `${label} settings covers toolbar`,
        !!toolbarHit && /app-settings/.test(`${toolbarHit.closest}`),
        `hit=${JSON.stringify(toolbarHit)}`,
      );
    }
    if (stack.overlapControls) {
      const controlsHit = await hitAtBoxCenter(page, ".app-canvas-controls");
      record(
        failures,
        `${label} settings covers controls`,
        !!controlsHit && /app-settings/.test(`${controlsHit.closest}`),
        `hit=${JSON.stringify(controlsHit)}`,
      );
    }
    const canvasAfter = await box(page, ".app-canvas");
    record(
      failures,
      `${label} overlay keeps canvas size`,
      !!canvasBefore &&
        !!canvasAfter &&
        Math.abs(canvasBefore.width - canvasAfter.width) < 2 &&
        Math.abs(canvasBefore.height - canvasAfter.height) < 2,
      `before=${JSON.stringify(canvasBefore)} after=${JSON.stringify(canvasAfter)}`,
    );
    record(
      failures,
      `${label} students heading`,
      (await page.locator("h2", { hasText: "生徒設定" }).count()) >= 1,
      "missing 生徒設定 in overlay",
    );
    await page.locator("#btn-header-settings").click();

    const emptyPoint = await pickEmptyCanvasPoint(page);
    const emptyPan = await dispatchTouchPan(
      page,
      "#canvas-main-area",
      80,
      40,
      emptyPoint,
    );
    record(
      failures,
      `${label} touch pan empty canvas`,
      emptyPan.ok && emptyPan.before !== emptyPan.after,
      `before=${emptyPan.before} after=${emptyPan.after} point=${JSON.stringify(emptyPoint)}`,
    );

    if ((await page.locator(".seat-node-item").count()) > 0) {
      const seatDrag = await dispatchTouchPan(page, ".seat-node-item", 70, 30);
      record(
        failures,
        `${label} seat drag does not pan canvas`,
        seatDrag.ok && seatDrag.before === seatDrag.after,
        `before=${seatDrag.before} after=${seatDrag.after}`,
      );
    }

    const longPressPoint = await pickEmptyCanvasPoint(page);
    if (longPressPoint) {
      await dispatchTouchLongPress(page, longPressPoint);
      await page.waitForTimeout(80);
      const menuCount = await page.locator(".canvas-context-menu").count();
      record(
        failures,
        `${label} long-press opens context menu`,
        menuCount === 1,
        `menuCount=${menuCount} point=${JSON.stringify(longPressPoint)}`,
      );
    }

    await page.locator("#header-guide-btn").click();
    await page.getByRole("heading", { name: "ラクガエ はじめてガイド" }).waitFor();
    const hub = await metrics(page, ".guide-hub");
    record(failures, `${label} guide hub`, !!hub, "missing .guide-hub");
    const hubBody = await metrics(page, ".guide-hub-body");
    record(
      failures,
      `${label} guide hub stacks`,
      !!hubBody && hubBody.flexDirection === "column",
      `flexDirection=${hubBody?.flexDirection}`,
    );
    if (hub) {
      record(
        failures,
        `${label} guide hub width`,
        hub.width <= viewport.width + 1,
        `width=${hub.width}`,
      );
      record(
        failures,
        `${label} guide hub height`,
        hub.height <= viewport.height + 1,
        `height=${hub.height}`,
      );
    }
    const hubOverflow = await noPageOverflow(page);
    record(
      failures,
      `${label} guide page width`,
      hubOverflow.scrollWidth <= hubOverflow.clientWidth + 1,
      `scrollWidth ${hubOverflow.scrollWidth} > clientWidth ${hubOverflow.clientWidth}`,
    );
    await page.screenshot({
      path: path.join(screenshotDir, `${shotName}-guide.png`),
      fullPage: false,
    });
    await page.getByTitle("閉じる").first().click();
  } else {
    const settings = await metrics(page, ".app-settings");
    record(
      failures,
      `${label} settings in flow`,
      !!settings && settings.position !== "absolute",
      `position=${settings?.position}`,
    );
  }
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
    const context = await browser.newContext({ hasTouch: true });
    const page = await context.newPage();
    await assertSharedChrome(
      page,
      url,
      { width: 375, height: 667 },
      failures,
      true,
    );
    await assertSharedChrome(
      page,
      url,
      { width: 390, height: 844 },
      failures,
      true,
    );
    await assertSharedChrome(
      page,
      url,
      { width: 820, height: 1180 },
      failures,
      true,
    );
    await assertSharedChrome(
      page,
      url,
      { width: 1280, height: 800 },
      failures,
      false,
    );
  } catch (error) {
    failures.push(
      `runner: ${error instanceof Error ? error.message : String(error)}`,
    );
    if (viteLog) failures.push(`vite log: ${viteLog.slice(-800)}`);
  } finally {
    if (browser) await browser.close();
    if (vite.pid) {
      try {
        process.kill(vite.pid, "SIGTERM");
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 400));
      try {
        process.kill(vite.pid, 0);
        process.kill(vite.pid, "SIGKILL");
      } catch {}
    }
  }

  if (failures.length > 0) {
    console.error("Phone layout quality failed:\n- " + failures.join("\n- "));
    process.exit(1);
  }
  console.log(`Phone layout quality passed. Screenshots: ${screenshotDir}`);
  process.exit(0);
}

main();
