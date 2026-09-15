# Shuffle

Footer `シャッフル実行` recomputes who sits where. In edit mode the result applies immediately and a toast reports success or leftover constraints. Undo restores the previous seating.

## Sub-features

- `shuffle-edit` runs `#btn-footer-shuffle` while `編集` is selected; seats update at once.
- `shuffle-toast-optimize` shows `すべての条件を満たした座席配置が完了しました！` when algorithm is 最適化 and constraints are fully met, or an error toast with `件の条件が満たせませんでした`.
- `shuffle-toast-random` shows `ランダムシャッフルが完了しました` when 全体設定 algorithm is `ランダム (単純配置)`.
- `shuffle-undo` uses the circular undo control (`title` `一つ前の配置に戻す`) after a shuffle.

## How to get to it (user POV)

- Stay in footer `編集` (not `閲覧`) for instant results.
- Optionally open settings tab `設定` and pick シャッフルアルゴリズム.
- Choose `シャッフル実行` in the footer center.
- Choose the undo button to the left of shuffle if it is enabled.

## Driving it with control-rakugae

Preconditions:

- Doctor green; welcome dismissed; default sample (30 filled seats, default constraints, algorithm `optimize`).
- `#btn-footer-shuffle` enabled (not `シャッフル中...`).
- Capture seating before shuffle.

- **Baseline seating.** `eval --js "JSON.parse(localStorage.getItem('seat-shuffle-storage')||'{}').state.seats.map(s=>s.studentId).join(',')"` write stdout to `$EVIDENCE/shuffle-before-ids.txt`. Screenshot `$EVIDENCE/shuffle-before.png`.
- **Shuffle.** `click --id btn-footer-shuffle`.
- **Toast.** `wait-text --text "すべての条件を満たした座席配置が完了しました！" --timeout 8000` **or** wait for `件の条件が満たせませんでした` if optimize cannot satisfy. Either toast is a valid completion; record which one. The run's Chrome session keeps the in-memory toast; do not expect it to survive a Chrome restart.
- **Result changed.** Re-eval the studentId join string. It must differ from the baseline (same 30 students, different seats). Screenshot `$EVIDENCE/shuffle-after.png` and snapshot `$EVIDENCE/shuffle-after.aria.txt`.
- **Undo (optional).** Click the enabled undo control (`button[title="一つ前の配置に戻す"]` via `--selector`). Eval studentId string matches the baseline file.

## Gotchas

- In `閲覧` mode shuffle animates 3–5 seconds (`シャッフル中...`) and does not use the same instant toast path. Use [view-mode.md](./view-mode.md) for that.
- Random algorithm ignores constraints; do not expect the optimize success toast.
- Toast is a timed overlay; capture it immediately. A late screenshot may miss it; the seat permutation still counts as proof if ids changed.
- Undo is disabled when `pastSeats` is empty; shuffle must run first.
- Do not prove shuffle by calling `optimizeShuffle` from eval.
- Phone shell (width ≤ 767) uses `#btn-phone-shuffle` on the seats screen, not `#btn-footer-shuffle`. Roster and constraints hide shuffle.
