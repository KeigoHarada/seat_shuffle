# DESIGN.md — ラクガエ

> 席替え支援Webアプリ「ラクガエ」のデザイン仕様書。
> 教育現場向けツールのトーン＆マナーを定義する。

---

## 1. Visual Theme & Atmosphere

- **デザイン方針**: 清潔感があり信頼できる、教育現場に馴染むシンプルで少し温かみのあるデザイン。
- **密度**: 座席表（キャンバス）画面は情報が多くなるため、UI要素同士の余白を十分に確保し、圧迫感を与えない構成にする。
- **キーワード**: 温かみ、信頼感、清潔、シンプル、親しみやすい
- **特徴**: 先生にとっての「使いやすい業務ツール」としての側面と、生徒に見せたときの「親しみやすさ・エンタメ性」を両立する。

---

## 2. Color Palette & Roles

### Primary（ブランドカラー）

温かみと活気を感じさせる「オレンジ・イエロー系」を基調とする。

- **Primary Orange / `--c-primary`** (`#F59E0B`): メインのブランドカラー。主要なCTA（シャッフル実行ボタンなど）に使用。
- **Primary Hover / `--c-primary-hover`** (`#D97706`): ボタンホバー時の色。
- **Primary Pale / `--c-primary-pale`** (`#FEF3C7`): アクティブなタブや選択状態の背景色。

### Category Theme Colors（班・グループのテーマ色 - 全10色）

座席表上で各班（グループ）を区別するための色。目に優しく温かみのあるパステル・マカロン調を採用。

1. **Group Pink** (`#FCA5A5`): 赤・ピンク系班
2. **Group Blue** (`#93C5FD`): 青系班
3. **Group Green** (`#86EFAC`): 緑系班
4. **Group Yellow** (`#FDE047`): 黄色系班
5. **Group Purple** (`#D8B4FE`): 紫系班
6. **Group Orange** (`#FDBA74`): オレンジ系班
7. **Group Mint/Teal** (`#5EEAD4`): ミント・青緑系（前方配慮等）
8. **Group Rose** (`#F472B6`): ローズピンク系
9. **Group Indigo** (`#A78BFA`): 藍・バイオレット系
10. **Group Slate** (`#CBD5E1`): スレートグレー系

### Surface（面色）

- **Background / `--c-bg-main`** (`#F8FAFC`): アプリ全体の背景色（極めて薄い青みを含んだオフホワイト・Slate50）。清潔感を出す。
- **Surface / `--c-surface`** (`#FFFFFF`): 座席カード、モーダル、設定パネルの背景（純白）。
- **Surface Disabled / `--c-surface-disabled`** (`#E2E8F0`): 無効状態や空席のプレースホルダー。

### Text

純黒は使わず、視認性を保ちつつ柔らかさのあるグレー系を使用。

- **Text Main / `--c-text-main`** (`#334155`): 本文・見出しなどすべての基本色（Slate-700）。
- **Text Sub / `--c-text-sub`** (`#64748B`): 補足テキスト、プレースホルダー、アイコン等（Slate-500）。
- **Text Inverse / `--c-text-inverse`** (`#FFFFFF`): Primaryボタン上のテキスト色。

---

## 3. Brand Identity (Logo & Favicon)

### 3.1 シンボルマーク (Symbol Mark)

- **モチーフ**: 「座席（机/椅子）」×「シャッフル・回転（チェンジ）」×「楽しい・ラク（笑顔・ワクワク）」
- **形状**: 角丸スクエア（Squircle、Radius 25〜28%）。
- **カラーリング**:
  - 背景: Primary Orangeの温かいグラデーション（`#FBBF24` → `#F59E0B` → `#D97706`）。
  - 座席カード: 清潔なホワイト（`#FFFFFF`）に、アクセントとしてパステルグループカラー（ブルー `#93C5FD` / ピンク `#FCA5A5`）の帯を配置。
  - スワップ矢印: なめらかな時計回りの円弧矢印（ホワイト、太めの丸みのあるライン、角丸ストローク）。
  - スパークル: 中央に配置された小さな光彩（`#FEF3C7`）。席替えの楽しさやワクワク感を演出。
- **視認性**: 16×16pxの極小ファビコンから、64×64px以上の高解像度アプリアイコンまで、縮小しても形状がはっきりと認識できるシンプルなベクター設計。

### 3.2 タイトルロゴ (Title Logo)

- **構成**: `[ シンボルマーク (SVG) ]` + `[ ブランド名「ラクガエ」 (ロゴタイプ) ]` (+ オプション: サブタグライン)
- **ロゴタイプ**:
  - フォント: `Zen Maru Gothic`, 700 (Bold)
  - カラー: `--c-text-main` (`#334155`)
  - 文字間: `0.04em`
  - アクセント: 「ガ」の濁点にブランドカラー（Primary Orange `#F59E0B`）の丸みを帯びたアクセントを適用。
