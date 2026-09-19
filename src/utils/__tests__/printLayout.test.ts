import { describe, expect, it } from "vitest";
import {
  createPrintPlan,
  type PrintPlan,
  type PrintSource,
} from "../printLayout";

const CLASSROOM_COL_X = [0, 6, 14, 20, 28, 34];
const CLASSROOM_ROW_Y = [0, 6, 12, 18, 24];

function classroomSource(): PrintSource {
  const seats: Array<PrintSource["seats"][number]> = [];
  let n = 0;
  for (const x of CLASSROOM_COL_X) {
    for (const y of CLASSROOM_ROW_Y) {
      n += 1;
      const id = `seat-${String(n).padStart(2, "0")}`;
      seats.push({
        id,
        studentId: n === 30 ? null : `student-${String(n).padStart(2, "0")}`,
        x,
        y,
      });
    }
  }

  const students: PrintSource["students"] = seats.flatMap((seat) => {
    if (!seat.studentId) return [];
    const number = Number(seat.studentId.slice("student-".length));
    return [
      {
        id: seat.studentId,
        name: `生徒${number}`,
        furigana: `セイト${number}`,
        attendanceNumber: number,
      },
    ];
  });

  return {
    students,
    seats,
    objects: [
      {
        id: "desk",
        type: "rectangle",
        x: 16,
        y: -6,
        width: 8,
        height: 4,
        text: "教卓",
      },
    ],
  };
}

function expectReady(
  plan: PrintPlan,
): asserts plan is Extract<PrintPlan, { kind: "ready" }> {
  expect(plan.kind).toBe("ready");
}

function expectFramesInside(plan: Extract<PrintPlan, { kind: "ready" }>): void {
  const { contentWidthMm, contentHeightMm } = plan.page;
  const frames = [
    ...plan.seats.map((seat) => seat.frame),
    ...plan.landmarks.map((landmark) => landmark.frame),
  ];
  for (const frame of frames) {
    expect(frame.xMm).toBeGreaterThanOrEqual(0);
    expect(frame.yMm).toBeGreaterThanOrEqual(0);
    expect(frame.xMm + frame.widthMm).toBeLessThanOrEqual(contentWidthMm);
    expect(frame.yMm + frame.heightMm).toBeLessThanOrEqual(contentHeightMm);
  }
}

describe("createPrintPlan", () => {
  it("fits a 30-seat classroom and 教卓 on A4 landscape with upright labels", () => {
    const plan = createPrintPlan(classroomSource(), "wall");
    expectReady(plan);
    expect(plan.mode).toBe("wall");
    expect(plan.page.paper).toBe("A4");
    expect(plan.page.orientation).toBe("landscape");
    expect(plan.page.marginMm).toBe(10);
    expect(plan.page.contentWidthMm).toBe(277);
    expect(plan.page.contentHeightMm).toBe(190);
    expect(plan.seats).toHaveLength(30);
    expect(plan.seats.map((seat) => seat.id)).toEqual(
      Array.from(
        { length: 30 },
        (_, i) => `seat-${String(i + 1).padStart(2, "0")}`,
      ),
    );
    expect(plan.landmarks).toHaveLength(1);
    expect(plan.landmarks[0]?.id).toBe("desk");
    expect(plan.landmarks[0]?.text).toBe("教卓");
    expect(plan.landmarks[0]?.shape).toBe("rectangle");
    expect(plan.landmarks[0]?.rotation).toBe(0);
    expect(plan.seats.every((seat) => seat.label.rotation === 0)).toBe(true);
    expectFramesInside(plan);
  });

  it("rotates seat and landmark labels in desk mode and keeps frames", () => {
    const source = classroomSource();
    const wall = createPrintPlan(source, "wall");
    const desk = createPrintPlan(source, "desk");
    expectReady(wall);
    expectReady(desk);
    expect(desk.mode).toBe("desk");
    expect(desk.page.orientation).toBe(wall.page.orientation);
    expect(desk.seats).toHaveLength(30);
    expect(desk.seats.every((seat) => seat.label.rotation === 180)).toBe(true);
    expect(desk.landmarks).toHaveLength(1);
    expect(desk.landmarks[0]?.text).toBe("教卓");
    expect(desk.landmarks[0]?.rotation).toBe(180);
    expect(wall.landmarks[0]?.rotation).toBe(0);
    expect(desk.landmarks.map((landmark) => landmark.frame)).toEqual(
      wall.landmarks.map((landmark) => landmark.frame),
    );
    expect(desk.seats.map((seat) => seat.frame)).toEqual(
      wall.seats.map((seat) => seat.frame),
    );
  });

  it("returns empty when the source has no seats or objects", () => {
    expect(
      createPrintPlan({ students: [], seats: [], objects: [] }, "wall"),
    ).toEqual({ kind: "empty", reason: "no-marks" });
  });

  it("keeps only selected seats and the desk", () => {
    const plan = createPrintPlan(classroomSource(), "wall", [
      "seat-01",
      "seat-12",
      "desk",
    ]);
    expectReady(plan);
    expect(plan.seats.map((seat) => seat.id)).toEqual(["seat-01", "seat-12"]);
    expect(plan.landmarks.map((landmark) => landmark.id)).toEqual(["desk"]);
    expect(plan.seats.some((seat) => seat.id === "seat-02")).toBe(false);
    expect(plan.seats).toHaveLength(2);
  });

  it("returns empty when selected ids match nothing", () => {
    expect(
      createPrintPlan(classroomSource(), "wall", ["missing-a", "missing-b"]),
    ).toEqual({ kind: "empty", reason: "no-marks" });
  });

  it("enlarges one selected seat past the full-classroom frame", () => {
    const source = classroomSource();
    const all = createPrintPlan(source, "wall");
    const one = createPrintPlan(source, "wall", ["seat-01"]);
    expectReady(all);
    expectReady(one);
    expect(one.seats.map((seat) => seat.id)).toEqual(["seat-01"]);
    expect(one.landmarks).toHaveLength(0);
    const allSeat = all.seats.find((seat) => seat.id === "seat-01");
    const oneSeat = one.seats[0];
    expect(allSeat).toBeDefined();
    expect(oneSeat).toBeDefined();
    if (!allSeat || !oneSeat) return;
    expect(oneSeat.frame.widthMm).toBeGreaterThan(allSeat.frame.widthMm);
    expect(oneSeat.frame.heightMm).toBeGreaterThan(allSeat.frame.heightMm);
    expectFramesInside(one);
  });

  it("exposes view-mode labels for occupied and empty seats", () => {
    const plan = createPrintPlan(
      {
        students: [
          {
            id: "st-1",
            name: "あ太郎",
            furigana: "アタロウ",
            attendanceNumber: 1,
          },
        ],
        seats: [
          { id: "occupied", studentId: "st-1", x: 0, y: 0 },
          { id: "vacant", studentId: null, x: 8, y: 0 },
        ],
        objects: [],
      },
      "wall",
    );
    expectReady(plan);
    expect(plan.seats).toHaveLength(2);
    expect(plan.seats[0]).toMatchObject({
      id: "occupied",
      label: {
        kind: "occupied",
        rotation: 0,
        attendanceNumber: 1,
        furigana: "アタロウ",
        name: "あ太郎",
      },
    });
    expect(plan.seats[1]).toMatchObject({
      id: "vacant",
      label: {
        kind: "empty",
        rotation: 0,
      },
    });
  });
});
