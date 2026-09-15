/**
 * ラクガエ ドメインロジック API
 * UI層（React/DOM）から完全に独立した純粋関数群です。
 */

// 席替え・割り当て・制約評価ロジック
export * from "./algorithm";

// グループ（班）割り当てロジック
export * from "./group";

// 生徒操作・ソートロジック
export * from "./student";

// 教室・バス・グループテンプレート生成
export * from "./templates";

// キャンバス座標計算・バウンディングボックス・センタリング
export * from "./canvas";

// CSV入出力ロジック
export * from "./csv";
