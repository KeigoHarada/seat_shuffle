#!/usr/bin/env node
/**
 * Drive helper for verify-rakugae.
 * Launch Vite + a dedicated Chrome profile, then click/fill/snapshot through Playwright Core over CDP.
 *
 * Never kill by process name. Cleanup only SIGTERMs pids recorded for this run.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

const SKILL_HELPERS_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SKILL_HELPERS_DIR, "../../../..");
const VERIFY_ROOT = process.env.RAKUGAE_VERIFY_ROOT || "/tmp/rakugae-verify";
const CHROME_BIN =
  process.env.RAKUGAE_CHROME ||
  process.env.CHROME_PATH ||
  "/usr/bin/google-chrome-stable";

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token.startsWith("--")) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) {
        args[key] = true;
      } else {
        args[key] = next;
        i += 1;
      }
    } else {
      args._.push(token);
    }
  }
  return args;
}

function currentPointerPath() {
  return join(VERIFY_ROOT, "current");
}

function runIdFromArgs(args) {
  return (
    args["run-id"] ||
    process.env.RAKUGAE_VERIFY_RUN_ID ||
    (existsSync(currentPointerPath())
      ? readFileSync(currentPointerPath(), "utf8").trim()
      : "")
  );
}

function pathsFor(runId) {
  const runDir = join(VERIFY_ROOT, runId);
  return {
    runDir,
    instanceDir: join(runDir, "instance"),
    evidenceDir: join(runDir, "evidence"),
    profileDir: join(runDir, "instance", "chrome-profile"),
    metaPath: join(runDir, "instance", "run.json"),
    viteLogPath: join(runDir, "instance", "vite.log"),
    chromeLogPath: join(runDir, "instance", "chrome.log"),
  };
}

function readMeta(runId) {
  const { metaPath } = pathsFor(runId);
  if (!existsSync(metaPath)) {
    throw new Error(
      `No run metadata at ${metaPath}. Launch first with the same RAKUGAE_VERIFY_RUN_ID.`,
    );
  }
  return JSON.parse(readFileSync(metaPath, "utf8"));
}

function writeMeta(runId, meta) {
  const { metaPath, instanceDir } = pathsFor(runId);
  mkdirSync(instanceDir, { recursive: true });
  writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`);
}

function pidAlive(pid) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function waitForHttp(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let lastError = "";
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      const body = await res.text();
      if (res.ok && body.includes("ラクガエ")) return { status: res.status, body };
      lastError = `HTTP ${res.status}, body missing ラクガエ`;
    } catch (err) {
      lastError = err.message;
    }
    await sleep(250);
  }
  throw new Error(`App did not become ready at ${url}: ${lastError}`);
}

async function loadPlaywright() {
  try {
    return await import("playwright-core");
  } catch {
    throw new Error(
      `playwright-core is missing. From repo root run: npm install --prefix .cursor/skills/verify-rakugae/helpers`,
    );
  }
}

function chromeLaunchArgs() {
  return [
    "--disable-gpu",
    "--use-gl=angle",
    "--use-angle=swiftshader-webgl",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-dev-shm-usage",
    "--no-sandbox",
  ];
}

async function openAppPage(meta) {
  const { chromium } = await loadPlaywright();
  const context = await chromium.launchPersistentContext(meta.profileDir, {
    executablePath: meta.chromeBin || CHROME_BIN,
    headless: true,
    viewport: { width: 1440, height: 900 },
    args: chromeLaunchArgs(),
  });
  const page = context.pages()[0] || (await context.newPage());
  page.setDefaultTimeout(15000);
  const wanted = meta.url.replace(/\/$/, "");
  if (page.url().replace(/\/$/, "") !== wanted) {
    await page.goto(meta.url, { waitUntil: "domcontentloaded" });
  }
  await page.waitForSelector("#root", { timeout: 15000 });
  await page.waitForSelector('svg[aria-label*="ラクガエ"]', { timeout: 15000 });
  return { context, page };
}

function spawnLogged(command, spawnArgs, logPath, extraEnv = {}) {
  const logFd = openSync(logPath, "a");
  const child = spawn(command, spawnArgs, {
    cwd: REPO_ROOT,
    env: { ...process.env, ...extraEnv },
    stdio: ["ignore", logFd, logFd],
    detached: true,
  });
  child.unref();
  return child;
}

function stopPid(pid) {
  if (!pid) return;
  // Spawned with detached:true so pid is a process-group leader (npx -> vite).
  try {
    process.kill(-pid, "SIGTERM");
  } catch {
    try {
      if (pidAlive(pid)) process.kill(pid, "SIGTERM");
    } catch {
      /* already gone */
    }
  }
}

