---
name: verify-rakugae
description: Drive ラクガエ (Rakugae), the local Vite+React seating-shuffle SPA, with Playwright Core against an isolated Chrome profile. Use when proving canvas, settings, shuffle, view-mode, or onboarding behavior the way a teacher would use the UI.
---

# Verify Rakugae

Agent-facing control skill for the **ラクガエ** seating-shuffle web app in this repo (`package.json` name `rakugae`). Primary surface is a single-page browser UI at a local Vite URL. There is no CLI, no backend, and no auth. All student/seat state lives in the browser (`localStorage` keys `seat-shuffle-storage` and `seat-shuffle-onboarding`).

Read `features/README.md` before driving. Drive the real UI. Do not call Zustand setters from `page.evaluate` to fake a user action; eval is for read-only proof (counts, persisted JSON) after the click path.

Helper path below is relative to the repo root. Prefix every command with the same `RAKUGAE_VERIFY_RUN_ID` (and port) so you never attach to someone else's session.

```bash
export RAKUGAE_VERIFY_RUN_ID="${RAKUGAE_VERIFY_RUN_ID:-run-$(date -u +%Y%m%dT%H%M%SZ)}"
H="node .cursor/skills/verify-rakugae/helpers/control-rakugae.mjs"
```

## Launch

Preconditions: Node 22+ (repo `.nvmrc` is 24; 22 works). From repo root:

```bash
npm install
npm install --prefix .cursor/skills/verify-rakugae/helpers
```

The app's documented start is `npm run dev` (`vite`, `server.host: true`, default port **5173**). Verification launches a **strict** dedicated port, a **separate Chrome user-data-dir**, and a **run-scoped Chrome session** (CDP). Commands attach, then `browser.close()` only the Playwright client — Chrome stays up. In-page React state (forms, menus, toasts, guide hub, welcome overlay) survives across `$H` calls. Zustand persist in that profile is extra shared state. `launch` refuses the port if anything already answers HTTP there, and fails if this run's `vitePid` dies while the URL still looks like ラクガエ.

```bash
$H launch --port 5173
```

Ready when:

- stdout JSON has `"ok": true` and a `url` like `http://127.0.0.1:5173/`
- `$H doctor` reports `viteUp`, `chromeUp`, `http.ok` (200, `<title>ラクガエ`), and `identity.ok` (page title plus `svg[aria-label*="ラクガエ"]`)

Vite log: `/tmp/rakugae-verify/$RAKUGAE_VERIFY_RUN_ID/instance/vite.log`

First paint opens the welcome modal after ~500ms when `seat-shuffle-onboarding.hasCompletedOnboarding` is false (fresh profile). Dismiss it before canvas/settings work:

```bash
$H dismiss-welcome
```

That clicks the button named `スキップ`. Overlay heading `ラクガエへようこそ！` must disappear. Do not start the 3-minute tour unless the feature file is `onboarding.md`. `click` / `fill` / `count` auto-skip welcome only when the target is **not** a welcome control (`スキップ`, `3分ガイドを始める`, `ラクガエへようこそ！`). Launch waits for the delayed overlay (~500ms) before returning, so a following screenshot can prove `welcome-open`.

Teardown is **Cleanup**, not Ctrl-C by process name.

Isolation:

- One run owns one HTTP port (`--port` / `RAKUGAE_VERIFY_PORT`, default 5173) with `--strictPort`.
- Profile is `/tmp/rakugae-verify/<run-id>/instance/chrome-profile`.
- Chrome CDP stays up for the run (`chromePid` + `cdpPort` in `instance/run.json`).
- Two runs can coexist if ports and run ids differ. **Do not** drive `localhost:5173` unless doctor shows it is this run's `vitePid` **and** `chromePid`. A shared developer tab will share or overwrite `seat-shuffle-storage`.

## Doctor

Run before driving, and again if anything looks off:

```bash
$H doctor
```

Require all of:

