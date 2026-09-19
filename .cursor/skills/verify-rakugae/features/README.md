# Rakugae verification map

This directory is the maintained source for verifying ラクガエ user-facing behavior. Read this index before driving, then use the matching feature file.

## Baseline preconditions

- Launch with `node .cursor/skills/verify-rakugae/helpers/control-rakugae.mjs launch` so HTTP and Chrome belong to this `RAKUGAE_VERIFY_RUN_ID`. Commands reuse that Chrome; they do not start a new browser per click.
- Run `doctor` and require Vite up, Chrome up, title `ラクガエ`, CDP up.
- Fresh Chrome profile: default classroom (30 seats, 30 students), settings drawer open, students tab selected, welcome modal after ~500ms.
- Dismiss welcome with `dismiss-welcome` (`スキップ`) unless the recipe is onboarding.
- Never drive a Vite/Chrome pair this run did not start.

## Driving conventions

- Start from the baseline unless a feature file says otherwise.
- Prefer button names, `#ids`, and placeholders from the skill. Japanese strings are the UI; keep them exact.
- Route every action through `control-rakugae.mjs`. Treat flags as literal.
- Restore sample data with 設定 tab → `初期サンプルを復元` → `復元する` when a recipe mutates classroom state and a later recipe needs the baseline. Do not delete proof artifacts.

## Proof and skip reporting

- Capture the click and the resulting state (count, toast, list, localStorage), not only a final screenshot.
- UI proof includes an ARIA snapshot and a screenshot with the ラクガエ logo visible.
- Record feature id and entry point with artifacts.
- An unreachable entry point is not verified by a different path.

## Feature entry contract

Each file: H1, one paragraph, then exactly `Sub-features`, `How to get to it (user POV)`, `Driving it with control-rakugae`, `Gotchas`.

## Features

- [Onboarding](./onboarding.md) — welcome modal, skip vs 3-minute tour, guide hub.
- [Canvas layout](./canvas-layout.md) — add seat, shapes, classroom templates, auto-assign.
- [Student settings](./student-settings.md) — settings drawer, student add/list/sort, other tabs.
- [Shuffle](./shuffle.md) — footer shuffle, toast, undo, optimize vs random.
- [View mode](./view-mode.md) — 編集/閲覧 toggle, settings hidden, shuffle animation path.
- [Compact layout](./phone-layout.md) — same desktop chrome, overlay settings, pinch-on-seats, touch marquee.
- [Print](./print.md) — footer print dialog, A4 sheet, view-mode paint, selection bounds.
