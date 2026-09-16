# Compact layout

Width 1023px and below keeps the same header / canvas / settings / footer chrome as desktop (VS Code-style). Settings overlay the canvas instead of stacking. Touch one-finger pan and pinch live on the canvas at every width.

## Sub-features

- `compact-chrome` is `.app-shell[data-compact="true"]` with `#btn-footer-shuffle`, `#btn-footer-viewmode`, and `#btn-header-settings`.
- `compact-overlay` opens settings as an absolute panel; canvas size does not shrink.
- `wide-sidebar` at 1024px+ is `.app-shell[data-compact="false"]` with the in-flow settings column.

## How to get to it (user POV)

- Narrow the window to a phone or tablet portrait width, or open the app on those devices.
- Use the same header (guide / CSV / 設定) and footer (shuffle / 編集・閲覧) as on a laptop.
- Open 設定 to edit 生徒・役割・グループ・条件・全体設定. Tap the dimmed canvas (or 設定 again) to close it.
- Drag with one finger to pan the classroom. Pinch to zoom.

## Driving it with control-rakugae

Preconditions:

- Launch with `--viewport 390x844` (or `375x667`). Doctor green; welcome dismissed.
- `eval --js "document.querySelector('.app-shell').getAttribute('data-compact')"` is `true`.

- **Chrome.** `#btn-footer-shuffle` count is 1. `#btn-header-settings` count is 1. Screenshot `$EVIDENCE/compact-seats.png`.
- **Settings overlay.** `click --id btn-header-settings`. Heading `生徒設定` is visible. Canvas `.app-canvas` box size stays the same. Screenshot `$EVIDENCE/compact-settings.png`.
- **Tablet.** Repeat at `820x1180` if proving iPad portrait.

Geometry, overflow, toolbar wrap, and touch pan are `npm run test:phone-layout`, not this helper.

## Gotchas

- There are no `#tab-phone-*` or `#btn-phone-shuffle` handles. Desktop recipes that click `#btn-header-settings` / `#btn-footer-shuffle` apply on compact too; the drawer starts **closed** on compact mount.
- Toolbar labels are visually hidden under 1023px; accessible names remain `座席を追加`, `図形`, `テンプレート`, `自動割り当て`.
- Header button labels (はじめてガイド / 読み込み / 保存 / 設定) are visually hidden; use ids or `aria-label`.
- iPad landscape 1024px is the wide sidebar, but touch pan still works.
- Do not restack `.app-main` into a column. That was the original canvas-height bug.
