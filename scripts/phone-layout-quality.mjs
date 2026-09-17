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

async function dispatchTwoFingerPan(page, start, dx, dy) {
  const before = await page.locator("#canvas-main-area").evaluate((el) => {
    return el.style.backgroundPosition;
  });
  const ok = await page.evaluate(
    ({ start, dx, dy }) => {
      const canvas = document.getElementById("canvas-main-area");
      if (!canvas || !start) return false;
      const fire = (type, pointerId, cx, cy, buttons, isPrimary) => {
        canvas.dispatchEvent(
          new PointerEvent(type, {
            bubbles: true,
            cancelable: true,
            composed: true,
            pointerId,
            pointerType: "touch",
            isPrimary,
            button: 0,
            buttons,
            clientX: cx,
            clientY: cy,
          }),
        );
      };
      const a = { x: start.x, y: start.y };
      const b = { x: start.x + 48, y: start.y + 16 };
      fire("pointerdown", 21, a.x, a.y, 1, true);
      fire("pointerdown", 22, b.x, b.y, 1, false);
      fire("pointermove", 21, a.x + dx, a.y + dy, 1, true);
      fire("pointermove", 22, b.x + dx, b.y + dy, 1, false);
      fire("pointerup", 21, a.x + dx, a.y + dy, 0, true);
      fire("pointerup", 22, b.x + dx, b.y + dy, 0, false);
      return true;
    },
    { start, dx, dy },
  );
  await page.waitForTimeout(80);
  const after = await page.locator("#canvas-main-area").evaluate((el) => {
    return el.style.backgroundPosition;
  });
  return { before, after, ok };
}

async function dispatchPinchOnSeats(page) {
  const beforeScale = await page.locator(".app-canvas-controls-scale").innerText();
  const beforePan = await page.locator("#canvas-main-area").evaluate((el) => {
    return el.style.backgroundPosition;
  });
  const ok = await page.evaluate(() => {
    const canvas = document.getElementById("canvas-main-area");
    const seats = [...document.querySelectorAll(".seat-node-item")];
    if (!canvas || seats.length === 0) return false;
    const first = seats[0].getBoundingClientRect();
    const second = (seats[1] || seats[0]).getBoundingClientRect();
    const a = {
      x: first.left + first.width * 0.35,
      y: first.top + first.height * 0.45,
    };
    const b = {
      x: second.left + second.width * 0.7,
      y: second.top + second.height * 0.55,
    };
    const fire = (target, type, pointerId, cx, cy, buttons, isPrimary) => {
      target.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          cancelable: true,
          composed: true,
          pointerId,
          pointerType: "touch",
          isPrimary,
          button: 0,
          buttons,
          clientX: cx,
          clientY: cy,
        }),
      );
    };
    fire(seats[0], "pointerdown", 31, a.x, a.y, 1, true);
    fire(seats[1] || seats[0], "pointerdown", 32, b.x, b.y, 1, false);
    const spread = 70;
    fire(canvas, "pointermove", 31, a.x - spread, a.y - spread, 1, true);
    fire(canvas, "pointermove", 32, b.x + spread, b.y + spread, 1, false);
    fire(canvas, "pointerup", 31, a.x - spread, a.y - spread, 0, true);
    fire(canvas, "pointerup", 32, b.x + spread, b.y + spread, 0, false);
    return true;
  });
  await page.waitForTimeout(80);
  const afterScale = await page.locator(".app-canvas-controls-scale").innerText();
  const afterPan = await page.locator("#canvas-main-area").evaluate((el) => {
    return el.style.backgroundPosition;
  });
  return { beforeScale, afterScale, beforePan, afterPan, ok };
}

async function countSelectedSeats(page) {
  return page.evaluate(() => {
    const canvas = document.getElementById("canvas-main-area");
    const attr = canvas?.getAttribute("data-selected-count");
    if (attr != null && attr !== "") return Number(attr);
    return [...document.querySelectorAll(".seat-node-item")].filter((el) => {
      return parseFloat(getComputedStyle(el).borderTopWidth) >= 2;
    }).length;
  });
}

async function assignPopoverOpen(page) {
  return (await page.getByText("生徒の割り当て", { exact: true }).count()) > 0;
}

