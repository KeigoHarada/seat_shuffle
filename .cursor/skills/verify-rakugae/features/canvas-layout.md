# Canvas layout

Teachers build the seating chart on an infinite canvas: add seats, decorative shapes, packed templates, and auto-assign students to empty seats. Default sample data already places a 30-seat classroom.

## Sub-features

- `add-seat` adds one seat from toolbar `座席を追加`.
- `add-shapes` adds `四角形` or `円形` from `図形`.
- `apply-template` inserts `教室`, `4人席`, `6人席（縦）`, or `6人席（横）` from `テンプレート`.
- `auto-assign` runs toolbar `自動割り当て` and fills empty seats using 全体設定 `自動割り当ての並び順`.

## How to get to it (user POV)

- After skipping welcome, use the floating toolbar at the top-left of the canvas.
- Choose `座席を追加` for a single seat.
- Choose `図形` then `四角形` or `円形`.
- Choose `テンプレート` then a layout name (`#btn-template-classroom` is `教室`).
- Choose `自動割り当て` to place unseated students.

## Driving it with control-rakugae

Preconditions:

- Doctor green; welcome dismissed.
- Baseline 30 `.seat-node-item` nodes (default classroom). Confirm with `count --selector ".seat-node-item"`.
- Settings may stay open; canvas toolbar remains visible.

- **Baseline capture.** Run `screenshot --path $EVIDENCE/canvas-before.png` and `snapshot --path $EVIDENCE/canvas-before.aria.txt`. Logo `ラクガエ` is in the header; toolbar includes `座席を追加`.
- **Add seat.** Run `click --name "座席を追加"`. Run `count --selector ".seat-node-item"`. Count is **31**. New node includes text `空席` unless immediately assigned.
- **Confirm store.** Run `eval --js "JSON.parse(localStorage.getItem('seat-shuffle-storage')||'{}').state.seats.length"`. Value is 31 (Zustand persist may flush on the next tick; if 30, wait 500ms and eval again).
- **Proof screenshot.** Run `screenshot --path $EVIDENCE/canvas-after-add-seat.png` and `snapshot --path $EVIDENCE/canvas-after-add-seat.aria.txt`. Record feature id `add-seat` and entry `座席を追加`.
- **Template (optional extra).** `click --id btn-toolbar-template` then `click --id btn-template-classroom` adds another classroom block; seat count jumps by the template size, not by 1. Do not treat that as `add-seat` proof.

## Gotchas

- Seats are `div.seat-node-item` with no role. Count that class, not `getByRole`.
- Toolbar `pointerdown` is stopped on the toolbar root; click the button name, not a canvas coordinate.
- `自動割り当て` needs empty seats; the default sample has every seat filled, so assign does nothing visible until you add a seat or clear a student.
- View mode hides editing tools; switch to `編集` via `#btn-footer-viewmode`.
- Compact toolbar buttons keep accessible names (`座席を追加`) via `aria-label` even when the visible label is hidden.
- Right-click canvas context menu is an alternate add path; it is not covered by the named toolbar recipe above — report skip if you cannot open it via the helper.
