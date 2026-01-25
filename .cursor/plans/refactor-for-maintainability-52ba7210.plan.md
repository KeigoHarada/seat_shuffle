---
name: 名無し席シャッフルバグ修正計画
overview: ""
todos:
  - id: 4be5454e-de08-421b-82f5-6f4089ba3623
    content: 定数ファイルを作成（roleIcons.ts, colors.ts, layout.ts）
    status: pending
  - id: 7fad268e-4ddf-4a8c-a757-9faae1a565e6
    content: ユーティリティヘルパーを作成（studentHelpers.ts, conditionHelpers.ts）
    status: pending
  - id: 6bb075dd-60d6-4ae4-9044-820bdc6b417e
    content: 大きな関数を分割（initializeDefaultLayout等）
    status: pending
  - id: 3978999e-880e-41cb-9992-670a4a4260b2
    content: SeatGridコンポーネントを分割（GroupMenu, SeatEditor, hooks）
    status: pending
  - id: 7af5386f-08a8-4b4b-b1e9-ab142f8b4ae0
    content: ConditionManagerコンポーネントを分割（各種Form, ConditionCard）
    status: pending
  - id: 2429ee6f-a1ab-4a7c-81df-7e87c9ff5b63
    content: 型エラー修正と未使用コード削除
    status: pending
---

# 名無し席シャッフルバグ修正計画

## 問題の原因分析

### 根本原因

`RandomShuffleAlgorithm.ts`の20-21行目で名無し席の判定ロジックに問題がある：

```typescript
const currentUnnamedSeats = availableSeats.filter(seat => !seat.studentId || seat.studentId === undefined);
const currentNamedSeats = availableSeats.filter(seat => seat.studentId && seat.studentId !== undefined);
```

この判定では、`studentId`プロパティが存在しない席（名無し席）が正しく検出されない可能性がある。

### 具体的な問題点

1. `!seat.studentId`は`studentId`が`undefined`、`null`、空文字列の場合にtrueになる
2. しかし、プロパティ自体が存在しない場合の判定が不十分
3. `seat.studentId === undefined`は明示的に`undefined`の場合のみtrueになる

## 修正手順

### ステップ1: デバッグログの追加

`RandomShuffleAlgorithm.ts`にデバッグログを追加して、名無し席が正しく識別されているか確認：

- 行16-17の後に、`availableSeats`の各席の状態をログ出力
- 行20-21の後に、`currentUnnamedSeats`と`currentNamedSeats`の数をログ出力
- 行26-49の間で、`assignment`の内容をログ出力

### ステップ2: 名無し席判定ロジックの修正

`RandomShuffleAlgorithm.ts`の20-21行目を修正：

```typescript
// 修正前
const currentUnnamedSeats = availableSeats.filter(seat => !seat.studentId || seat.studentId === undefined);
const currentNamedSeats = availableSeats.filter(seat => seat.studentId && seat.studentId !== undefined);

// 修正後
const currentUnnamedSeats = availableSeats.filter(seat => !('studentId' in seat) || seat.studentId === undefined);
const currentNamedSeats = availableSeats.filter(seat => 'studentId' in seat && seat.studentId !== undefined && seat.studentId !== null && seat.studentId !== '');
```

`'studentId' in seat`でプロパティの存在を正確にチェックする。

### ステップ3: seatStore.tsのシャッフル結果適用ロジックの検証

`seatStore.ts`の266-280行目が正しく動作しているか確認：

- `result.assignment[seat.id]`が`undefined`の場合に正しく`studentId`プロパティが削除されているか
- デバッグログで`newSeats`の内容を確認

### ステップ4: 型定義の確認

`types/index.ts`の`Seat`インターフェースを確認し、`studentId?: string`が正しく定義されているか確認。

### ステップ5: テストとログの削除

修正後、デバッグログを削除して最終確認を行う。

## 期待される結果

- シャッフル実行前に名無し席が2席存在
- シャッフル実行後も名無し席が2席のまま保持される
- 名無し席には「名無し」と表示される
- 生徒はシャッフルされるが、名無し席の位置は変わらない