- **提供アセット（完全SVGベクター形式）**:
  - `public/favicon.svg`: 64×64 viewBoxの正方形ファビコン用ベクターSVG
  - `public/logo.svg`: 220×48 viewBoxの標準フルロゴ（タグライン付き）
  - `public/logo-compact.svg`: 160×36 viewBoxのヘッダー用コンパクトロゴ（タグラインなし）
- **用途**:
  - ヘッダー（`Header.tsx`）: H1として配置。
  - オンボーディング・ウェルカムモーダル等でのブランド表示。

---

## 4. Typography Rules

### 4.1 フォント設定

やや丸みのあるゴシック体を使い、教育現場向けの少しの温かみと親しみやすさを出す。

- **和文・欧文共通**: `Zen Maru Gothic` (Google Fonts)
- **フォールバック**: `"Rounded Mplus 1c", "Hiragino Maru Gothic ProN", "Quicksand", sans-serif`

```css
:root {
  --font-family-main:
    "Zen Maru Gothic", "Rounded Mplus 1c", "Hiragino Maru Gothic ProN",
    sans-serif;
}
body {
  font-family: var(--font-family-main);
}
```

### 4.2 文字サイズ・ウェイト階層

| Role            | Size | Weight        | Line Height | Letter Spacing | 備考                       |
| --------------- | ---- | ------------- | ----------- | -------------- | -------------------------- |
| H1 (Page Title) | 24px | 700 (Bold)    | 1.4         | 0.05em         | アプリタイトル等           |
| H2 (Section)    | 20px | 700 (Bold)    | 1.4         | 0.05em         | 「生徒一覧」「制約設定」等 |
| H3 (Block)      | 16px | 700 (Bold)    | 1.5         | 0.05em         | パネル内の小見出し         |
| Body            | 14px | 400 (Regular) | 1.6         | 0.05em         | 通常のテキスト             |
| Seat Name       | 14px | 500 (Medium)  | 1.2         | 0.02em         | 座席上の生徒名             |
| Caption / Ruby  | 11px | 400 (Regular) | 1.2         | 0.02em         | ふりがな、補助テキスト     |

### 4.3 行間・字間

- **本文**: `line-height: 1.6`、`letter-spacing: 0.05em` で少しゆとりを持たせ、読みやすさを確保する。
- **座席カード内**: 面積が限られるため `line-height: 1.2` とし、要素をコンパクトに収める。

---

## 5. Component Stylings

### Buttons

**Primary Button（メインアクション）**

- Background: `#F59E0B` (`--c-primary`)
- Hover: `#D97706` (`--c-primary-hover`)
- Text: `#FFFFFF`
- Border Radius: **8px**（やわらかい角丸）
- Shadow: Level 1

**Secondary Button（サブアクション・キャンセル等）**

- Background: `#FFFFFF` (`--c-surface`)
- Border: 1px solid `#CBD5E1` (`--c-border`)
- Text: `#334155` (`--c-text-main`)
- Hover: `#F1F5F9` (`--c-surface-hover`)
- Border Radius: **8px**
- Shadow: Level 1

**Danger Button（破壊的アクション・削除・消去）**

- Solid (`.btn-danger`): Background `#EF4444`, Hover `#DC2626`, Text `#FFFFFF`, Border Radius **8px**, Shadow: Level 1
- Outline (`.btn-danger-outline`): Background `#FFFFFF`, Border `1px solid #FEE2E2`, Text `#EF4444`, Hover `#FEE2E2`, Border Radius **8px**, Shadow: Level 1
- Icon (`.btn-icon-danger`): Background `transparent`, Text `#64748B`, Hover Background `#FEE2E2`, Hover Text `#EF4444`, Border Radius **8px**

### Modals & Dialogs (確認ダイアログ)

ユーザーの重要操作・破壊的変更の確認に用いるダイアログ。

- Backdrop: `rgba(15, 23, 42, 0.4)`、`backdrop-filter: blur(4px)`
- Container: Background `#FFFFFF`、Border `1px solid #CBD5E1`、Border Radius **12px**、Shadow Level 3
- Padding: 24px
- Width: 最大 380px（モバイル時は 90vw）
- アニメーション: `scaleIn`（0.2s cubic-bezier(0.16, 1, 0.3, 1)）

### Cards & Panels

- Background: `#FFFFFF`
- Border: 1px solid `#E2E8F0`（非常に薄い枠線）
- Border Radius: **12px**（ボタンより少し大きめの角丸）
- Padding: 16px - 24px
- Shadow: Level 1

### Popover (吹き出しメニュー)

