import React from "react";
import {
  Sparkles,
  LayoutGrid,
  Users,
  Shield,
  Shuffle,
  Eye,
} from "lucide-react";

export interface GuideItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  title: React.ReactNode;
  description: string;
  points: { title: string; desc: string }[];
  shortcuts?: { key: string; desc: string }[];
}

export const GUIDE_ITEMS: GuideItem[] = [
  {
    id: "tour",
    icon: <Sparkles size={16} />,
    label: "3分実践ツアー",
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <Sparkles size={18} /> 3分実践ツアー
      </div>
    ),
    description:
      "初めての方向けに、実際に操作しながら7つのステップで基本機能を一通りマスターできます。",
    points: [
      {
        title: "ステップ 1: テンプレートから座席を配置",
        desc: "ツールバーの「テンプレート」から教室（7×6）レイアウトを配置します。",
      },
      {
        title: "ステップ 2: 生徒を1名追加登録",
        desc: "生徒設定パネルで30人目の生徒を入力し、名簿に追加登録します。",
      },
      {
        title: "ステップ 3: 名簿を名前順に整列",
        desc: "「名前順ソート」ボタンをクリックして出席番号を五十音順に並べ替えます。",
      },
      {
        title: "ステップ 4: 6班の登録と割り当て",
        desc: "グループ設定で「6班」を追加し、座席グループを設定します。",
      },
      {
        title: "ステップ 5: 前方配慮の条件を設定",
        desc: "条件設定で視力配慮が必要な生徒を前方配慮グループに配置する条件を設定します。",
      },
      {
        title: "ステップ 6: シャッフルを実行",
        desc: "「シャッフル実行」をクリックし、条件を満たした自動座席配置を体験します。",
      },
      {
        title: "ステップ 7: 生徒閲覧モードで確認",
        desc: "「閲覧」スイッチに切り替えて、生徒発表用の表示を確認して完了です。",
      },
    ],
  },
  {
    id: "seats",
    icon: <LayoutGrid size={16} />,
    label: "座席の配置・移動",
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <LayoutGrid size={18} /> 座席の配置・移動・割り当て
      </div>
    ),
    description:
      "キャンバス上で座席カードを直感的に配置・移動・編集できます。グリッドスナップにより綺麗な整列が簡単に行えます。",
    points: [
      {
        title: "座席のドラッグ移動",
        desc: "座席カードを左ボタンドラッグすると、グリッド単位でスムーズに移動できます。",
      },
      {
        title: "生徒のスワップ（入れ替え）",
        desc: "座席の上から右ボタンドラッグして他の座席に重ねてドロップすると、生徒同士が入れ替わります。",
      },
      {
        title: "生徒の割り当て・解除",
        desc: "空席をダブルクリックするか、座席を右クリックして生徒の割り当て・解除を行えます。",
      },
      {
        title: "座席のロック（固定）",
        desc: "座席を右クリックして「座席をロック」にすると、シャッフル時もその座席に固定されます。",
      },
    ],
    shortcuts: [
      { key: "Space + ドラッグ", desc: "キャンバスのスクロール移動" },
      { key: "Ctrl + ホイール", desc: "キャンバスのズームイン / ズームアウト" },
      { key: "Ctrl + C / V", desc: "選択した座席・図形のコピー＆ペースト" },
      { key: "Delete", desc: "選択した座席・図形の削除" },
    ],
  },
  {
    id: "students",
    icon: <Users size={16} />,
    label: "生徒・役割・グループ",
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <Users size={18} /> 生徒・役割・グループの管理
      </div>
    ),
    description:
      "右側の設定パネルから名簿の登録・編集、役割（班長など）の付与、グループ（班分け）の管理を行えます。",
    points: [
      {
        title: "生徒名簿の管理",
        desc: "氏名・ふりがな・性別を登録可能。カードをドラッグして出席番号の並び替えも行えます。",
      },
      {
        title: "役割（ロール）設定",
        desc: "班長・副班長などの役職を可愛いアイコン付きで設定し、生徒に付与できます。",
      },
      {
        title: "グループ（班）設定",
        desc: "1班〜6班や「前方配慮（視力等）」などのグループをカラー別に作成・管理できます。",
      },
      {
        title: "CSVデータの入出力",
        desc: "ヘッダーの「保存」「読み込み」から名簿・グループデータをCSV形式で手軽にバックアップ・復元できます。",
      },
    ],
  },
  {
    id: "constraints",
    icon: <Shield size={16} />,
    label: "条件（制約）の設定",
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <Shield size={18} /> 条件（制約）の設定とコツ
      </div>
    ),
    description:
      "「仲の悪い生徒を離す」「各班に班長を1人ずつ配置する」などの条件を設定し、自動で最適配置を計算します。",
    points: [
      {
        title: "生徒-生徒条件",
        desc: "特定の2人の生徒を指定し、「離す（違う班）」または「一緒にする（同じ班）」を設定できます。",
      },
      {
        title: "生徒-グループ条件",
        desc: "特定の生徒を特定のグループに「入れる」または「入れない」を設定できます（例: 前方配慮グループ）。",
      },
      {
        title: "グループ-役割/性別バランス",
        desc: "各班に「男子2名以上」「班長1名以上」などの条件を設定し、偏りのない班分けを実現します。",
      },
      {
        title: "競合に強い最適化計算",
        desc: "条件同士が競合してもエラーにならず、最もペナルティの少ない最良の配置を自動で導き出します。",
      },
    ],
  },
  {
    id: "shuffle",
    icon: <Shuffle size={16} />,
    label: "シャッフルと演出",
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <Shuffle size={18} /> シャッフルの実行とアニメーション
      </div>
    ),
    description:
      "下部の「シャッフル実行」ボタンをクリックすると、設定した条件を満たす最適な座席配置を瞬時に算出します。",
    points: [
      {
        title: "ワンタップで自動最適化",
        desc: "フッター中央のオレンジボタンを押すだけで、複雑な条件を満たす座席配置を瞬時に計算します。",
      },
      {
        title: "元に戻す（Undo機能）",
        desc: "シャッフルボタン左隣の「元に戻す」ボタンで、シャッフル前の座席配置にいつでも戻せます。",
      },
      {
        title: "演出プレビュー",
        desc: "全体設定タブからシャッフル時のアニメーション演出やサウンド効果のON/OFFを設定できます。",
      },
    ],
  },
  {
    id: "viewmode",
    icon: <Eye size={16} />,
    label: "閲覧モードと印刷",
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <Eye size={18} /> 閲覧モードと印刷・エクスポート
      </div>
    ),
    description:
      "席替えの結果を発表・共有する際、生徒に見せる専用モードや印刷機能を利用できます。",
    points: [
      {
        title: "生徒閲覧モード",
        desc: "フッター右下のスイッチで切り替えます。配慮メモや役割アイコンを隠してプロジェクター等で投影できます。",
      },
      {
        title: "表示視点の切り替え",
        desc: "「教卓視点（画面上が前方）」と「生徒視点（上下左右反転）」をワンタップで切り替え可能です。",
      },
      {
        title: "A4印刷（PDF出力）",
        desc: "ブラウザの印刷機能（Ctrl+P / Cmd+P）で、A4用紙に最適化された綺麗な座席表をそのまま印刷・PDF保存できます。",
      },
    ],
  },
];
