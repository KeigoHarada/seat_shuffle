import { describe, it, expect } from "vitest";
import { ConditionalShuffleAlgorithm } from "./ConditionalShuffleAlgorithm";
import { SAMPLE_STUDENTS } from "../stores/sampleData";
import { analyzeAssignment } from "../utils/condition/conditionCheck";
import type { Seat, Student, Condition, Group, Role } from "../types";

function buildTestSeats(students: Student[]): Seat[] {
  const seats: Seat[] = [];
  const rows = 5;
  const cols = 8;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      seats.push({
        id: `seat-${row}-${col}`,
        row,
        col,
        isEmpty: false,
        groupIds: [],
      });
    }
  }
  for (let i = 0; i < students.length && i < seats.length; i++) {
    seats[i]!.studentId = students[i]!.id;
  }
  return seats;
}

function buildInitialAssignment(
  seats: Seat[],
): Record<string, string | undefined> {
  const a: Record<string, string | undefined> = {};
  for (const s of seats) {
    if (s.isEmpty) a[s.id] = undefined;
    else a[s.id] = s.studentId;
  }
  return a;
}

function formatDisplay(
  seats: Seat[],
  assignment: Record<string, string | undefined>,
  students: Student[],
): string {
  const idToName = (id: string) =>
    students.find((s) => s.id === id)?.name ?? "?";
  const lines: string[] = [];
  for (const seat of seats) {
    const v = assignment[seat.id];
    let label: string;
    if (seat.isEmpty) label = "（空席）";
    else if (v === undefined) label = "（名無し）";
    else label = idToName(v);
    lines.push(`  ${seat.id} → ${label}`);
  }
  return lines.join("\n");
}

function formatDisplayWithGroupsAndRoles(
  seats: Seat[],
  assignment: Record<string, string | undefined>,
  students: Student[],
  groups: Group[],
  roles: Role[],
): string {
  const idToName = (id: string) =>
    students.find((s) => s.id === id)?.name ?? "?";
  const idToGroupName = (id: string) =>
    groups.find((g) => g.id === id)?.name ?? id;
  const idToRoleName = (id: string) =>
    roles.find((r) => r.id === id)?.name ?? id;
  const studentToRoles = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    return student?.roleIds.map((rId) => idToRoleName(rId)).join(", ") ?? "";
  };

  const lines: string[] = [];
  for (const seat of seats) {
    const v = assignment[seat.id];
    let label: string;
    if (seat.isEmpty) {
      label = "（空席）";
    } else if (v === undefined) {
      label = "（名無し）";
    } else {
      label = idToName(v);
      const studentRoles = studentToRoles(v);
      if (studentRoles) {
        label += ` [${studentRoles}]`;
      }
    }

    const groupLabels =
      seat.groupIds.length > 0
        ? seat.groupIds.map((gId) => idToGroupName(gId)).join(", ")
        : "";
    const groupInfo = groupLabels ? ` [グループ: ${groupLabels}]` : "";

    lines.push(`  ${seat.id} → ${label}${groupInfo}`);
  }
  return lines.join("\n");
}

function formatConditions(conditions: Condition[]): string {
  if (conditions.length === 0) {
    return "  なし";
  }
  return conditions.map((c) => `  - ${c.name} (${c.type})`).join("\n");
}