async function waitPidExit(pid, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!pidAlive(pid)) return true;
    await sleep(100);
  }
  if (pidAlive(pid)) {
    try {
      process.kill(-pid, "SIGKILL");
    } catch {
      try {
        process.kill(pid, "SIGKILL");
      } catch {
        /* already gone */
      }
    }
  }
  return !pidAlive(pid);
}

async function cmdLaunch(args) {
  const runId =
    args["run-id"] ||
    process.env.RAKUGAE_VERIFY_RUN_ID ||
    `run-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  const port = Number(args.port || process.env.RAKUGAE_VERIFY_PORT || 5173);
  const paths = pathsFor(runId);

  if (existsSync(paths.metaPath)) {
    const existing = readMeta(runId);
    if (pidAlive(existing.vitePid)) {
      throw new Error(
        `Run ${runId} is already live (vitePid=${existing.vitePid}). Cleanup first or pick another --run-id / port.`,
      );
    }
  }

  mkdirSync(paths.instanceDir, { recursive: true });
  mkdirSync(paths.evidenceDir, { recursive: true });
  mkdirSync(paths.profileDir, { recursive: true });

  if (!existsSync(join(REPO_ROOT, "node_modules", "vite"))) {
    throw new Error(`Vite is not installed. From ${REPO_ROOT} run: npm install`);
  }

  const vite = spawnLogged(
    "npx",
    ["vite", "--host", "127.0.0.1", "--port", String(port), "--strictPort"],
    paths.viteLogPath,
  );

  const url = `http://127.0.0.1:${port}/`;
  try {
    await waitForHttp(url, 30000);
  } catch (err) {
    stopPid(vite.pid);
    throw err;
  }

  const meta = {
    runId,
    url,
    port,
    vitePid: vite.pid,
    chromeBin: CHROME_BIN,
    profileDir: paths.profileDir,
    evidenceDir: paths.evidenceDir,
    instanceDir: paths.instanceDir,
    repoRoot: REPO_ROOT,
    startedAt: new Date().toISOString(),
  };
  writeMeta(runId, meta);
  mkdirSync(VERIFY_ROOT, { recursive: true });
  writeFileSync(currentPointerPath(), `${runId}\n`);

  const { context } = await openAppPage(meta);
  await context.close();

  process.stdout.write(
    `${JSON.stringify(
      {
        ok: true,
        command: "launch",
        runId,
        url,
        evidenceDir: paths.evidenceDir,
        instanceDir: paths.instanceDir,
        vitePid: vite.pid,
        chromeBin: CHROME_BIN,
        profileDir: paths.profileDir,
      },
      null,
      2,
    )}\n`,
  );
}