座席への手動アサイン時などに座席の横に表示されるポップオーバー。

- Background: `#FFFFFF`
- Border: 1px solid `#E2E8F0`
- Border Radius: **12px**
- Shadow: Level 3 (画面上に浮いているため強い影)
- Padding: 16px
- Width: 約280px

### Onboarding Spotlight & Tooltip (3分実践ツアー)

アプリ初回体験や機能ガイド用のスポットライト演出と連動吹き出し。ユーザーが実際にUI操作を行って進める実践型。

- **Spotlight Backdrop**: `rgba(15, 23, 42, 0.5)`、対象要素の周囲に4〜8pxのパディングと角丸（Radius 8-12px）のクリップ領域を確保。
- **Spotlight Ring**: 対象要素の外周に `box-shadow: 0 0 0 4px #F59E0B, 0 0 16px rgba(245, 158, 11, 0.4)` のやさしいパルス付きハイライト枠。
- **Tooltip Card**:
  - Background: `#FFFFFF`、Border: `1px solid #CBD5E1`、Border Radius: **12px**、Shadow: Level 3
  - Width: 340px〜380px
  - 構成要素: ステップバッジ（`ステップ 1 / 7`）、見出しタイトル（H3・16px Bold）、説明文（Body・14px）、操作指示バッジ（「👉 [操作内容]」/「✨ 操作完了！」）、フッター操作群（「スキップ」「前へ」「次へ」ボタン）
- **Transition**: ステップ遷移時のスポットライト位置移動は `transition: all 0.3s cubic-bezier(0.2, 0, 0, 1)` で滑らかに追従。

### Guide Hub Modal (操作振り返り・ガイドハブ)

ヘッダーからいつでも開ける機能別ガイド＆チュートリアルモーダル。

- **Backdrop**: `rgba(15, 23, 42, 0.4)`、`backdrop-filter: blur(4px)`
- **Modal Window**: Background `#FFFFFF`、Width `840px` (Max `90vw`)、Height `clamp(480px, 75vh, 600px)`、Border Radius **12px**、Shadow Level 3
- **2カラム構成**:
  - **左カラム（逆引きメニュー / 260px）**: Background `#F8FAFC`、Border-right `1px solid #E2E8F0`。「やりたいこと」ベースのアコーディオン型メニュー（全てのカテゴリはデフォルトで開いた状態）。カテゴリを展開して個別アクションを選択。アクティブ時は `#FEF3C7` 背景に Primary Orange アクセント。一番上には目立つスタイルで「3分実践ツアーを始める」を配置。
  - **右カラム（コンテンツエリア）**: 上下に分割された縦積みレイアウト。
    - **上部（ビジュアルエリア）**: 選択中の操作を示す動画用プレビュー枠（動画は後で挿入するため空の枠として用意、角丸8px、Shadow Level 1）。
    - **下部（テキスト解説エリア）**: ステップバイステップの手順（箇条書き）、キーボードショートカット、ヒント。
    - （※「3分実践ツアーを始める」選択時のみ、大きく「ツアーを開始」ボタンを中央に配置）

### Seat Node (座席オブジェクト)

キャンバス上に配置される座席。

- Background: グループ指定がない場合は `#FFFFFF`。指定がある場合はパステルテーマカラー。
- Border: 1px solid `#CBD5E1`
- Border Radius: **8px**
- Padding: 8px
- Shadow: Level 1（キャンバスから少し浮いている表現）
- Size: Width: 約100px, Height: 約60px（表示内容により調整）

### Form Controls (Inputs & Checkboxes)

**Text & Number Input**

- Background: `#FFFFFF` (`--c-surface`)
- Border: `1px solid #CBD5E1` (`--c-border`)
- Focus: Border `#F59E0B` (`--c-primary`), Focus Ring `0 0 0 2px #FEF3C7` (`--c-primary-pale`)
- Border Radius: **8px** (`--radius-md`)
- Font: `Zen Maru Gothic`

**Checkbox**

やわらかい丸みを帯びた角と、ブランドカラー（Primary Orange）を基調とした親しみやすいデザイン。

- Size: **18px × 18px** (タッチ・クリックしやすい適切なサイズ感)
- Border Radius: **5px** (角丸)
- Unchecked: Background `#FFFFFF` (`--c-surface`), Border `1.5px solid #CBD5E1` (`--c-border`)
- Unchecked Hover: Border `1.5px solid #F59E0B` (`--c-primary`), Background `#FEF3C7` (`--c-primary-pale`)
- Checked: Background `#F59E0B` (`--c-primary`), Border `1.5px solid #F59E0B`, Icon (白いチェックマーク)
- Checked Hover: Background `#D97706` (`--c-primary-hover`), Border `1.5px solid #D97706` (濃いオレンジで白アイコンのコントラスト維持)
- Indeterminate: Background `#F59E0B` (`--c-primary`), Border `1.5px solid #F59E0B`, Icon (白いマイナスバー)
- Indeterminate Hover: Background `#D97706` (`--c-primary-hover`), Border `1.5px solid #D97706`
- Focus Visible: `box-shadow: 0 0 0 2px #FEF3C7`
- Disabled: Background `#E2E8F0` (`--c-surface-disabled`), Border `1.5px solid #CBD5E1`, Cursor `not-allowed`

