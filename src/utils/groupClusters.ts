import type { Group, Seat, SeatLayout } from "../types";

export type ClusterEdgeFlags = {
  color: string;
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
};

const DIRS: [number, number][] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

function posKey(row: number, col: number): string {
  return `${row},${col}`;
}

function buildPosToSeat(seats: Seat[]): Map<string, Seat> {
  const m = new Map<string, Seat>();
  for (const s of seats) {
    m.set(posKey(s.row, s.col), s);
  }
  return m;
}

function findComponents(
  seatsInGroup: Seat[],
  seatSet: Set<string>,
  posToSeat: Map<string, Seat>,
  rows: number,
  cols: number,
): Set<string>[] {
  const components: Set<string>[] = [];
  const visited = new Set<string>();

  for (const start of seatsInGroup) {
    if (visited.has(start.id)) continue;
    const comp = new Set<string>();
    const queue: Seat[] = [start];
    visited.add(start.id);

    while (queue.length > 0) {
      const cur = queue.shift()!;
      comp.add(cur.id);
      const { row, col } = cur;

      for (const [dr, dc] of DIRS) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        const neighbor = posToSeat.get(posKey(nr, nc));
        if (!neighbor || !seatSet.has(neighbor.id) || visited.has(neighbor.id))
          continue;
        visited.add(neighbor.id);
        queue.push(neighbor);
      }
    }
    components.push(comp);
  }
  return components;
}

function isInComponent(
  row: number,
  col: number,
  comp: Set<string>,
  posToSeat: Map<string, Seat>,
  rows: number,
  cols: number,
): boolean {
  if (row < 0 || row >= rows || col < 0 || col >= cols) return false;
  const seat = posToSeat.get(posKey(row, col));
  return !!seat && comp.has(seat.id);
}

export function getGroupClusterBorders(
  layout: SeatLayout,
  groups: Group[],
): Map<string, ClusterEdgeFlags[]> {
  const { seats, rows, cols } = layout;
  const posToSeat = buildPosToSeat(seats);
  const result = new Map<string, ClusterEdgeFlags[]>();

  for (const group of groups) {
    const seatsInGroup = seats.filter((s) => s.groupIds.includes(group.id));
    if (seatsInGroup.length === 0) continue;

    const seatSet = new Set(seatsInGroup.map((s) => s.id));
    const components = findComponents(
      seatsInGroup,
      seatSet,
      posToSeat,
      rows,
      cols,
    );

    for (const comp of components) {
      for (const seatId of comp) {
        const seat = seats.find((s) => s.id === seatId);
        if (!seat) continue;
        const { row, col } = seat;

        const top = !isInComponent(row - 1, col, comp, posToSeat, rows, cols);
        const bottom = !isInComponent(
          row + 1,
          col,
          comp,
          posToSeat,
          rows,
          cols,
        );
        const left = !isInComponent(row, col - 1, comp, posToSeat, rows, cols);
        const right = !isInComponent(row, col + 1, comp, posToSeat, rows, cols);

        const flags: ClusterEdgeFlags = {
          color: group.color || "#000000",
          top,
          right,
          bottom,
          left,
        };
        const arr = result.get(seatId) ?? [];
        arr.push(flags);
        result.set(seatId, arr);
      }
    }
  }

  return result;
}
