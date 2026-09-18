# 印刷の実装境界

`docs/requirements.md` §3.8 を実装するときの形。印刷は編集キャンバスを写真撮影しない。専用の印刷面を組む。

## Problem

いまの印刷はフッタの `window.print()`、`@media print` で `#canvas-main-area` を 960×640（A4 ではない 3:2）、`usePanZoom` の `beforeprint` で画面のパン／ズームを一時上書き、の 3 点である。見出し・「教卓」・編集用の色やアイコンが紙に乗る。小さい配置は 100% で止まり、大きい配置は 0.25 下限ではみ出す。0 高さバグの回避が用紙仕様になってしまっている。

先生の用途は A4 を教室に貼る／机で配置を見る、の 2 つ。氏名を 180° 回せる。座席以外の文字は出さない。はみ出さずなるべく大きく。

## Usage

`App` は画面ルートと印刷ルートを並べて持つ。フッタは印刷コマンドだけを呼ぶ。用紙・フィット・氏名の向きは呼び出し側が知らない。

```tsx
<PrintProvider>
  <div data-screen-root>
    <DesktopApp />
    <ShuffleAnimation />
    <ToastContainer />
    <OnboardingController />
  </div>
</PrintProvider>
```

`PrintProvider` が画面ルートの兄弟として印刷面を載せる。トースト・ツアー・シャッフルは `.app-shell` の外にいるので、画面ルートに含めないと紙に漏れる。

```tsx
const { requestPrint } = usePrint();
<button id="btn-footer-print" type="button" onClick={requestPrint}>印刷</button>
```

`requestPrint()` が設定（掲示用／机上確認用）を出し、確定時に `flushSync` してから `window.print()` する。`Ctrl` / `Cmd` + `P` は既に載っている印刷面を刷る（最後に確定した用途。未確定なら掲示用）。

方針の検算は DOM なしでできる。

```ts
const plan = createPrintPlan(source, "desk");
if (plan.kind === "ready") {
  expect(plan.seats[0].label?.rotation).toBe(180);
  expect(plan.seats[1].label).toBeNull();
}
```

## Shape

公開面は `requestPrint` と純粋関数 `createPrintPlan(source, mode)` の 2 つ。ブランド付き millimetre 型は置かない。

- `PrintMode`: `"wall" | "desk"`。先生が選ぶ唯一の項目。
- `createPrintPlan` が許可する文字、外接範囲、A4 縦横の比較、倍率（100% 上限なし）、中央配置、丸め後のはみ出し再縮小を一度に決める。内容の外接は既存の `getCanvasBoundingBox` を使う。
- 準備済みの計画は mm の枠だけを持つ。出席番号・ふりがな・ロール・グループ・ロック・オブジェクト文字のフィールドは型に無い。
- 空席の `label` は `null`。ランドマーク（図形）に `text` は無い。
- 180° は氏名ラベルにだけ付く。座席枠と図形は回さない。
- 向きは縦横で大きい倍率を採る。同率なら横。設定 UI に「A4 横（自動）」と出すだけ。
- 画面 CSS は `[data-screen-root]` / `[data-print-root]` の切り替えだけ。要素ごとの隠しリストは持たない。印刷ルートは mm の幅・高さを明示し、`overflow: hidden` と `max-width: 100%; height: auto` でダイアログ余白の拡大にも切れない。
- `usePanZoom` の印刷リスナー、`PRINT_SHEET_PX`、`.print-heading` は削除する。画面のパン／ズームは印刷が触らない。
- 用途の選択は非永続ストア（トーストと同じ）。`isViewMode` も `perspective` も読まない。

層は types → `src/utils/printLayout.ts` → 印刷コンポーネント → `App` / フッタ。utils は React を import しない。

## Synthesis decision

ベースは専用印刷面（候補 2）。横断判定は専用印刷面 29、SVG スナップショット 28、ライブキャンバスセッション 25、PrintIntent＋ライブ描画 22。親の初回ピックは SVG（小さい API と viewBox ではみ出し不能）だったが、SVG 案は `.app-shell` だけを隠すため `App.tsx` の兄弟（トースト・ツアー・シャッフル）が紙に残る。専用印刷面は画面ルートで兄弟ごと隠す。同系統なら隔離が閉じている方を採る。ブランド付き単位型は採用しない。

取り込み:

- 画面の視点反転は仕様に残し、印刷では実装しない（ライブキャンバス案）。
- 設定 UI に自動で選んだ「A4 横／縦（自動）」を出す（ライブキャンバス案）。
- 丸めで枠がはみ出したら一度縮小して再中央寄せする（PrintIntent 案）。
- 印刷ダイアログで余白を広げられても全体を縮小して切らない（SVG 案）。外接範囲は `getCanvasBoundingBox` を再利用（SVG 案）。

採らなかったもの:

- ライブキャンバスを `beforeprint` でフィットする。ズーム復元と隠し忘れが戻る。
- 先生に用紙の縦横を選ばせる。なるべく大きく、と矛盾する。
- フッタに「名前の向き」ボタンを常設する。390px で詰まる。設定ダイアログに寄せる。
- 座席あたり 60mm 上限。小さい配置を大きく刷る要求と矛盾する。
- 印刷要件のついでに画面の `perspective` を仕様から消す。
- SVG スタックを HTML 印刷面に混ぜる。

## Tradeoffs accepted

- 座席 DOM を二系統にする代わりに、編集状態と印刷を切り離す。
- 印刷の前に用途を一度選ぶ（いまのワンクリックより一手増える）代わりに、390px フッタを増やさない。
- 氏名だけにする（出席番号・ふりがなは出さない）代わりに、枠いっぱいに名前を大きくする。
- 図形の輪郭は残し文字は消す。教卓の位置は残るが「教卓」は出ない。
- 用途の選択はタブを閉じると消える。バックアップに「名前が逆」が残らない。

## Alternatives considered

- 編集キャンバスを印刷 CSS で隠してフィットする。呼び出し側がパン／ズームと隠しリストを知る浅い面になる。
- `SeatNode` に `variant="print"` を足す。画面用の装飾を印刷レビューまで連れてくる。
- オフスクリーン SVG だけを刷る。API は小さいが、画面ルートを閉じないと兄弟 overlay が残る。閉じたあとの HTML 印刷面と役割が重なる。

## Open questions and risks

- 低学年の壁貼りで出席番号やふりがなが後から欲しくなるか。欲しくなったら計画のラベル型を足す。初期は氏名のみ。
- 動的な `@page { size: A4 landscape|portrait }` を Safari が無視したとき、縮小して中央に載るか、向きがずれるか。
- 実プリンタのハードウェア余白が 10mm より広いとき、エミュレーションと紙面がずれるか。

## Next implementation step

`src/types/print.ts` と `createPrintPlan` のテーブルテスト（文字の除外、空席、ランドマークに文字が無いこと、180° が氏名だけ、縦横の自動選択、同率は横、100% 超の拡大、1 枚に収まること）を先に書き、React の印刷面はその後に載せる。
