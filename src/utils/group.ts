import { Seat, Group } from "../types";

/**
 * 指定した座席ID配列に対して、特定のグループ（班）を割り当てます。
 * UIに依存しない純粋なドメインロジック関数です。
 */
export const assignGroupToSeats = (
  seats: Seat[],
  seatIds: string[],
  groupId: string,
): Seat[] => {
  const targetIdSet = new Set(seatIds);
  return seats.map((seat) => {
    if (!targetIdSet.has(seat.id)) return seat;
    const currentGroupIds = seat.groupIds.filter((id) => id !== groupId);
    return {
      ...seat,
      groupIds: [...currentGroupIds, groupId],
    };
  });
};

/**
 * 座席IDとグループID一覧のマッピングに基づいて、座席に班を一括割り当てます。
 */
export const assignGroupsBySeatMap = (
  seats: Seat[],
  seatGroupMap: Record<string, string[]> | Map<string, string[]>,
): Seat[] => {
  const isMap = seatGroupMap instanceof Map;
  return seats.map((seat) => {
    const groupIds = isMap
      ? (seatGroupMap as Map<string, string[]>).get(seat.id)
      : (seatGroupMap as Record<string, string[]>)[seat.id];

    if (groupIds === undefined) return seat;
    return {
      ...seat,
      groupIds: [...groupIds],
    };
  });
};

/**
 * 教室内の座席を一般的な「島・ブロック配置（2列ペア×前後分割など）」に従って
 * グループ（1班〜6班など）に均等・空間的に割り当てます。
 *
 * 例: 2人ペア×3列（計6列）、5行（計30席）で direction="right-to-left" の場合：
 * - 右ブロック（5〜6列）: 前方5席 -> 1班、後方5席 -> 2班
 * - 中央ブロック（3〜4列）: 前方5席 -> 3班、後方5席 -> 4班
 * - 左ブロック（1〜2列）: 前方5席 -> 5班、後方5席 -> 6班
 */
export const assignGroupsByBlocks = (
  seats: Seat[],
  groups: Group[],
  horizontalBlocks = 3,
  verticalBlocks = 2,
  direction: "right-to-left" | "left-to-right" = "right-to-left",
): Seat[] => {
  if (groups.length === 0 || seats.length === 0) return seats;

  // X座標のユニーク一覧を昇順取得
  const distinctX = Array.from(new Set(seats.map((s) => s.x))).sort(
    (a, b) => a - b,
  );
  if (direction === "right-to-left") {
    distinctX.reverse();
  }

  // 横方向のブロックにX座標を分割（例: 6列 -> [34,28], [20,14], [6,0]）
  const colsPerBlock = Math.max(
    1,
    Math.ceil(distinctX.length / horizontalBlocks),
  );
  const blockXGroups: number[][] = [];
  for (let i = 0; i < distinctX.length; i += colsPerBlock) {
    blockXGroups.push(distinctX.slice(i, i + colsPerBlock));
  }

  const seatGroupMap = new Map<string, string[]>();
  let groupIndex = 0;

  blockXGroups.forEach((blockCols) => {
    // 該当ブロック内の座席を抽出（Y座標昇順、次にX座標降順/昇順）
    const blockSeats = seats
      .filter((s) => blockCols.includes(s.x))
      .sort((a, b) => {
        if (Math.abs(a.y - b.y) > 0.1) return a.y - b.y;
        return direction === "right-to-left" ? b.x - a.x : a.x - b.x;
      });

    if (blockSeats.length === 0) return;

    // 縦方向のブロック数で分割（例: 10席 -> 前5席, 後5席）
    const seatsPerVBlock = Math.ceil(blockSeats.length / verticalBlocks);
    for (let v = 0; v < verticalBlocks; v++) {
      if (groupIndex >= groups.length) break;
      const group = groups[groupIndex];
      const chunk = blockSeats.slice(
        v * seatsPerVBlock,
        (v + 1) * seatsPerVBlock,
      );

      chunk.forEach((seat) => {
        seatGroupMap.set(seat.id, [group.id]);
      });
      groupIndex++;
    }
  });

  return assignGroupsBySeatMap(seats, seatGroupMap);
};

/**
 * 座席の列（X座標）ごとにグループ（班）を割り当てます。
 */
export const assignGroupsByColumn = (
  seats: Seat[],
  groups: Group[],
  direction: "left-to-right" | "right-to-left" = "right-to-left",
): Seat[] => {
  if (groups.length === 0 || seats.length === 0) return seats;

  const distinctX = Array.from(new Set(seats.map((s) => s.x))).sort(
    (a, b) => a - b,
  );
  if (direction === "right-to-left") {
    distinctX.reverse();
  }

  const xToGroupIdMap = new Map<number, string>();
  distinctX.forEach((x, index) => {
    const group = groups[index % groups.length];
    xToGroupIdMap.set(x, group.id);
  });

  return seats.map((seat) => {
    const groupId = xToGroupIdMap.get(seat.x);
    return {
      ...seat,
      groupIds: groupId ? [groupId] : [],
    };
  });
};
