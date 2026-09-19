# 印刷の実装境界

`docs/requirements.md` §3.8 を実装するときの形。印刷は編集キャンバスを写真撮影しない。専用の印刷面を組む。見た目は生徒閲覧モード。選択中ならその範囲だけ。

## Problem

いまの印刷はフッタの `window.print()`、`@media print` で `#canvas-main-area` を 960×640（A4 ではない 3:2）、`usePanZoom` の `beforeprint` で画面のパン／ズームを一時上書き、の 3 点である。編集用の班色やアイコンが紙に乗る一方、教卓などの図形を意図どおり残す方針が無かった。小さい配置は 100% で止まり、大きい配置は 0.25 下限ではみ出す。選択範囲だけを大きく刷る経路も無い。

先生の用途は A4 を教室に貼る／机で配置を見る、の 2 つ。紙は閲覧モードと同じ情報量。ドラッグで選んだ座席・図形だけを刷れる。はみ出さずなるべく大きく。

## Usage

`App` は画面ルートと印刷ルートを並べて持つ。フッタは印刷コマンドだけを呼ぶ。用紙・フィット・文字の向き・選択の解釈は呼び出し側が知らない。

```tsx
<div data-screen-root>
  <MainView />
  <ShuffleAnimation />
  <ToastContainer />
  <OnboardingController />
</div>
<PrintArea />
```

`PrintArea` が画面ルートの兄弟として印刷面（`PrintSheet`）とダイアログ（`PrintDialog`）を載せる。トースト・ツアー・シャッフルは `.app-shell` の外にいるので、画面ルートに含めないと紙に漏れる。

```tsx
const openPrintDialog = usePrintSessionStore((state) => state.openPrintDialog);
<button id="btn-footer-print" type="button" onClick={openPrintDialog}>印刷</button>
```

`requestPrint()` が設定（掲示用／机上確認用）を出し、確定時にその時点の `selectedIds` を読んで `flushSync` してから `window.print()` する。`Ctrl` / `Cmd` + `P` は既に載っている印刷面を刷る（最後に確定した用途。未確定なら掲示用。対象は開いた時点の選択）。

方針の検算は DOM なしでできる。

```ts
const all = createPrintPlan(source, "wall");
const group = createPrintPlan(source, "desk", ["seat-a", "seat-b", "desk"]);
const portrait = createPrintPlan(source, "wall", undefined, "portrait");

if (group.kind === "ready") {
  expect(group.seats.map((s) => s.id).sort()).toEqual(["seat-a", "seat-b"]);
  expect(group.landmarks.map((l) => l.id)).toEqual(["desk"]);
  expect(group.seats[0].label?.rotation).toBe(180);
  expect(group.seats[0].label?.name).toBeTruthy();
  expect(group.landmarks[0].text).toBe("教卓");
  expect(group.landmarks[0].rotation).toBe(180);
}
if (portrait.kind === "ready") {
  expect(portrait.page.orientation).toBe("portrait");
}
```

未選択はキャンバス全体。`selectedIds` が 1 件以上ならその ID の座席と図形だけ。相対位置は世界座標のまま。外接だけが狭くなる。

## Shape

公開面は `requestPrint` と純粋関数 `createPrintPlan(source, mode, selectedIds?, orientation?)` の 2 つ。ブランド付き millimetre 型は置かない。

