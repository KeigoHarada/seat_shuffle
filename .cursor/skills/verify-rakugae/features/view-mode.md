# View mode

Footer `編集` / `閲覧` switches teacher layout editing versus a presentation view. View mode hides the settings drawer and header 設定, and shuffle uses a timed animation.

## Sub-features

- `enter-view` selects `閲覧` on `#btn-footer-viewmode`.
- `hide-settings` removes `#btn-header-settings` and collapses the sidebar while viewing.
- `return-edit` selects `編集` and restores settings + canvas toolbar editing.
- `view-shuffle` runs shuffle with animation (`なし` waits ~5s, others ~3s) and label `シャッフル中...`.

## How to get to it (user POV)

- Use the footer right-hand pill: `編集` vs `閲覧`.
- In 閲覧, present the seating chart; settings and seat editing chrome go away.
- Shuffle from the same footer button; wait until `シャッフル中...` returns to `シャッフル実行`.

## Driving it with control-rakugae

Preconditions:

- Doctor green; welcome dismissed; currently `編集` (default).
- `#btn-header-settings` exists; `#settings-main-area` in the DOM with non-zero sidebar.

- **Baseline edit.** `count --selector "#btn-header-settings"` is 1. Screenshot `$EVIDENCE/view-edit.png`.
- **Enter view.** `click --id btn-footer-viewmode`. The pill moves to `閲覧`.
- **Settings gone.** `count --selector "#btn-header-settings"` is 0. Canvas toolbar `座席を追加` is not shown. Screenshot `$EVIDENCE/view-browse.png` and snapshot `$EVIDENCE/view-browse.aria.txt` with logo still visible.
- **Return edit.** `click --id btn-footer-viewmode` again. `#btn-header-settings` returns (count 1).

## Gotchas

- The toggle is one button containing both labels; click `#btn-footer-viewmode`, not the word `閲覧` as a separate control (both labels stay in the tree).
- Phone shell uses two buttons in the seats shuffle bar (`#btn-phone-viewmode` 編集, `#btn-phone-viewmode-view` 閲覧). The toggle is absent on 名簿 and 条件.
- `isSettingsOpen` stays true in the store while viewing; the App gate is `isSettingsOpen && !isViewMode`. Do not treat store `isSettingsOpen` as "drawer visible".
- View-mode shuffle is slow; do not use it as the fast shuffle proof in [shuffle.md](./shuffle.md).
- Group color fills on seats are suppressed in view mode (`SeatNode` uses surface color).