async function cmdDoctor(args) {
  const runId = runIdFromArgs(args);
  if (!runId) throw new Error("No run id. Pass --run-id or RAKUGAE_VERIFY_RUN_ID.");
  const meta = readMeta(runId);
  const viteUp = pidAlive(meta.vitePid);
  let http = { ok: false };
  try {
    const res = await fetch(meta.url);
    const body = await res.text();
    http = {
      ok: res.ok && body.includes("<title>ラクガエ"),
      status: res.status,
      titleMatch: body.includes("<title>ラクガエ"),
    };
  } catch (err) {
    http = { ok: false, error: err.message };
  }
  let identity = { ok: false };
  if (viteUp && http.ok) {
    try {
      const { context, page } = await openAppPage(meta);
      const logoCount = await page.locator('svg[aria-label*="ラクガエ"]').count();
      const title = await page.title();
      identity = { ok: logoCount > 0 && title.includes("ラクガエ"), title, logoCount };
      await context.close();
    } catch (err) {
      identity = { ok: false, error: err.message };
    }
  }
  const ok = viteUp && http.ok && identity.ok;
  const report = {
    ok,
    command: "doctor",
    runId,
    url: meta.url,
    vitePid: meta.vitePid,
    viteUp,
    http,
    identity,
    evidenceDir: meta.evidenceDir,
    profileDir: meta.profileDir,
  };
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!ok) process.exitCode = 2;
}

async function withPage(args, fn) {
  const runId = runIdFromArgs(args);
  if (!runId) throw new Error("No run id. Pass --run-id or RAKUGAE_VERIFY_RUN_ID.");
  const meta = readMeta(runId);
  const { context, page } = await openAppPage(meta);
  try {
    return await fn(page, meta);
  } finally {
    await context.close();
  }
}

async function dismissWelcomeIfPresent(page) {
  const heading = page.getByRole("heading", { name: "ラクガエへようこそ！" });
  try {
    await heading.waitFor({ state: "visible", timeout: 2500 });
  } catch {
    return { dismissed: false };
  }
  await page.getByRole("button", { name: "スキップ" }).click();
  await heading.waitFor({ state: "hidden", timeout: 5000 });
  return { dismissed: true };
}

async function cmdDismissWelcome(args) {
  const result = await withPage(args, async (page) => dismissWelcomeIfPresent(page));
  process.stdout.write(`${JSON.stringify({ ok: true, command: "dismiss-welcome", ...result }, null, 2)}\n`);
}

function locatorFromArgs(page, args) {
  if (args.id) return page.locator(`#${args.id}`);
  if (args.selector) return page.locator(args.selector);
  if (args.placeholder) return page.getByPlaceholder(args.placeholder);
  if (args.role && args.name) return page.getByRole(args.role, { name: args.name });
  if (args.name) return page.getByRole("button", { name: args.name });
  if (args.text) return page.getByText(args.text, { exact: args.exact !== "false" });
  throw new Error("Need --id, --selector, --placeholder, --role/--name, --name, or --text");
}

async function cmdClick(args) {
  const result = await withPage(args, async (page) => {
    await dismissWelcomeIfPresent(page);
    const loc = locatorFromArgs(page, args);
    await loc.first().click();
    return { clicked: args.id || args.name || args.text || args.selector || args.placeholder };
  });
  process.stdout.write(`${JSON.stringify({ ok: true, command: "click", ...result }, null, 2)}\n`);
}

async function cmdFill(args) {
  if (args.value === undefined) throw new Error("--value is required");
  const result = await withPage(args, async (page) => {
    await dismissWelcomeIfPresent(page);
    const loc = locatorFromArgs(page, args);
    await loc.first().fill(String(args.value));
    return { filled: args.placeholder || args.selector || args.id, value: String(args.value) };
  });
  process.stdout.write(`${JSON.stringify({ ok: true, command: "fill", ...result }, null, 2)}\n`);
}

async function cmdCount(args) {
  const result = await withPage(args, async (page) => {
    await dismissWelcomeIfPresent(page);
    const loc = locatorFromArgs(page, args);
    const count = await loc.count();
    return { selector: args.selector || args.id || args.text || args.name, count };
  });
  process.stdout.write(`${JSON.stringify({ ok: true, command: "count", ...result }, null, 2)}\n`);
}

