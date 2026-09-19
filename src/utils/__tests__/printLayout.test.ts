import { describe, expect, it } from "vitest";
import { CanvasObject, Seat, Student } from "../../types";
import {
  A4_LONG_MM,
  A4_SHORT_MM,
  PRINT_MARGIN_MM,
  createPrintPlan,
  printOrientationLabel,
  type PrintBox,
  type PrintReadyPlan,
} from "../printLayout";

const studentA: Student = {
  id: "stu-a",
  name: "山田太郎",
  furigana: "やまだたろう",
  gender: "male",
  attendanceNumber: 3,
  roleIds: ["role-lead"],
};

const studentB: Student = {
  id: "stu-b",
  name: "佐藤花子",
  gender: "female",
  attendanceNumber: 7,
  roleIds: [],
};

function seat(
  id: string,
  x: number,
  y: number,
  studentId: string | null,
): Seat {
  return {
    id,
    studentId,
    groupIds: ["group-1"],
    x,
    y,
    isLocked: true,
  };
}

function desk(id = "desk"): CanvasObject {
  return {
    id,
    type: "rectangle",
    x: 8,
    y: -4,
    width: 8,
    height: 4,
    text: "教卓",
  };
}

function expectInsideMargins(
  box: PrintBox,
  pageWidthMm: number,
  pageHeightMm: number,
) {
  const left = (box.leftPct / 100) * pageWidthMm;
  const top = (box.topPct / 100) * pageHeightMm;
  const right = left + (box.widthPct / 100) * pageWidthMm;
  const bottom = top + (box.heightPct / 100) * pageHeightMm;
  expect(left).toBeGreaterThanOrEqual(PRINT_MARGIN_MM - 0.05);
  expect(top).toBeGreaterThanOrEqual(PRINT_MARGIN_MM - 0.05);
  expect(right).toBeLessThanOrEqual(pageWidthMm - PRINT_MARGIN_MM + 0.05);
  expect(bottom).toBeLessThanOrEqual(pageHeightMm - PRINT_MARGIN_MM + 0.05);
}

function expectReady(plan: ReturnType<typeof createPrintPlan>): PrintReadyPlan {
  expect(plan.kind).toBe("ready");
  if (plan.kind !== "ready") {
    throw new Error("expected ready plan");
  }
  return plan;
}

