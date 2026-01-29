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

  it("100回繰り返しテスト（ランダムな条件と席配置）", async () => {
    const students = SAMPLE_STUDENTS.slice(0, 30);
    const alg = new ConditionalShuffleAlgorithm();

    const groups: Group[] = [
      { id: "group-a", name: "グループA", color: "#ff0000" },
      { id: "group-b", name: "グループB", color: "#0000ff" },
      { id: "group-c", name: "グループC", color: "#00ff00" },
    ];

    const roles: Role[] = [
      { id: "role-class-leader", name: "学級委員長", icon: "user" },
      { id: "role-vice-leader", name: "副委員長", icon: "user" },
    ];

    const testResults = {
      total: 0,
      success: 0,
      timeout: 0,
      error: 0,
      durations: [] as number[],
      errors: [] as string[],
    };

    const iterations = 100;
    const timeoutMs = 30000;

    console.log(`\n【100回繰り返しテスト開始】`);

    for (let i = 0; i < iterations; i++) {
      testResults.total++;

      const rows = Math.floor(Math.random() * 5) + 5;
      const cols = Math.floor(Math.random() * 5) + 6;
      const seats: Seat[] = [];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const isEmpty = Math.random() < 0.1;
          const groupIds: string[] = [];
          if (Math.random() < 0.3) {
            const randomGroup =
              groups[Math.floor(Math.random() * groups.length)];
            if (randomGroup) groupIds.push(randomGroup.id);
          }

          seats.push({
            id: `seat-${row}-${col}`,
            row,
            col,
            isEmpty,
            groupIds,
          });
        }
      }

      const availableSeats = seats.filter((s) => !s.isEmpty);
      const testStudents = students.slice(
        0,
        Math.min(students.length, availableSeats.length),
      );

      const conditions: Condition[] = [];
      const conditionCount = Math.floor(Math.random() * 5) + 1;

      for (let j = 0; j < conditionCount; j++) {
        const conditionType = Math.random();
        if (conditionType < 0.4 && testStudents.length >= 2) {
          const student1 =
            testStudents[Math.floor(Math.random() * testStudents.length)];
          const student2 =
            testStudents[Math.floor(Math.random() * testStudents.length)];
          if (student1 && student2 && student1.id !== student2.id) {
            const group = groups[Math.floor(Math.random() * groups.length)];
            if (group) {
              conditions.push({
                id: `condition-${i}-${j}-student-group`,
                name: `${student1.name}を${group.name}に配置`,
                type: "student-group",
                enabled: true,
                studentIds: [student1.id],
                groupIds: [group.id],
                shouldPlace: Math.random() < 0.7,
              });
            }
          }
        } else if (conditionType < 0.7 && groups.length > 0) {
          const group = groups[Math.floor(Math.random() * groups.length)];
          const role = roles[Math.floor(Math.random() * roles.length)];
          if (group && role) {
            const studentsWithRole = testStudents.filter((s) =>
              s.roleIds.includes(role.id),
            );
            if (studentsWithRole.length > 0) {
              conditions.push({
                id: `condition-${i}-${j}-role-group`,
                name: `${group.name}に${role.name}を配置`,
                type: "role-group",
                enabled: true,
                roleId: role.id,
                groupIds: [group.id],
                count: Math.min(
                  Math.floor(Math.random() * 3) + 1,
                  studentsWithRole.length,
                ),
              });
            }
          }
        } else if (conditionType < 1.0 && testStudents.length >= 2) {
          const student1 =
            testStudents[Math.floor(Math.random() * testStudents.length)];
          const student2 =
            testStudents[Math.floor(Math.random() * testStudents.length)];
          if (student1 && student2 && student1.id !== student2.id) {
            conditions.push({
              id: `condition-${i}-${j}-distance`,
              name: `${student1.name}と${student2.name}を${Math.random() < 0.5 ? "近く" : "遠く"}に配置`,
              type: "student-distance",
              enabled: true,
              studentId1: student1.id,
              studentId2: student2.id,
              shouldBeClose: Math.random() < 0.5,
            });
          }
        }
      }

      const startTime = Date.now();
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error("タイムアウト"));
          }, timeoutMs);
        });

        const assignment = await Promise.race([
          alg.shuffle(testStudents, seats, conditions),
          timeoutPromise,
        ]);

        const duration = Date.now() - startTime;
        testResults.durations.push(duration);
        testResults.success++;

        const analysis = analyzeAssignment(
          assignment as { [seatId: string]: string },
          conditions,
          testStudents,
          seats,
          groups,
          roles,
        );

        if (analysis.failedConditions.length > 0) {
          testResults.error++;
          testResults.errors.push(
            `試行${i + 1}: ${analysis.failedConditions.length}個の条件が満たされませんでした`,
          );
        }
      } catch (error) {
        const duration = Date.now() - startTime;
        testResults.durations.push(duration);

        if (error instanceof Error && error.message === "タイムアウト") {
          testResults.timeout++;
          testResults.errors.push(
            `試行${i + 1}: タイムアウト（${duration}ms）`,
          );
        } else {
          testResults.error++;
          testResults.errors.push(
            `試行${i + 1}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }

      if ((i + 1) % 10 === 0) {
        console.log(
          `進捗: ${i + 1}/${iterations}回完了 (成功: ${testResults.success}, タイムアウト: ${testResults.timeout}, エラー: ${testResults.error})`,
        );
      }
    }

    const avgDuration =
      testResults.durations.length > 0
        ? testResults.durations.reduce((a, b) => a + b, 0) /
          testResults.durations.length
        : 0;
    const maxDuration =
      testResults.durations.length > 0 ? Math.max(...testResults.durations) : 0;
    const minDuration =
      testResults.durations.length > 0 ? Math.min(...testResults.durations) : 0;

    console.log(`\n【100回繰り返しテスト結果】`);
    console.log(`  総試行回数: ${testResults.total}`);
    console.log(
      `  成功: ${testResults.success} (${((testResults.success / testResults.total) * 100).toFixed(1)}%)`,
    );
    console.log(
      `  タイムアウト: ${testResults.timeout} (${((testResults.timeout / testResults.total) * 100).toFixed(1)}%)`,
    );
    console.log(
      `  エラー: ${testResults.error} (${((testResults.error / testResults.total) * 100).toFixed(1)}%)`,
    );
    console.log(`  平均処理時間: ${avgDuration.toFixed(1)}ms`);
    console.log(`  最大処理時間: ${maxDuration}ms`);
    console.log(`  最小処理時間: ${minDuration}ms`);

    if (testResults.errors.length > 0) {
      console.log(`\n【エラー詳細】`);
      testResults.errors.slice(0, 10).forEach((error) => {
        console.log(`  ${error}`);
      });
      if (testResults.errors.length > 10) {
        console.log(`  ... (他${testResults.errors.length - 10}件)`);
      }
    }

    expect(testResults.success).toBeGreaterThan(testResults.total * 0.8);
    expect(testResults.timeout).toBeLessThan(testResults.total * 0.2);
  });
});