- `PrintMode`: `"wall" | "desk"`。先生が選ぶ用途。
- `PrintOrientation`: `"landscape" | "portrait"`。先生が選ぶ用紙向き。初期値は横。省略時だけ外接の大きい倍率を採る（同率なら横）。
- `selectedIds` が空または省略なら全座席・全図形。1 件以上ならその集合。存在しない ID は無視する。残った対象が 0 件なら `kind: "empty"`。
- `createPrintPlan` が閲覧相当の文字、外接範囲、選んだ向きへの倍率（100% 上限なし）、中央配置、丸め後のはみ出し再縮小を一度に決める。内容の外接は既存の `getCanvasBoundingBox` に、対象だけを渡す。
- 座席ラベルは閲覧と同じ: 出席番号、ふりがな、氏名。空席は `"空席"`。ロール・グループ・ロックのフィールドは型に無い。
- 図形は枠（四角／円）と任意の `text`（「教卓」）を持つ。リサイズつまみは型に無い。
- 180° は座席の文字と図形の文字に付く。座席枠と図形の位置は回さない。
- 向きは設定 UI の「A4 横」「A4 縦」。用途と同じ非永続ストアに持つ。選んだ向きの余白に収まるまで拡大／縮小する。
- 画面 CSS は `[data-screen-root]` / `[data-print-root]` の切り替えだけ。要素ごとの隠しリストは持たない。`@page` 余白は 0。見た目の 10mm は印刷ルートの padding。シートは縦横とも contain する。座席・図形はシートに対する割合で置くので、ブラウザ余白で用紙が狭くなっても切れない。左下 URL・右下日付は余白 0 のため出ない。
- `usePanZoom` の印刷リスナー、`PRINT_SHEET_PX`、`.print-heading` は削除する。画面のパン／ズーム／選択は印刷が書き戻さない。
- 用途と向きの選択は非永続ストア（トーストと同じ）。`isViewMode` も `perspective` も読まない。閲覧相当の情報量は `createPrintPlan` が決める。

層は types → `src/services/printLayout.ts` → 印刷コンポーネント → `App` / フッタ。services は React を import しない。選択 ID はキャンバスの `useSelection` から Provider が読む。

## Synthesis decision

ベースは専用印刷面のまま。この改訂で製品方針だけを差し替えた。

- 紙の情報量は「氏名だけ」から **閲覧モード相当** へ。図形本体と「教卓」などの文字を出す。出席番号・ふりがな・「空席」も出す。班色・ロール・ロックは出さない。
- 印刷対象は「常に全体」から、**未選択なら全体、選択中ならその座席・図形だけ** へ。フィットの外接もその集合。

形（画面ルートと印刷ルート、`createPrintPlan`、パン／ズーム非破壊）は変えない。

## Tradeoffs accepted

- 座席 DOM を二系統にする代わりに、編集状態と印刷を切り離す。
- 印刷の前に用途を一度選ぶ代わりに、390px フッタを増やさない。
- 閲覧と同じ文字量にする代わりに、氏名だけのときより文字は小さくなる。図形と出席番号が残る。
- 選択範囲だけを刷る。選んでいない教卓は紙に出ない（島だけ大きく出したいとき用）。全体が欲しいときは選択を外す。
- 用途の選択はタブを閉じると消える。選択集合は印刷設定に保存しない。

## Alternatives considered

- 編集キャンバスを印刷 CSS で隠してフィットする。選択範囲フィットと閲覧ペイントを画面ツリーに混ぜると、パン／ズームと隠しリストが戻る。
- 印刷のときだけ `isViewMode` を true にする。画面がチラつき、閲覧モードの永続値と混ざる。
- 選択中でも常に教室全体を刷る。島や数列だけ大きく出したい要求と矛盾する。

## Open questions and risks

- 動的な `@page { size: A4 landscape|portrait }` を Safari が無視したとき、縮小して中央に載るか、向きがずれるか。
- 実プリンタのハードウェア余白が 10mm より広いとき、エミュレーションと紙面がずれるか。
- 閲覧モード中はポインタがパン専用で、マーキー選択できない。選択印刷は編集モードの操作が前提。閲覧のまま `Ctrl+P` すると未選択＝全体になる。それでよいか。

## Next implementation step

`createPrintPlan` のテーブルテストは、閲覧相当のラベル・図形文字・未選択は全体・選択 ID だけが残ること・机上確認では座席文字と図形文字の両方が 180°、を固定する。