describe("ConditionalShuffleAlgorithm", () => {
  it("条件なしでシャッフルが成功する", async () => {
    const students = SAMPLE_STUDENTS.slice(0, 40);
    const seats = buildTestSeats(students);
    const conditions: Condition[] = [];
    const groups: Group[] = [];
    const roles: Role[] = [];

    const beforeAssignment = buildInitialAssignment(seats);

    const alg = new ConditionalShuffleAlgorithm();
    const assignment = await alg.shuffle(students, seats, conditions);
    const assignedCount = Object.values(assignment).filter(
      (v) => v !== undefined,
    ).length;

    expect(assignedCount).toBe(students.length);
    expect(Object.keys(assignment)).toHaveLength(seats.length);

    for (const seat of seats) {
      expect(assignment).toHaveProperty(seat.id);
      if (seat.isEmpty) {
        expect(assignment[seat.id]).toBeUndefined();
      }
    }

    const analysis = analyzeAssignment(
      assignment as { [seatId: string]: string },
      conditions,
      students,
      seats,
      groups,
      roles,
    );

    expect(analysis.failedConditions).toHaveLength(0);

    const beforeDisplay = formatDisplay(seats, beforeAssignment, students);
    const afterDisplay = formatDisplay(seats, assignment, students);

    console.log("\n【条件なし - シャッフル前】\n" + beforeDisplay);
    console.log("\n【条件なし - シャッフル後】\n" + afterDisplay);
    console.log(
      "\n【条件なし】満たされていない条件: " + analysis.failedConditions.length,
    );
  });

  it("生徒-グループ条件を満たすシャッフル", async () => {
    const students = SAMPLE_STUDENTS.slice(0, 40);
    const seats = buildTestSeats(students);

    const groupA: Group = {
      id: "group-a",
      name: "グループA",
      color: "#ff0000",
    };

    seats[0]!.groupIds = [groupA.id];
    seats[1]!.groupIds = [groupA.id];
    seats[2]!.groupIds = [groupA.id];
    seats[3]!.groupIds = [groupA.id];
    seats[4]!.groupIds = [groupA.id];
    seats[5]!.groupIds = [groupA.id];
    seats[6]!.groupIds = [groupA.id];
    seats[7]!.groupIds = [groupA.id];

    const condition: Extract<Condition, { type: "student-group" }> = {
      id: "condition-1",
      name: "田中太郎をグループAに配置",
      type: "student-group",
      enabled: true,
      studentIds: [students[0]!.id],
      groupIds: [groupA.id],
      shouldPlace: true,
    };

    const beforeAssignment = buildInitialAssignment(seats);

    const alg = new ConditionalShuffleAlgorithm();
    const assignment = await alg.shuffle(students, seats, [condition]);
    const analysis = analyzeAssignment(
      assignment as { [seatId: string]: string },
      [condition],
      students,
      seats,
      [groupA],
      [],
    );

    expect(analysis.failedConditions).toHaveLength(0);

    console.log("\n【設定条件】");
    console.log(formatConditions([condition]));
    console.log("\n【グループ情報】");
    console.log(`  ${groupA.name} (${groupA.id})`);
    console.log("\n【生徒-グループ条件 - シャッフル前】");
    console.log(
      formatDisplayWithGroupsAndRoles(
        seats,
        beforeAssignment,
        students,
        [groupA],
        [],
      ),
    );
    console.log("\n【生徒-グループ条件 - シャッフル後】");
    console.log(
      formatDisplayWithGroupsAndRoles(
        seats,
        assignment,
        students,
        [groupA],
        [],
      ),
    );
    console.log(
      "\n【生徒-グループ条件】満たされていない条件: " +
        analysis.failedConditions.length,
    );
  });

  it("ロール-グループ条件を満たすシャッフル", async () => {
    const students = SAMPLE_STUDENTS.slice(0, 40);
    const seats = buildTestSeats(students);

    const groupA: Group = {
      id: "group-a",
      name: "グループA",
      color: "#ff0000",
    };

    const roleClassLeader: Role = {
      id: "role-class-leader",
      name: "学級委員長",
      icon: "user",
    };

    seats[0]!.groupIds = [groupA.id];
    seats[1]!.groupIds = [groupA.id];
    seats[2]!.groupIds = [groupA.id];
    seats[3]!.groupIds = [groupA.id];
    seats[4]!.groupIds = [groupA.id];
    seats[5]!.groupIds = [groupA.id];
    seats[6]!.groupIds = [groupA.id];
    seats[7]!.groupIds = [groupA.id];

    const condition: Extract<Condition, { type: "role-group" }> = {
      id: "condition-2",
      name: "グループAに学級委員長を1人配置",
      type: "role-group",
      enabled: true,
      roleId: roleClassLeader.id,
      groupIds: [groupA.id],
      count: 1,
    };

    const beforeAssignment = buildInitialAssignment(seats);

    const alg = new ConditionalShuffleAlgorithm();
    const assignment = await alg.shuffle(students, seats, [condition]);
    const analysis = analyzeAssignment(
      assignment as { [seatId: string]: string },
      [condition],
      students,
      seats,
      [groupA],
      [roleClassLeader],
    );

    expect(analysis.failedConditions).toHaveLength(0);

    console.log("\n【設定条件】");
    console.log(formatConditions([condition]));
    console.log("\n【グループ情報】");
    console.log(`  ${groupA.name} (${groupA.id})`);
    console.log("\n【ロール情報】");
    console.log(`  ${roleClassLeader.name} (${roleClassLeader.id})`);
    const studentsWithRole = students.filter((s) =>
      s.roleIds.includes(roleClassLeader.id),
    );
    console.log(
      `  該当生徒: ${studentsWithRole.map((s) => s.name).join(", ")}`,
    );
    console.log("\n【ロール-グループ条件 - シャッフル前】");
    console.log(
      formatDisplayWithGroupsAndRoles(
        seats,
        beforeAssignment,
        students,
        [groupA],
        [roleClassLeader],
      ),
    );
    console.log("\n【ロール-グループ条件 - シャッフル後】");
    console.log(
      formatDisplayWithGroupsAndRoles(
        seats,
        assignment,
        students,
        [groupA],
        [roleClassLeader],
      ),
    );
    console.log(
      "\n【ロール-グループ条件】満たされていない条件: " +
        analysis.failedConditions.length,
    );
  });

  it("生徒間距離条件を満たすシャッフル", async () => {
    const students = SAMPLE_STUDENTS.slice(0, 40);
    const seats = buildTestSeats(students);

    const condition: Extract<Condition, { type: "student-distance" }> = {
      id: "condition-3",
      name: "田中太郎と佐藤花子を近くに配置",
      type: "student-distance",
      enabled: true,
      studentId1: students[0]!.id,
      studentId2: students[1]!.id,
      shouldBeClose: true,
    };

    const beforeAssignment = buildInitialAssignment(seats);

    const alg = new ConditionalShuffleAlgorithm();
    const assignment = await alg.shuffle(students, seats, [condition]);
    const analysis = analyzeAssignment(
      assignment as { [seatId: string]: string },
      [condition],
      students,
      seats,
      [],
      [],
    );

    expect(analysis.failedConditions).toHaveLength(0);

    const student1 = students.find((s) => s.id === condition.studentId1);
    const student2 = students.find((s) => s.id === condition.studentId2);
    const seat1Before = seats.find((s) => s.studentId === condition.studentId1);
    const seat2Before = seats.find((s) => s.studentId === condition.studentId2);
    const seat1After = Object.entries(assignment).find(
      ([_, sid]) => sid === condition.studentId1,
    )?.[0];
    const seat2After = Object.entries(assignment).find(
      ([_, sid]) => sid === condition.studentId2,
    )?.[0];
    const seat1AfterObj = seats.find((s) => s.id === seat1After);
    const seat2AfterObj = seats.find((s) => s.id === seat2After);

    const calculateDistance = (s1: Seat | undefined, s2: Seat | undefined) => {
      if (!s1 || !s2) return "?";
      return Math.abs(s1.row - s2.row) + Math.abs(s1.col - s2.col);
    };

    console.log("\n【設定条件】");
    console.log(formatConditions([condition]));
    console.log(
      `  対象生徒: ${student1?.name} と ${student2?.name} を近くに配置`,
    );
    console.log("\n【生徒間距離条件 - シャッフル前】");
    console.log(formatDisplay(seats, beforeAssignment, students));
    console.log(`  距離: ${calculateDistance(seat1Before, seat2Before)}`);
    console.log("\n【生徒間距離条件 - シャッフル後】");
    console.log(formatDisplay(seats, assignment, students));
    console.log(`  距離: ${calculateDistance(seat1AfterObj, seat2AfterObj)}`);
    console.log(
      "\n【生徒間距離条件】満たされていない条件: " +
        analysis.failedConditions.length,
    );
  });

  it("全条件を組み合わせたシャッフル", async () => {
    const students = SAMPLE_STUDENTS.slice(0, 40);
    const seats = buildTestSeats(students);

    const groupA: Group = {
      id: "group-a",
      name: "グループA",
      color: "#ff0000",
    };

    const roleClassLeader: Role = {
      id: "role-class-leader",
      name: "学級委員長",
      icon: "user",
    };

    seats[0]!.groupIds = [groupA.id];
    seats[1]!.groupIds = [groupA.id];
    seats[2]!.groupIds = [groupA.id];
    seats[3]!.groupIds = [groupA.id];
    seats[4]!.groupIds = [groupA.id];
    seats[5]!.groupIds = [groupA.id];
    seats[6]!.groupIds = [groupA.id];
    seats[7]!.groupIds = [groupA.id];

    const condition1: Extract<Condition, { type: "student-group" }> = {
      id: "condition-1",
      name: "田中太郎をグループAに配置",
      type: "student-group",
      enabled: true,
      studentIds: [students[0]!.id],
      groupIds: [groupA.id],
      shouldPlace: true,
    };

    const condition2: Extract<Condition, { type: "role-group" }> = {
      id: "condition-2",
      name: "グループAに学級委員長を1人配置",
      type: "role-group",
      enabled: true,
      roleId: roleClassLeader.id,
      groupIds: [groupA.id],
      count: 1,
    };

    const condition3: Extract<Condition, { type: "student-distance" }> = {
      id: "condition-3",
      name: "鈴木次郎と高橋美咲を近くに配置",
      type: "student-distance",
      enabled: true,
      studentId1: students[2]!.id,
      studentId2: students[3]!.id,
      shouldBeClose: true,
    };

    const beforeAssignment = buildInitialAssignment(seats);

    const alg = new ConditionalShuffleAlgorithm();
    const assignment = await alg.shuffle(students, seats, [
      condition1,
      condition2,
      condition3,
    ]);
    const assignmentForAnalysis: { [seatId: string]: string } = {};
    for (const [seatId, studentId] of Object.entries(assignment)) {
      if (studentId !== undefined) {
        assignmentForAnalysis[seatId] = studentId;
      }
    }
    const analysis = analyzeAssignment(
      assignmentForAnalysis,
      [condition1, condition2, condition3],
      students,
      seats,
      [groupA],
      [roleClassLeader],
    );

    expect(analysis.failedConditions).toHaveLength(0);

    console.log("\n【設定条件】");
    console.log(formatConditions([condition1, condition2, condition3]));
    console.log("\n【グループ情報】");
    console.log(`  ${groupA.name} (${groupA.id})`);
    console.log("\n【ロール情報】");
    console.log(`  ${roleClassLeader.name} (${roleClassLeader.id})`);
    const studentsWithRole = students.filter((s) =>
      s.roleIds.includes(roleClassLeader.id),
    );
    console.log(
      `  該当生徒: ${studentsWithRole.map((s) => s.name).join(", ")}`,
    );
    console.log("\n【全条件 - シャッフル前】");
    console.log(
      formatDisplayWithGroupsAndRoles(
        seats,
        beforeAssignment,
        students,
        [groupA],
        [roleClassLeader],
      ),
    );
    console.log("\n【全条件 - シャッフル後】");
    console.log(
      formatDisplayWithGroupsAndRoles(
        seats,
        assignment,
        students,
        [groupA],
        [roleClassLeader],
      ),
    );
    console.log(
      "\n【全条件】満たされていない条件: " + analysis.failedConditions.length,
    );
  });

  it("同じ配置状態から2回シャッフルして異なる結果になることを確認（条件5個）", async () => {
    const students = SAMPLE_STUDENTS.slice(0, 30);
    const seats = buildTestSeats(students);

    const groupA: Group = {
      id: "group-a",
      name: "グループA",
      color: "#ff0000",
    };
    const groupB: Group = {
      id: "group-b",
      name: "グループB",
      color: "#0000ff",
    };
    const groupC: Group = {
      id: "group-c",
      name: "グループC",
      color: "#00ff00",
    };

    seats[0]!.groupIds = [groupA.id];
    seats[1]!.groupIds = [groupA.id];
    seats[2]!.groupIds = [groupA.id];
    seats[3]!.groupIds = [groupA.id];
    seats[4]!.groupIds = [groupB.id];
    seats[5]!.groupIds = [groupB.id];
    seats[6]!.groupIds = [groupB.id];
    seats[7]!.groupIds = [groupB.id];
    seats[8]!.groupIds = [groupC.id];
    seats[9]!.groupIds = [groupC.id];
    seats[10]!.groupIds = [groupC.id];
    seats[11]!.groupIds = [groupC.id];

    const roleClassLeader: Role = {
      id: "role-class-leader",
      name: "学級委員長",
      icon: "user",
    };

    students[0]!.roleIds = [roleClassLeader.id];
    students[1]!.roleIds = [roleClassLeader.id];
    students[2]!.roleIds = [roleClassLeader.id];

    const conditions: Condition[] = [
      {
        id: "condition-1",
        name: "田中太郎をグループAに配置",
        type: "student-group",
        enabled: true,
        studentIds: [students[0]!.id],
        groupIds: [groupA.id],
        shouldPlace: true,
      },
      {
        id: "condition-2",
        name: "佐藤花子をグループBに配置",
        type: "student-group",
        enabled: true,
        studentIds: [students[1]!.id],
        groupIds: [groupB.id],
        shouldPlace: true,
      },
      {
        id: "condition-3",
        name: "グループAに学級委員長を1人配置",
        type: "role-group",
        enabled: true,
        roleId: roleClassLeader.id,
        groupIds: [groupA.id],
        count: 1,
      },
      {
        id: "condition-4",
        name: "鈴木次郎と高橋美咲を近くに配置",
        type: "student-distance",
        enabled: true,
        studentId1: students[2]!.id,
        studentId2: students[3]!.id,
        shouldBeClose: true,
      },
      {
        id: "condition-5",
        name: "伊藤健太と山田一郎を遠くに配置",
        type: "student-distance",
        enabled: true,
        studentId1: students[4]!.id,
        studentId2: students[5]!.id,
        shouldBeClose: false,
      },
    ];

    const initialSeats = seats.map((seat) => ({ ...seat }));
    const initialAssignment = buildInitialAssignment(initialSeats);

    const alg = new ConditionalShuffleAlgorithm();

    const assignment1 = await alg.shuffle(students, initialSeats, conditions);
    const assignment2 = await alg.shuffle(students, initialSeats, conditions);

    const assignment1Str = JSON.stringify(
      Object.entries(assignment1)
        .filter(([_, v]) => v !== undefined)
        .sort(([id1], [id2]) => id1.localeCompare(id2)),
    );
    const assignment2Str = JSON.stringify(
      Object.entries(assignment2)
        .filter(([_, v]) => v !== undefined)
        .sort(([id1], [id2]) => id1.localeCompare(id2)),
    );

    expect(assignment1Str).not.toBe(assignment2Str);

    const analysis1 = analyzeAssignment(
      assignment1 as { [seatId: string]: string },
      conditions,
      students,
      seats,
      [groupA, groupB, groupC],
      [roleClassLeader],
    );
    const analysis2 = analyzeAssignment(
      assignment2 as { [seatId: string]: string },
      conditions,
      students,
      seats,
      [groupA, groupB, groupC],
      [roleClassLeader],
    );

    expect(analysis1.failedConditions).toHaveLength(0);
    expect(analysis2.failedConditions).toHaveLength(0);

    console.log("\n【設定条件（5個）】");
    console.log(formatConditions(conditions));
    console.log("\n【初期配置】");
    console.log(formatDisplay(seats, initialAssignment, students));
    console.log("\n【1回目のシャッフル結果】");
    console.log(formatDisplay(seats, assignment1, students));
    console.log("\n【2回目のシャッフル結果】");
    console.log(formatDisplay(seats, assignment2, students));
    console.log(
      `\n【1回目】満たされていない条件: ${analysis1.failedConditions.length}`,
    );
    console.log(
      `\n【2回目】満たされていない条件: ${analysis2.failedConditions.length}`,
    );
    console.log(
      `\n【ランダム性】1回目と2回目は異なる配置: ${assignment1Str !== assignment2Str}`,
    );
  });
});
