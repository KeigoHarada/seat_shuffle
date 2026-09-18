# Student settings

The right-hand settings drawer holds roster, roles, groups, constraints, and global data tools. Teachers add students by name (required) from the 生徒 tab.

## Sub-features

- `settings-toggle` shows/hides the drawer with header `設定` (`#btn-header-settings`).
- `tab-students` is the default tab (`#tab-btn-students`, heading `生徒設定`).
- `student-add` appends a roster row from `#student-add-form`.
- `student-sort` reorders attendance numbers via `#btn-sort-students`.
- `other-tabs` switch `#tab-btn-roles`, `#tab-btn-groups`, `#tab-btn-constraints`, `#tab-btn-global`.

## How to get to it (user POV)

- Header `設定` opens or closes the sidebar (absent in 閲覧 mode).
- Choose tab `生徒` for the roster.
- Fill `名前 (必須)` (optional `ふりがな`, 性別, 役割) and choose `追加`.
- Choose the A–Z control next to `ふりがな / 名前` to sort.
- Other tabs: `役割`, `グループ`, `条件`, and the inner `設定` tab for algorithm / restore / clear.

## Driving it with control-rakugae

Preconditions:

- Doctor green; welcome dismissed; not in 閲覧 mode.
- `#settings-main-area` visible on wide chrome (default launch has the drawer open). On compact (≤ 1023) the overlay starts closed; `click --id btn-header-settings` first.
- `#tab-btn-students` selected; heading `生徒設定`; sample names such as `く太郎` exist in the list.

- **Open drawer if needed.** If `#student-add-form` is missing, `click --id btn-header-settings`. Form heading `新規生徒の追加` appears.
- **Baseline.** `eval --js "JSON.parse(localStorage.getItem('seat-shuffle-storage')||'{}').state.students.length"` is 30. Screenshot `$EVIDENCE/students-before.png`.
- **Add student.** `fill --placeholder "名前 (必須)" --value "検証太郎"` then `click --name "追加"` on the same run session (Chrome stays open; the form value is still in React state). Button `追加` stays disabled until the name field is non-empty.
- **See the row.** `wait-text --text "検証太郎"`. Eval students.length is 31. Screenshot `$EVIDENCE/students-after-add.png` and snapshot `$EVIDENCE/students-after-add.aria.txt`.
- **Switch tab (smoke).** `click --id tab-btn-global` then `wait-text --text "シャッフルアルゴリズム"`. This is not student-add proof; it only shows the tab strip works.

## Gotchas

- Header `設定` and tab `設定` (`#tab-btn-global`) share the visible label `設定`. Use ids when both are on screen.
- Compact overlay uses the same `#tab-btn-students` heading `生徒設定` as the desktop sidebar. It starts closed; open it with `#btn-header-settings`.
- Gender defaults to その他 if left unset (`StudentAddForm`). Do not assert a specific gender unless you chose `性別を選択`.
- Roster rows are not links; proof is the name text plus storage length.
- Roster names live in list textboxes. `wait-text --text "検証太郎"` may miss them; prove with eval `students.length` and a snapshot that includes `textbox "名前": 検証太郎`.
- `名簿を取り込む` (`#btn-header-roster`) and `バックアップ` (`#btn-header-backup`) live in the header. Backup opens a `保存` / `読み込み` menu. The roster input accepts `.csv`; `sample_30_students.csv` at the repo root is a loadable sample. Helper `fill` does not attach files unless you extend it; report skip rather than fake import. Student settings is add/edit only. The global tab has no `バックアップ・引き継ぎ` card.
- `データを全消去（空にする）` wipes the classroom. Do not use it as setup for other features unless you restore afterward.
