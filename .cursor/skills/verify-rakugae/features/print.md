# Print

Footer `印刷` opens a settings dialog, then the browser print dialog. The paper matches 閲覧: attendance, furigana, name, `空席`, and object text such as `教卓`. A canvas selection prints only those items.

## Sub-features

- `print-dialog` opens from `#btn-footer-print` and offers `掲示用（文字を正立）` / `机上確認用（文字を 180° 回転）`.
- `print-orientation` shows `A4 横（自動）` or `A4 縦（自動）` from the current target bounds.
- `print-sheet` is `[data-print-root]`. Screen chrome lives under `[data-screen-root]` and is hidden in print media.
- `print-selection` uses the canvas selection at dialog open. No selection prints the whole classroom.

## How to get to it (user POV)

- Keep at least one seat or object on the canvas.
- Optionally drag a marquee over seats or objects.
- Press footer `印刷`. Choose 掲示用 or 机上確認用. Press `印刷する`.
- Confirm or cancel the browser print dialog.

## Driving it with control-rakugae

Preconditions:

- Doctor green; welcome dismissed; default classroom.
- Native `window.print()` must not be confirmed. Use print-media emulation for sheet proof.

- **Open settings.** `click --id btn-footer-print`. Dialog `#print-dialog` shows `掲示用（文字を正立）` and an `A4` orientation line.
- **Cancel.** `click --id btn-print-cancel`. Dialog is gone. Canvas zoom text is unchanged.
- **Sheet paint.** Reopen `#btn-footer-print`. `eval` after `matchMedia('print')` is not enough; drive `emulateMedia` only in `npm run test:phone-layout` or a CDP eval that reads `[data-print-root] .print-seat` and `.print-landmark`. Expect `山田` (or another assigned name), `空席` if any seat is empty, and `教卓`. Expect no role SVG in the print root.
- **Empty canvas.** Clear seats and objects, then `click --id btn-footer-print`. Toast `印刷できる座席や図形がありません`. No dialog.

## Gotchas

- `#btn-footer-print` no longer calls `window.print()` directly. The dialog is required for the footer path. `Ctrl+P` uses the last confirmed mode (or 掲示用) and the live selection.
- Print does not flip `isViewMode` or rewrite pan/zoom. A zoom change after print is a regression.
- View mode blocks marquee selection. Selection print is an edit-mode gesture.
- Do not persist print mode or selection. Reloading the tab resets the last mode to 掲示用.