---

## 6. Layout Principles

### Spacing Scale (4の倍数ルール)

| Token | Value | 用途                                 |
| ----- | ----- | ------------------------------------ |
| XS    | 4px   | アイコンとテキストの間               |
| S     | 8px   | リストアイテム間、座席カード内の余白 |
| M     | 16px  | セクション内の標準的な余白           |
| L     | 24px  | パネルのパディング                   |
| XL    | 32px  | 大きなセクション間の区切り           |

---

## 7. Depth & Elevation

柔らかく薄いドロップシャドウを使用し、座席やカードをふんわり浮かせる（モダンで押しやすさを演出）。

| Level | CSS (box-shadow)                                                    | 用途                               |
| ----- | ------------------------------------------------------------------- | ---------------------------------- |
| 0     | `none`                                                              | 背景、ベタ塗り領域                 |
| 1     | `0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)`            | ボタン、カード、キャンバス上の座席 |
| 2     | `0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)`  | ホバー時の座席・ボタン             |
| 3     | `0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)` | モーダルダイアログ、ドロップダウン |

---

## 8. Do's and Don'ts

### Do（推奨）

- フォントには「Zen Maru Gothic」を使用し、親しみやすさを出す。
- 座席やボタンの角は必ず丸める（Radius 8-12px）。
- 班ごとの色分けにはパステル調の淡い色を使い、生徒名が読みやすいようにする。
- 影は極力薄く柔らかく設定し、重苦しい印象を避ける。

### Don't（禁止）

- 純黒（#000000）をテキストに使用しない（#334155 等のダークグレーを使用）。
- 完全にシャープな角（Radius 0px）を用いない。
- ビビッドで目に刺さる原色（純赤・純青など）を広い面積に使用しない。

---

## 9. Responsive Behavior

- **ターゲット**: 教員のPCが主。同じシェルをタブレット／電話でも使う（VS Code 方式）。行き先を「座席／名簿／条件」に分けない。
- **View は単一ツリー**: `src/views` のヘッダー・キャンバス・設定・フッタを全幅で使う。電話専用 chrome は置かない。
- **コンパクト（幅 1023px 以下、iPad 縦を含む）**: ヘッダー／フッタを一行のまま縮める（ラベルはアイコン化）。`app-main` は横並びに保ち、設定はキャンバスの上に重ねるオーバーレイ。マウント時は設定を閉じ、キャンバス高さを確保する。
- **ワイド（1024px 以上）**: 設定は右サイドバー。開閉はヘッダーの「設定」。
- **キャンバス**: パン・ズームが基本。コンパクトでは教室が収まるまで 25% まで縮小してよい。タッチ（`pointerType === "touch"`）は空きキャンバスで指一本パン、二本でピンチ。座席の上はドラッグ、520ms 止まるとコンテキストメニュー。マウスのドラッグとマーキーは変えない。
- **品質**: `npm run test:phone-layout` が 375 / 390 / 820 / 1280 で横溢れ・ツールバー折り返し・コンパクト時の設定オーバーレイ・タッチパンを落とす。

---

## 10. Agent Prompt Guide

### クイックリファレンス

```
Primary Orange: #F59E0B (--c-primary)
Background: #F8FAFC (--c-bg-main)
Surface: #FFFFFF (--c-surface)
Text: #334155 (純黒は使わない)
Font: "Zen Maru Gothic", sans-serif
Border Radius: 8px (Button/Seat), 12px (Card/Panel)
Shadow: 薄く柔らかい (0 1px 3px rgba(0,0,0,0.05))
Group Colors: パステル調 (#FCA5A5, #93C5FD, #86EFAC, #FDE047, #D8B4FE, #FDBA74)
```

### プロンプト例

```
ラクガエのデザインシステムに従って、新規生徒追加ダイアログを作成してください。
- フォント: "Zen Maru Gothic"
- 背景: #FFFFFF、角丸 12px
- 影: Level 3 のシャドウでふんわり浮かせる
- テキスト: メインは #334155。
- 「追加」ボタン: Primary Orange (#F59E0B)、白文字、角丸 8px
- 「キャンセル」ボタン: 白背景、ボーダー #CBD5E1、角丸 8px
```