- `viteUp: true` for `vitePid` in `instance/run.json`
- `chromeUp: true` for `chromePid` (same Chrome the commands attach to)
- `http.ok: true` (status 200, HTML title starts with `ラクガエ`)
- `identity.ok: true` (this run's URL shows the ラクガエ logo)

If doctor fails, cleanup this run and relaunch. Do not click around a foreign Vite.

## Drive

Harness: Playwright Core `connectOverCDP` to this run's Chrome (`/usr/bin/google-chrome-stable`, `--user-data-dir` under the run instance). Each `$H` command attaches, drives the existing page, then closes the Playwright client without killing Chrome. All interaction goes through `$H`. Prefer **button accessible names** (Japanese UI strings), **ids** that exist in source, and **placeholders**. Coordinates are last resort.

Stable handles (from `src/`):

| Handle | Kind | Where |
|---|---|---|
| `svg[aria-label*="ラクガエ"]` | logo | header identity |
| `はじめてガイド` | button | `#header-guide-btn` |
| `名簿を取り込む` / `バックアップを保存` / `バックアップを読み込む` | buttons | 生徒タブ。全体設定の `バックアップ・引き継ぎ` にも保存と読み込みがある |
| `印刷` | button | `#btn-footer-print` |
| `設定` | button | `#btn-header-settings` (hidden in view mode) |
| `座席を追加` | button | canvas toolbar |
| `図形` then `四角形` / `円形` | buttons | canvas toolbar |
| `テンプレート` then `教室` / `4人席` / `6人席（縦）` / `6人席（横）` | buttons | `#btn-toolbar-template`, `#btn-template-classroom` etc. |
| `自動割り当て` | button | canvas toolbar |
| `.seat-node-item` | seats | canvas; empty seats show text `空席` |
| `#tab-btn-students` `生徒` | tab | settings; default tab on launch |
| `#tab-btn-roles` `役割` | tab | settings |
| `#tab-btn-groups` `グループ` | tab | settings |
| `#tab-btn-constraints` `条件` | tab | settings |
| `#tab-btn-global` `設定` | tab | settings global (same visible label as header settings) |
| `#student-add-form` | region | `名前 (必須)` placeholder, button `追加` |
| `#btn-sort-students` | button | furigana/name sort |
| `シャッフル実行` | button | `#btn-footer-shuffle` |
| `編集` / `閲覧` | toggle | `#btn-footer-viewmode` |
| `スキップ` | button | welcome modal |

Examples:

```bash
$H click --name "座席を追加"
$H click --id btn-footer-shuffle
$H click --id tab-btn-students
$H fill --placeholder "名前 (必須)" --value "検証太郎"
$H click --name "追加"
$H count --selector ".seat-node-item"
$H wait-text --text "すべての条件を満たした座席配置が完了しました！" --timeout 8000
$H screenshot --path /tmp/rakugae-verify/$RAKUGAE_VERIFY_RUN_ID/evidence/after.png
$H snapshot --path /tmp/rakugae-verify/$RAKUGAE_VERIFY_RUN_ID/evidence/after.aria.txt
```

`click --name` is `getByRole(button, { name, exact: true })` so `追加` does not match `座席を追加`. For non-buttons use `--role` + `--name` or `--text`. Pass `--exact false` only if you need substring names.

Default persisted classroom (fresh profile, after skipping welcome): **30 seats**, **30 sample students**, settings drawer **open**, students tab active, algorithm **optimize**. Header `設定` uses class `btn-primary` when the drawer is open.

Recipes live in `features/`. Start from that baseline unless a feature file says otherwise.

## Evidence

Root: `/tmp/rakugae-verify/<run-id>/evidence/` (also printed as `evidenceDir` on launch). Cleanup **must not** delete this directory.

Every proof:

1. Exercise the user path (button/placeholder), not store mutation.
2. Capture **before** and **after** (screenshot + ARIA snapshot).
3. Record a second observable: seat count, toast text, `localStorage['seat-shuffle-storage']` via `$H eval`, list row text.
4. Screenshots must show the header logo (`aria-label` contains `ラクガエ`) so the surface is identifiable.
5. Note `runId`, URL, feature id, and entry point next to the files (write `evidence/proof.json` if you do not already have a log).

Read-only eval example after a UI mutation:

```bash
$H eval --js "JSON.parse(localStorage.getItem('seat-shuffle-storage')||'{}').state.seats.length"
```

Mocks: none for core seating. The Ofuse donation widget (`#btn-support-donate`, loads `ofuse.me`) is an external boundary; do not treat network success there as app proof.

## Cleanup

```bash
$H cleanup
```

Sends SIGTERM (then SIGKILL if needed) only to `chromePid` and `vitePid` from this run's `instance/run.json` (process groups of this run's Chrome and `npx vite` leader), then deletes `instance/` (Chrome profile, pid file, logs). Leaves `evidence/` in place.

Do not `pkill vite` / `pkill chrome`. Do not wipe `/tmp/rakugae-verify/<run-id>/evidence`.

After cleanup, confirm evidence files still exist before reporting success.

## Helpers

Install once per checkout:

```bash
npm install --prefix .cursor/skills/verify-rakugae/helpers
```

Executable:

```bash
node .cursor/skills/verify-rakugae/helpers/control-rakugae.mjs <command>
```

Commands: `launch`, `doctor`, `dismiss-welcome`, `click`, `fill`, `count`, `wait-text`, `screenshot`, `snapshot`, `eval`, `cleanup`.

Optional flags: `--run-id`, `--port`, `--viewport WIDTHxHEIGHT` (default `1440x900`; phone proof uses `390x844`). Env: `RAKUGAE_VERIFY_RUN_ID`, `RAKUGAE_VERIFY_PORT`, `RAKUGAE_VERIFY_VIEWPORT`, `RAKUGAE_VERIFY_ROOT` (default `/tmp/rakugae-verify`), `RAKUGAE_CHROME` (default `/usr/bin/google-chrome-stable`).

Compact chrome (width ≤ 1023) is the same shell with an overlay settings panel. Geometry (overflow, toolbar wrap, overlay, touch pan) is `npm run test:phone-layout`.

If `playwright-core` is missing, the helper tells you to run the `npm install --prefix` line above. Chrome is launched from `/usr/bin/google-chrome-stable`. Do not use `/usr/local/bin/google-chrome` here: that wrapper forces port 9222 and `~/.config/google-chrome`, which is the shared desktop session. This skill does not download Playwright browsers.

Keep the feature map honest with `/maintain-verification-skill` when UI strings, ids, or startup change.