async function dispatchTouchTap(page, selector) {
  return page.evaluate((selector) => {
    const el = document.querySelector(selector);
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width * 0.5;
    const y = rect.top + rect.height * 0.5;
    const fire = (type, buttons) => {
      el.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          cancelable: true,
          composed: true,
          pointerId: 51,
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
    fire("pointerup", 0);
    return true;
  }, selector);
}

async function seatWorldPos(page) {
  return page.evaluate(() => {
    const el = [...document.querySelectorAll(".seat-node-item")].at(-1);
    if (!el) return null;
    return {
      left: el.style.left,
      top: el.style.top,
      x: Number(el.getAttribute("data-x")),
      y: Number(el.getAttribute("data-y")),
    };
  });
}

async function dispatchSeatDrag(page, dx, dy) {
  const beforePan = await page.locator("#canvas-main-area").evaluate((el) => {
    return el.style.backgroundPosition;
  });
  const beforePos = await seatWorldPos(page);
  const ok = await page.evaluate(
    ({ dx, dy }) => {
      const seats = [...document.querySelectorAll(".seat-node-item")];
      const el = seats[seats.length - 1];
      const canvas = document.getElementById("canvas-main-area");
      if (!el || !canvas) return false;
      const rect = el.getBoundingClientRect();
      const x = rect.left + Math.min(24, Math.max(8, rect.width / 2));
      const y = rect.top + Math.min(24, Math.max(8, rect.height / 2));
      const fire = (target, type, cx, cy, buttons) => {
        target.dispatchEvent(
          new PointerEvent(type, {
            bubbles: true,
            cancelable: true,
            composed: true,
            pointerId: 61,
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
    { dx, dy },
  );
  await page.waitForTimeout(80);
  const afterPan = await page.locator("#canvas-main-area").evaluate((el) => {
    return el.style.backgroundPosition;
  });
  const afterPos = await seatWorldPos(page);
  const moved =
    !!beforePos &&
    !!afterPos &&
    ((beforePos.x !== afterPos.x || beforePos.y !== afterPos.y) ||
      beforePos.left !== afterPos.left ||
      beforePos.top !== afterPos.top);
  return { ok, beforePan, afterPan, beforePos, afterPos, moved };
}

async function dispatchTouchMarquee(page, pointerType = "touch") {
  const before = await countSelectedSeats(page);
  const detail = await page.evaluate(({ pointerType }) => {
    const canvas = document.getElementById("canvas-main-area");
    if (!canvas) return { ok: false };
    const canvasRect = canvas.getBoundingClientRect();
    const chrome = [
      document.querySelector(".app-canvas-toolbar"),
      document.querySelector(".app-canvas-controls"),
      document.querySelector(".app-canvas-toolbar-menu"),
    ]
      .filter(Boolean)
      .map((el) => el.getBoundingClientRect());
    const hits = (boxes, x, y) =>
      boxes.some(
        (box) =>
          x >= box.left && x <= box.right && y >= box.top && y <= box.bottom,
      );
    const visible = [...document.querySelectorAll(".seat-node-item")]
      .map((el) => el.getBoundingClientRect())
      .filter(
        (box) =>
          box.width > 0 &&
          box.height > 0 &&
          box.right > canvasRect.left &&
          box.left < canvasRect.right &&
          box.bottom > canvasRect.top &&
          box.top < canvasRect.bottom,
      );
    if (visible.length < 2) return { ok: false, visible: visible.length };
    const minLeft = Math.min(...visible.map((box) => box.left));
    const minTop = Math.min(...visible.map((box) => box.top));
    const maxRight = Math.max(...visible.map((box) => box.right));
    const maxBottom = Math.max(...visible.map((box) => box.bottom));
    const start = {
      x: Math.min(maxRight - 8, Math.max(canvasRect.left + 8, minLeft - 20)),
      y: Math.min(
        canvasRect.bottom - 8,
        Math.max(canvasRect.top + 8, maxBottom + 18),
      ),
    };
    const end = {
      x: Math.min(canvasRect.right - 8, maxRight - 4),
      y: Math.max(canvasRect.top + 8, minTop - 12),
    };
    if (hits(chrome, start.x, start.y) || hits(visible, start.x, start.y)) {
      start.x = Math.min(canvasRect.right - 12, maxRight + 16);
      start.y = Math.min(canvasRect.bottom - 12, maxBottom + 16);
    }
    const fire = (type, cx, cy, buttons) => {
      canvas.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          cancelable: true,
          composed: true,
          pointerId: pointerType === "mouse" ? 1 : 41,
          pointerType,
          isPrimary: true,
          button: 0,
          buttons,
          clientX: cx,
          clientY: cy,
        }),
      );
    };
    fire("pointerdown", start.x, start.y, 1);
    fire("pointermove", end.x, end.y, 1);
    fire("pointerup", end.x, end.y, 0);
    return { ok: true, start, end, visible: visible.length };
  }, { pointerType });
  await page.waitForTimeout(80);
  const after = await countSelectedSeats(page);
  return { before, after, ...detail };
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
    const emptyPan = await dispatchTwoFingerPan(page, emptyPoint, 80, 40);
    record(
      failures,
      `${label} two-finger pan empty canvas`,
      emptyPan.ok && emptyPan.before !== emptyPan.after,
      `before=${emptyPan.before} after=${emptyPan.after} point=${JSON.stringify(emptyPoint)}`,
    );

    if ((await page.locator(".seat-node-item").count()) > 0) {
      await page.getByRole("button", { name: "表示リセット" }).click();
      await page.waitForTimeout(80);
      const marquee = await dispatchTouchMarquee(page);
      record(
        failures,
        `${label} touch marquee selects seats`,
        marquee.ok && marquee.after > marquee.before && marquee.after >= 2,
        `selected ${marquee.before} -> ${marquee.after} ok=${marquee.ok} visible=${marquee.visible}`,
      );
      record(
        failures,
        `${label} touch marquee does not open assign popover`,
        !(await assignPopoverOpen(page)),
        "assign popover opened after empty-canvas drag",
      );
      await page.screenshot({
        path: path.join(screenshotDir, `${shotName}-marquee.png`),
        fullPage: false,
      });
    }

    if (!expectCompact) {
      await page.getByRole("button", { name: "表示リセット" }).click();
      await page.waitForTimeout(80);
      const mouseMarquee = await dispatchTouchMarquee(page, "mouse");
      record(
        failures,
        `${label} mouse marquee selects seats`,
        mouseMarquee.ok &&
          mouseMarquee.after > mouseMarquee.before &&
          mouseMarquee.after >= 2,
        `selected ${mouseMarquee.before} -> ${mouseMarquee.after} ok=${mouseMarquee.ok}`,
      );
    }

    const clearPoint = await pickEmptyCanvasPoint(page);
    if (clearPoint) {
      await page.evaluate(({ x, y }) => {
        const canvas = document.getElementById("canvas-main-area");
        if (!canvas) return;
        const fire = (type, buttons) => {
          canvas.dispatchEvent(
            new PointerEvent(type, {
              bubbles: true,
              cancelable: true,
              composed: true,
              pointerId: 91,
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
        fire("pointerup", 0);
      }, clearPoint);
      await page.waitForTimeout(80);
    }
    const selectedBeforePinch = await countSelectedSeats(page);
    const pinchOnSeats = await dispatchPinchOnSeats(page);
    const selectedAfterPinch = await countSelectedSeats(page);
    record(
      failures,
      `${label} pinch on seats zooms`,
      pinchOnSeats.ok &&
        (pinchOnSeats.beforeScale !== pinchOnSeats.afterScale ||
          pinchOnSeats.beforePan !== pinchOnSeats.afterPan),
      `scale ${pinchOnSeats.beforeScale} -> ${pinchOnSeats.afterScale} pan ${pinchOnSeats.beforePan} -> ${pinchOnSeats.afterPan}`,
    );
    record(
      failures,
      `${label} pinch on seats does not open assign or menu`,
      !(await assignPopoverOpen(page)) &&
        (await page.locator(".canvas-context-menu").count()) === 0,
      "two-finger pinch opened seat assign or context menu",
    );
    record(
      failures,
      `${label} pinch on seats does not increase selected count`,
      pinchOnSeats.ok && selectedAfterPinch <= selectedBeforePinch,
      `selected ${selectedBeforePinch} -> ${selectedAfterPinch}`,
    );
    record(
      failures,
      `${label} pinch on seats does not select seats under fingers`,
      selectedAfterPinch === 0,
      `selected after pinch=${selectedAfterPinch}`,
    );

    if ((await page.locator(".seat-node-item").count()) > 0) {
      const seatDrag = await dispatchSeatDrag(page, 90, 50);
      record(
        failures,
        `${label} seat drag does not pan canvas`,
        seatDrag.ok && seatDrag.beforePan === seatDrag.afterPan,
        `before=${seatDrag.beforePan} after=${seatDrag.afterPan}`,
      );
      record(
        failures,
        `${label} seat drag moves seat without long-press`,
        seatDrag.ok && seatDrag.moved,
        `before=${JSON.stringify(seatDrag.beforePos)} after=${JSON.stringify(seatDrag.afterPos)}`,
      );
    }

    await page.locator("#btn-footer-viewmode").click();
    await page.waitForTimeout(80);
    const viewSelectedBefore = await countSelectedSeats(page);
    await dispatchTouchTap(page, ".seat-node-item");
    await page.waitForTimeout(80);
    const viewSelectedAfter = await countSelectedSeats(page);
    record(
      failures,
      `${label} view-mode tap does not select`,
      viewSelectedAfter === viewSelectedBefore &&
        !(await assignPopoverOpen(page)),
      `selected ${viewSelectedBefore} -> ${viewSelectedAfter}`,
    );
    const viewSeatDrag = await dispatchSeatDrag(page, 70, 30);
    record(
      failures,
      `${label} view-mode seat drag does not move`,
      viewSeatDrag.ok && !viewSeatDrag.moved,
      `before=${JSON.stringify(viewSeatDrag.beforePos)} after=${JSON.stringify(viewSeatDrag.afterPos)} panMoved=${viewSeatDrag.beforePan !== viewSeatDrag.afterPan}`,
    );
    const viewPoint = await pickEmptyCanvasPoint(page);
    const viewPan = await dispatchTouchPan(
      page,
      "#canvas-main-area",
      80,
      40,
      viewPoint,
    );
    record(
      failures,
      `${label} view-mode one-finger pan`,
      viewPan.ok && viewPan.before !== viewPan.after,
      `before=${viewPan.before} after=${viewPan.after} point=${JSON.stringify(viewPoint)}`,
    );
    await page.locator("#btn-footer-viewmode").click();
    await page.locator(".app-canvas-toolbar").waitFor({ timeout: 3000 });

    const emptyTapPoint = await pickEmptyCanvasPoint(page);
    if (emptyTapPoint) {
      await page.evaluate(({ x, y }) => {
        const canvas = document.getElementById("canvas-main-area");
        if (!canvas) return;
        const fire = (type, buttons) => {
          canvas.dispatchEvent(
            new PointerEvent(type, {
              bubbles: true,
              cancelable: true,
              composed: true,
              pointerId: 71,
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
        fire("pointerup", 0);
      }, emptyTapPoint);
      await page.waitForTimeout(80);
    }
    await dispatchTouchTap(page, ".seat-node-item");
    await page.waitForTimeout(80);
    record(
      failures,
      `${label} one-finger tap selects a seat`,
      (await countSelectedSeats(page)) >= 1 && !(await assignPopoverOpen(page)),
      `selected=${await countSelectedSeats(page)} popover=${await assignPopoverOpen(page)}`,
    );

    await page.getByRole("button", { name: "座席を追加", exact: true }).click();
    await page.waitForTimeout(80);
    const emptySeat = page.locator(".seat-node-item").filter({ hasText: "空席" });
    if ((await emptySeat.count()) > 0) {
      await emptySeat.last().evaluate((el) => {
        const rect = el.getBoundingClientRect();
        const x = rect.left + rect.width * 0.5;
        const y = rect.top + rect.height * 0.5;
        const fire = (type, buttons) => {
          el.dispatchEvent(
            new PointerEvent(type, {
              bubbles: true,
              cancelable: true,
              composed: true,
              pointerId: 81,
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
        fire("pointerup", 0);
      });
      await page.waitForTimeout(80);
      record(
        failures,
        `${label} one-finger tap on empty seat opens assign`,
        await assignPopoverOpen(page),
        "assign popover missing after tap on 空席",
      );
      await page.keyboard.press("Escape");
      await page.waitForTimeout(80);
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