async function cmdWaitText(args) {
  if (!args.text) throw new Error("--text is required");
  const timeout = Number(args.timeout || 5000);
  const result = await withPage(args, async (page) => {
    await page.getByText(args.text).first().waitFor({ timeout });
    return { text: args.text };
  });
  process.stdout.write(`${JSON.stringify({ ok: true, command: "wait-text", ...result }, null, 2)}\n`);
}

async function cmdScreenshot(args) {
  const result = await withPage(args, async (page, meta) => {
    const filename = args.path || join(meta.evidenceDir, `screenshot-${Date.now()}.png`);
    mkdirSync(dirname(filename), { recursive: true });
    await page.screenshot({ path: filename, fullPage: Boolean(args.fullPage) });
    const title = await page.title();
    const logo = await page.locator('svg[aria-label*="ラクガエ"]').count();
    return { path: filename, title, logoCount: logo };
  });
  process.stdout.write(`${JSON.stringify({ ok: true, command: "screenshot", ...result }, null, 2)}\n`);
}

async function cmdSnapshot(args) {
  const result = await withPage(args, async (page, meta) => {
    const filename = args.path || join(meta.evidenceDir, `aria-${Date.now()}.txt`);
    mkdirSync(dirname(filename), { recursive: true });
    const snapshot = await page.locator("body").ariaSnapshot();
    writeFileSync(filename, `${snapshot}\n`);
    return { path: filename, bytes: snapshot.length };
  });
  process.stdout.write(`${JSON.stringify({ ok: true, command: "snapshot", ...result }, null, 2)}\n`);
}

async function cmdEval(args) {
  if (!args.js) throw new Error("--js is required");
  const result = await withPage(args, async (page) => {
    const value = await page.evaluate(args.js);
    return { value };
  });
  process.stdout.write(`${JSON.stringify({ ok: true, command: "eval", ...result }, null, 2)}\n`);
}

async function cmdCleanup(args) {
  const runId = runIdFromArgs(args);
  if (!runId) throw new Error("No run id. Pass --run-id or RAKUGAE_VERIFY_RUN_ID.");
  const paths = pathsFor(runId);
  let meta = null;
  if (existsSync(paths.metaPath)) meta = readMeta(runId);
  const stopped = { vite: false };
  if (meta) {
    stopPid(meta.vitePid);
    stopped.vite = await waitPidExit(meta.vitePid, 5000);
  }
  if (existsSync(paths.instanceDir)) {
    rmSync(paths.instanceDir, { recursive: true, force: true });
  }
  const evidenceStillThere = existsSync(paths.evidenceDir);
  process.stdout.write(
    `${JSON.stringify(
      {
        ok: true,
        command: "cleanup",
        runId,
        stopped,
        instanceRemoved: !existsSync(paths.instanceDir),
        evidenceDir: paths.evidenceDir,
        evidenceStillThere,
      },
      null,
      2,
    )}\n`,
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0];
  switch (command) {
    case "launch":
      await cmdLaunch(args);
      break;
    case "doctor":
      await cmdDoctor(args);
      break;
    case "dismiss-welcome":
      await cmdDismissWelcome(args);
      break;
    case "click":
      await cmdClick(args);
      break;
    case "fill":
      await cmdFill(args);
      break;
    case "count":
      await cmdCount(args);
      break;
    case "wait-text":
      await cmdWaitText(args);
      break;
    case "screenshot":
      await cmdScreenshot(args);
      break;
    case "snapshot":
      await cmdSnapshot(args);
      break;
    case "eval":
      await cmdEval(args);
      break;
    case "cleanup":
      await cmdCleanup(args);
      break;
    default: {
      const never = command;
      throw new Error(
        `Unknown command ${never}. Use launch|doctor|dismiss-welcome|click|fill|count|wait-text|screenshot|snapshot|eval|cleanup`,
      );
    }
  }
}

main().catch((err) => {
  process.stderr.write(`${err.stack || err.message}\n`);
  process.exit(1);
});
