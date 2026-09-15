# Phone layout

Width 767px and below uses a separate phone view tree (`src/views/phone`). Destinations are 座席 / 名簿 / 条件. Shuffle and 編集/閲覧 live on seats only.

## Sub-features

- `phone-seats` shows canvas, icon toolbar, `#btn-phone-shuffle`, and `#btn-phone-viewmode`.
- `phone-roster` is `#tab-phone-roster` with inner `#tab-phone-roster-students` / `roles` / `groups`.
- `phone-constraints` is `#tab-phone-constraints` with heading `条件`.
- `phone-global` is メニュー → `全体設定`.

## How to get to it (user POV)

- Narrow the window to a phone width, or open the app on a phone.
- Use the bottom tabs to move between 座席, 名簿, and 条件.
- Shuffle from the seats bar. Open メニュー for CSV, はじめてガイド, 全体設定, and 利用規約.

## Driving it with control-rakugae

Preconditions:

- Launch with `--viewport 390x844` (or `375x667`). Doctor green; welcome dismissed.
- `eval --js "document.querySelector('[data-kind]').getAttribute('data-kind')"` is `phone`.

- **Seats.** `#btn-phone-shuffle` count is 1. `#btn-footer-shuffle` count is 0. Screenshot `$EVIDENCE/phone-seats.png`.
- **Roster.** `click --id tab-phone-roster`. `#btn-phone-shuffle` count is 0. `#btn-phone-viewmode` count is 0. Screenshot `$EVIDENCE/phone-roster.png`.
- **Constraints.** `click --id tab-phone-constraints`. Heading `条件` is visible.

Geometry proof for overflow and toolbar wrap is `npm run test:phone-layout`, not this helper.

## Gotchas

- Desktop recipes that click `#btn-header-settings` or `#btn-footer-shuffle` do not apply on phone.
- Toolbar labels are visually hidden; accessible names remain `座席を追加`, `図形`, `テンプレート`, `自動割り当て`.
- iPad portrait 768px stays on the desktop tree.
