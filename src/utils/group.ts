import { Seat, Group } from "../types";

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

export const assignGroupsByBlocks = (
  seats: Seat[],
  groups: Group[],
  horizontalBlocks = 3,
  verticalBlocks = 2,
  direction: "right-to-left" | "left-to-right" = "right-to-left",
): Seat[] => {
  if (groups.length === 0 || seats.length === 0) return seats;

  const distinctX = Array.from(new Set(seats.map((s) => s.x))).sort(
    (a, b) => a - b,
  );
  if (direction === "right-to-left") {
    distinctX.reverse();
  }

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
    const blockSeats = seats
      .filter((s) => blockCols.includes(s.x))
      .sort((a, b) => {
        if (Math.abs(a.y - b.y) > 0.1) return a.y - b.y;
        return direction === "right-to-left" ? b.x - a.x : a.x - b.x;
      });

    if (blockSeats.length === 0) return;

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
