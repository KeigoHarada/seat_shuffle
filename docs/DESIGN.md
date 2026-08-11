# DESIGN.md — 席替え先生

> 席替え支援Webアプリ「席替え先生」のデザイン仕様書。
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

### Category Theme Colors（班・グループのテーマ色）

座席表上で各班（グループ）を区別するための色。目に優しく温かみのあるパステル・マカロン調を採用。

- **Group Pink** (`#FCA5A5`): 赤・ピンク系班
- **Group Blue** (`#93C5FD`): 青系班
- **Group Green** (`#86EFAC`): 緑系班
- **Group Yellow** (`#FDE047`): 黄色系班
- **Group Purple** (`#D8B4FE`): 紫系班
- **Group Orange** (`#FDBA74`): オレンジ系班

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

## 3. Typography Rules

### 3.1 フォント設定

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

### 3.2 文字サイズ・ウェイト階層

| Role            | Size | Weight        | Line Height | Letter Spacing | 備考                       |
| --------------- | ---- | ------------- | ----------- | -------------- | -------------------------- |
| H1 (Page Title) | 24px | 700 (Bold)    | 1.4         | 0.05em         | アプリタイトル等           |
| H2 (Section)    | 20px | 700 (Bold)    | 1.4         | 0.05em         | 「生徒一覧」「制約設定」等 |
| H3 (Block)      | 16px | 700 (Bold)    | 1.5         | 0.05em         | パネル内の小見出し         |
| Body            | 14px | 400 (Regular) | 1.6         | 0.05em         | 通常のテキスト             |
| Seat Name       | 14px | 500 (Medium)  | 1.2         | 0.02em         | 座席上の生徒名             |
| Caption / Ruby  | 11px | 400 (Regular) | 1.2         | 0.02em         | ふりがな、補助テキスト     |

### 3.3 行間・字間

- **本文**: `line-height: 1.6`、`letter-spacing: 0.05em` で少しゆとりを持たせ、読みやすさを確保する。
- **座席カード内**: 面積が限られるため `line-height: 1.2` とし、要素をコンパクトに収める。

---

## 4. Component Stylings

### Buttons

**Primary Button（メインアクション）**

- Background: `#F59E0B`
- Text: `#FFFFFF`
- Border Radius: **8px**（やわらかい角丸）
- Shadow: Level 1

**Secondary Button（キャンセル等）**

- Background: `#FFFFFF`
- Border: 1px solid `#CBD5E1`
- Text: `#334155`
- Border Radius: **8px**

### Cards & Panels

- Background: `#FFFFFF`
- Border: 1px solid `#E2E8F0`（非常に薄い枠線）
- Border Radius: **12px**（ボタンより少し大きめの角丸）
- Padding: 16px - 24px
- Shadow: Level 1

### Seat Node (座席オブジェクト)

キャンバス上に配置される座席。

- Background: グループ指定がない場合は `#FFFFFF`。指定がある場合はパステルテーマカラー。
- Border: 1px solid `#CBD5E1`
- Border Radius: **8px**
- Padding: 8px
- Shadow: Level 1（キャンバスから少し浮いている表現）
- Size: Width: 約100px, Height: 約60px（表示内容により調整）

---

## 5. Layout Principles

### Spacing Scale (4の倍数ルール)

| Token | Value | 用途                                 |
| ----- | ----- | ------------------------------------ |
| XS    | 4px   | アイコンとテキストの間               |
| S     | 8px   | リストアイテム間、座席カード内の余白 |
| M     | 16px  | セクション内の標準的な余白           |
| L     | 24px  | パネルのパディング                   |
| XL    | 32px  | 大きなセクション間の区切り           |

---

## 6. Depth & Elevation

柔らかく薄いドロップシャドウを使用し、座席やカードをふんわり浮かせる（モダンで押しやすさを演出）。

| Level | CSS (box-shadow)                                                    | 用途                               |
| ----- | ------------------------------------------------------------------- | ---------------------------------- |
| 0     | `none`                                                              | 背景、ベタ塗り領域                 |
| 1     | `0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)`            | ボタン、カード、キャンバス上の座席 |
| 2     | `0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)`  | ホバー時の座席・ボタン             |
| 3     | `0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)` | モーダルダイアログ、ドロップダウン |

---

## 7. Do's and Don'ts

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

## 8. Responsive Behavior

- **ターゲット**: 主に教員のPC（ノートPC / デスクトップ）での利用を想定。
- **キャンバスエリア**: パン・ズーム操作を基本とし、画面サイズに依存せず広々と使える設計にする。
- **サイドパネル**: ウィンドウ幅が狭い場合は、サイドパネルを折りたたむかオーバーレイ表示にする。

---

## 9. Agent Prompt Guide

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
席替え先生のデザインシステムに従って、新規生徒追加ダイアログを作成してください。
- フォント: "Zen Maru Gothic"
- 背景: #FFFFFF、角丸 12px
- 影: Level 3 のシャドウでふんわり浮かせる
- テキスト: メインは #334155。
- 「追加」ボタン: Primary Orange (#F59E0B)、白文字、角丸 8px
- 「キャンセル」ボタン: 白背景、ボーダー #CBD5E1、角丸 8px
```