describe("createPrintPlan", () => {
  it("returns empty when the canvas has no seats or objects", () => {
    expect(
      createPrintPlan({ seats: [], objects: [], students: [] }, "wall"),
    ).toEqual({ kind: "empty" });
  });

  it("returns empty when every selected id is missing", () => {
    expect(
      createPrintPlan(
        {
          seats: [seat("seat-a", 0, 0, "stu-a")],
          objects: [desk()],
          students: [studentA],
        },
        "wall",
        ["gone"],
      ),
    ).toEqual({ kind: "empty" });
  });

  it("prints every seat and landmark when selection is omitted or empty", () => {
    const source = {
      seats: [seat("seat-a", 0, 0, "stu-a"), seat("seat-b", 8, 0, null)],
      objects: [desk()],
      students: [studentA],
    };

    const omitted = expectReady(createPrintPlan(source, "wall"));
    const emptySelection = expectReady(createPrintPlan(source, "wall", []));

    expect(omitted.seats.map((entry) => entry.id)).toEqual([
      "seat-a",
      "seat-b",
    ]);
    expect(omitted.landmarks.map((entry) => entry.id)).toEqual(["desk"]);
    expect(emptySelection.seats.map((entry) => entry.id)).toEqual([
      "seat-a",
      "seat-b",
    ]);
    expect(emptySelection.landmarks.map((entry) => entry.id)).toEqual(["desk"]);
  });

  it("keeps only the selected seats and landmarks and their world order", () => {
    const source = {
      seats: [
        seat("seat-a", 0, 0, "stu-a"),
        seat("seat-b", 12, 0, "stu-b"),
        seat("seat-c", 24, 0, null),
      ],
      objects: [desk(), { ...desk("extra"), x: 20, text: "棚" }],
      students: [studentA, studentB],
    };

    const plan = expectReady(
      createPrintPlan(source, "desk", ["seat-a", "seat-b", "desk"]),
    );

    expect(plan.seats.map((entry) => entry.id)).toEqual(["seat-a", "seat-b"]);
    expect(plan.landmarks.map((entry) => entry.id)).toEqual(["desk"]);
    expect(plan.landmarks[0].text).toBe("教卓");
    expect(plan.seats[0].leftPct).toBeLessThan(plan.seats[1].leftPct);
    expect(plan.seats[0].label).toEqual({
      kind: "occupied",
      attendanceNumber: 3,
      furigana: "やまだたろう",
      name: "山田太郎",
      rotation: 180,
    });
    expect(plan.seats[1].label).toEqual({
      kind: "occupied",
      attendanceNumber: 7,
      furigana: "",
      name: "佐藤花子",
      rotation: 180,
    });
  });

  it("paints view-mode labels and leaves roles, groups, and locks out of the plan", () => {
    const plan = expectReady(
      createPrintPlan(
        {
          seats: [
            seat("seat-a", 0, 0, "stu-a"),
            seat("seat-empty", 8, 0, null),
          ],
          objects: [desk()],
          students: [studentA],
        },
        "wall",
      ),
    );

    expect(plan.seats[0].label).toEqual({
      kind: "occupied",
      attendanceNumber: 3,
      furigana: "やまだたろう",
      name: "山田太郎",
      rotation: 0,
    });
    expect(plan.seats[1].label).toEqual({ kind: "empty", rotation: 0 });
    expect(plan.landmarks[0]).toMatchObject({
      id: "desk",
      shape: "rectangle",
      text: "教卓",
    });
    expect(JSON.stringify(plan)).not.toContain("role-lead");
    expect(JSON.stringify(plan)).not.toContain("group-1");
    expect(JSON.stringify(plan)).not.toContain("isLocked");
  });

  it("rotates seat text only in desk mode", () => {
    const source = {
      seats: [seat("seat-a", 0, 0, "stu-a")],
      objects: [desk()],
      students: [studentA],
    };

    const wall = expectReady(createPrintPlan(source, "wall"));
    const deskPlan = expectReady(createPrintPlan(source, "desk"));

    expect(wall.seats[0].label.rotation).toBe(0);
    expect(deskPlan.seats[0].label.rotation).toBe(180);
    expect(wall.landmarks[0].text).toBe("教卓");
    expect(deskPlan.landmarks[0].text).toBe("教卓");
    expect(deskPlan.landmarks[0]).not.toHaveProperty("rotation");
  });

  it("chooses landscape for a wide classroom and portrait for a tall stack", () => {
    const wide = expectReady(
      createPrintPlan(
        {
          seats: [seat("left", 0, 0, null), seat("right", 36, 0, null)],
          objects: [desk()],
          students: [],
        },
        "wall",
      ),
    );
    expect(wide.orientation).toBe("landscape");
    expect(wide.pageWidthMm).toBe(A4_LONG_MM);
    expect(wide.pageHeightMm).toBe(A4_SHORT_MM);
    expect(printOrientationLabel(wide.orientation)).toBe("A4 横（自動）");

    const tall = expectReady(
      createPrintPlan(
        {
          seats: [
            seat("top", 0, 0, null),
            seat("mid", 0, 20, null),
            seat("bot", 0, 40, null),
          ],
          objects: [],
          students: [],
        },
        "wall",
      ),
    );
    expect(tall.orientation).toBe("portrait");
    expect(tall.pageWidthMm).toBe(A4_SHORT_MM);
    expect(tall.pageHeightMm).toBe(A4_LONG_MM);
    expect(printOrientationLabel(tall.orientation)).toBe("A4 縦（自動）");
  });

  it("keeps every printed box inside the 10mm margin", () => {
    const plan = expectReady(
      createPrintPlan(
        {
          seats: [
            seat("seat-a", 0, 0, "stu-a"),
            seat("seat-b", 12, 8, "stu-b"),
          ],
          objects: [desk()],
          students: [studentA, studentB],
        },
        "desk",
        ["seat-a", "desk"],
      ),
    );

    for (const box of [...plan.seats, ...plan.landmarks]) {
      expectInsideMargins(box, plan.pageWidthMm, plan.pageHeightMm);
    }
  });

  it("scales a single selected seat above 100 percent so it can fill the sheet", () => {
    const all = expectReady(
      createPrintPlan(
        {
          seats: [
            seat("seat-a", 0, 0, "stu-a"),
            seat("seat-b", 30, 20, "stu-b"),
          ],
          objects: [desk()],
          students: [studentA, studentB],
        },
        "wall",
      ),
    );
    const one = expectReady(
      createPrintPlan(
        {
          seats: [
            seat("seat-a", 0, 0, "stu-a"),
            seat("seat-b", 30, 20, "stu-b"),
          ],
          objects: [desk()],
          students: [studentA, studentB],
        },
        "wall",
        ["seat-a"],
      ),
    );

    expect(one.seats).toHaveLength(1);
    expect(one.landmarks).toHaveLength(0);
    expect(one.seats[0].widthPct).toBeGreaterThan(all.seats[0].widthPct);
  });
});
