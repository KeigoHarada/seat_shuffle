import React from "react";
import { LayoutGrid, Users, Shield, Shuffle } from "lucide-react";

export interface GuideItem {
  id: string;
  label: string;
  title: string;
  description: string;
  points: string[];
  hint?: React.ReactNode;
  shortcuts?: { key: string; desc: string }[];
  videos?: {
    url: string;
    title: string;
    description?: string;
    steps?: string[];
  }[];
}

export interface GuideCategory {
  id: string;
  label: string;
  iconNode?: React.ReactNode;
  items: GuideItem[];
}

export const TOUR_ITEM: GuideItem = {
  id: "tour",
  label: "3分実践ツアーを始める",
  title: "3分実践ツアー",
  description:
    "実際の画面を操作しながら、ラクガエの基本的な使い方を一通り体験できるツアーです。",
  points: [
    "右上の「3分ツアーを開始」ボタンをクリックすると、画面上にスポットライトと指示が表示されます。",
    "指示パネルの右上の「✕（閉じる）」ボタンを押すと、いつでもツアーをスキップ・中断できます。",
  ],
};

export const GUIDE_CATEGORIES: GuideCategory[] = [
  {
    id: "layout",
    label: "1. 座席のレイアウト",
    iconNode: <LayoutGrid size={16} />,
    items: [
      {
        id: "place_seats",
        label: "座席を配置したい",
        title: "座席を配置したい",
        description: "キャンバス上に新しく座席を追加して配置する方法です。",
        points: [],
        videos: [
          {
            url: "rakugae-001.mp4",
            title: "方法1：テンプレートから作成する",
            steps: [
              "キャンバス上部のメニューから「テンプレート」ボタンをクリックします。",
              "お好みのレイアウトを選択します。",
              "キャンバスに選択したレイアウトに応じた座席が配置されます。",
            ],
          },
          {
            url: "rakugae-002.mp4",
            title: "方法2：キャンバス上から直接作成する",
            steps: [
              "キャンバス上で右クリックします。",
              "「座席を新規作成」をクリックすると、座席が追加されます。"
            ],
          },
        ],
      },
      {
        id: "move_seats",
        label: "座席をまとめて移動させたい",
        title: "座席をまとめて移動させたい",
        description:
          "複数の座席をまとめて動かしたり、きれいに整列させる方法です。",
        points: ["（動画準備中）"],
      },
      {
        id: "assign_student",
        label: "生徒を席に割り当てたい",
        title: "生徒を席に割り当てたい",
        description: "空席に特定の生徒を手動で割り当てる方法です。",
        points: ["（動画準備中）"],
      },
      {
        id: "swap_students",
        label: "生徒を入れ替えたい",
        title: "生徒を入れ替えたい",
        description: "配置済みの生徒同士の座席を入れ替える方法です。",
        points: ["（動画準備中）"],
      },
      {
        id: "lock_seat",
        label: "特定の生徒の席を固定したい",
        title: "特定の生徒の席を固定したい",
        description:
          "シャッフルしても動かないように、特定の生徒の座席を固定化させます。",
        points: ["（動画準備中）"],
      },
      {
        id: "assign_group",
        label: "座席にグループを割り当てたい",
        title: "座席にグループを割り当てたい",
        description: "特定の座席に班などのグループ属性を割り当てる方法です。",
        points: ["（動画準備中）"],
      },
    ],
  },
  {
    id: "students",
    label: "2. 生徒・名簿の管理",
    iconNode: <Users size={16} />,
    items: [
      {
        id: "manage_student",
        label: "生徒を登録/変更/削除したい",
        title: "生徒を登録/変更/削除したい",
        description: "名簿に生徒を追加したり、情報を修正・削除する方法です。",
        points: ["（動画準備中）"],
      },
      {
        id: "import_export",
        label: "名簿のインポート/エクスポートがしたい",
        title: "名簿のインポート/エクスポートがしたい",
        description:
          "CSVファイルを使って名簿データを一括で読み込み・書き出しする方法です。",
        points: ["（動画準備中）"],
      },
      {
        id: "sort_students",
        label: "生徒を名前順に整列させたい",
        title: "生徒を名前順に整列させたい",
        description:
          "名簿リストの生徒を名前順（または出席番号順）に並び替える方法です。",
        points: ["（動画準備中）"],
      },
    ],
  },
  {
    id: "constraints",
    label: "3. 条件・制約の指定",
    iconNode: <Shield size={16} />,
    items: [
      {
        id: "register_role",
        label: "役割を登録したい",
        title: "役割を登録したい",
        description:
          "班長や日直などの役割（ロール）を作成して生徒に付与する方法です。",
        points: ["（動画準備中）"],
      },
      {
        id: "register_group",
        label: "グループを登録したい",
        title: "グループを登録したい",
        description: "班や属性などのグループを作成する方法です。",
        points: ["（動画準備中）"],
      },
      {
        id: "leader_constraint",
        label: "班ごとに班長を必ず1人割り当てたい",
        title: "班ごとに班長を必ず1人割り当てたい",
        description:
          "シャッフル時に各班に班長が均等に配置されるようにする条件設定です。",
        points: ["（動画準備中）"],
      },
      {
        id: "front_row",
        label: "目が悪い人を前の座席に置きたい",
        title: "目が悪い人を前の座席に置きたい",
        description:
          "視力への配慮が必要な生徒を、前方の座席に優先配置する設定です。",
        points: ["（動画準備中）"],
      },
      {
        id: "separate_students",
        label: "特定の生徒を離したい",
        title: "特定の生徒を離したい",
        description: "相性の悪い生徒同士が近くならないように条件を設定します。",
        points: ["（動画準備中）"],
      },
    ],
  },
  {
    id: "shuffle",
    label: "4. シャッフルと共有",
    iconNode: <Shuffle size={16} />,
    items: [
      {
        id: "presentation_mode",
        label: "生徒に設定を見られずに、席替え用のシャッフルを見せたい",
        title: "生徒に設定を見られずに、席替え用のシャッフルを見せたい",
        description:
          "配慮メモなどの設定を隠して、生徒向けの発表用画面（閲覧モード）にする方法です。",
        points: ["（動画準備中）"],
      },
      {
        id: "change_animation",
        label: "シャッフルアニメーションを変更したい",
        title: "シャッフルアニメーションを変更したい",
        description:
          "席替え結果を発表する際のアニメーション演出を切り替える方法です。",
        points: ["（動画準備中）"],
      },
    ],
  },
];

export const GUIDE_ITEMS: GuideItem[] = [
  TOUR_ITEM,
  ...GUIDE_CATEGORIES.flatMap((c) => c.items),
];
