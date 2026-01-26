import { ShuffleAlgorithm, ShuffleResult } from "../types/shuffle";
import {
  Seat,
  Student,
  Group,
  Role,
  Condition,
  StudentGroupCondition,
  RoleGroupCondition,
  StudentDistanceCondition,
} from "../types";
import GLPK, { type LP, type Result } from "glpk.js";
import { calculateDistance } from "../utils/conditionUtils";

export class ConditionalShuffleAlgorithm implements ShuffleAlgorithm {
  name = "conditional";
  description = "GLPKを使用した条件を考慮した高度なシャッフルアルゴリズム";

  async shuffle(
    students: Student[],
    seats: Seat[],
    conditions: Condition[],
    groups: Group[],
    roles: Role[],
  ): Promise<ShuffleResult> {
    try {
      const glpk = await GLPK();
      const enabledConditions = conditions.filter((c) => c.enabled);
      const availableSeats = seats.filter((seat) => !seat.isEmpty);

      if (students.length > availableSeats.length) {
        return {
          success: false,
          assignment: {},
          error: "生徒数が利用可能な席数を超えています。",
        };
      }

      if (enabledConditions.length === 0) {
        const shuffledStudents = [...students].sort(() => Math.random() - 0.5);
        const assignment: { [seatId: string]: string | undefined } = {};

        seats.forEach((seat) => {
          if (seat.isEmpty) {
            assignment[seat.id] = undefined;
          } else {
            const seatIndex = availableSeats.indexOf(seat);
            assignment[seat.id] = shuffledStudents[seatIndex]?.id;
          }
        });

        return {
          success: true,
          assignment,
          analysis: {
            totalConditions: 0,
            failedConditions: [],
          },
        };
      }

      const vars: { name: string; coef: number }[] = [];
      const binaries: string[] = [];

      for (const student of students) {
        for (const seat of availableSeats) {
          const name = `x_${student.id}_${seat.id}`;
          vars.push({ name, coef: 0 });
          binaries.push(name);
        }
      }

      const subjectTo: LP["subjectTo"] = [];

      for (const student of students) {
        subjectTo.push({
          name: `assign_${student.id}`,
          vars: availableSeats.map((seat) => ({
            name: `x_${student.id}_${seat.id}`,
            coef: 1,
          })),
          bnds: { type: glpk.GLP_FX, lb: 1, ub: 1 },
        });
      }

      for (const seat of availableSeats) {
        subjectTo.push({
          name: `seat_${seat.id}`,
          vars: students.map((student) => ({
            name: `x_${student.id}_${seat.id}`,
            coef: 1,
          })),
          bnds: { type: glpk.GLP_UP, lb: 0, ub: 1 },
        });
      }

      for (const condition of enabledConditions) {
        switch (condition.type) {
          case "student-group": {
            const c = condition as StudentGroupCondition;
            for (const studentId of c.studentIds) {
              const student = students.find((s) => s.id === studentId);
              if (!student) continue;

              for (const seat of availableSeats) {
                const hasTargetGroup = seat.groupIds.some((gid) =>
                  c.groupIds.includes(gid),
                );
                if (c.shouldPlace && !hasTargetGroup) {
                  subjectTo.push({
                    name: `student_group_${studentId}_${seat.id}`,
                    vars: [{ name: `x_${studentId}_${seat.id}`, coef: 1 }],
                    bnds: { type: glpk.GLP_FX, lb: 0, ub: 0 },
                  });
                } else if (!c.shouldPlace && hasTargetGroup) {
                  subjectTo.push({
                    name: `student_group_${studentId}_${seat.id}`,
                    vars: [{ name: `x_${studentId}_${seat.id}`, coef: 1 }],
                    bnds: { type: glpk.GLP_FX, lb: 0, ub: 0 },
                  });
                }
              }
            }
            break;
          }

          case "role-group": {
            const c = condition as RoleGroupCondition;
            for (const groupId of c.groupIds) {
              const groupSeats = availableSeats.filter((s) =>
                s.groupIds.includes(groupId),
              );
              if (groupSeats.length === 0) continue;

              const targetStudents = students.filter((s) => {
                if (c.roleId) return s.roleIds.includes(c.roleId);
                if (c.gender) return s.gender === c.gender;
                return false;
              });

              if (targetStudents.length === 0) continue;

              subjectTo.push({
                name: `role_group_${groupId}_min`,
                vars: targetStudents.flatMap((student) =>
                  groupSeats.map((seat) => ({
                    name: `x_${student.id}_${seat.id}`,
                    coef: 1,
                  })),
                ),
                bnds: { type: glpk.GLP_LO, lb: c.count, ub: Number.MAX_VALUE },
              });

              subjectTo.push({
                name: `role_group_${groupId}_max`,
                vars: targetStudents.flatMap((student) =>
                  groupSeats.map((seat) => ({
                    name: `x_${student.id}_${seat.id}`,
                    coef: 1,
                  })),
                ),
                bnds: { type: glpk.GLP_UP, lb: 0, ub: c.count },
              });
            }
            break;
          }

          case "student-distance": {
            const c = condition as StudentDistanceCondition;
            const student1 = students.find((s) => s.id === c.studentId1);
            const student2 = students.find((s) => s.id === c.studentId2);
            if (!student1 || !student2) break;

            if (c.shouldBeClose) {
              const closeSeatPairs: Array<[Seat, Seat]> = [];
              for (const seat1 of availableSeats) {
                for (const seat2 of availableSeats) {
                  if (seat1.id >= seat2.id) continue;
                  const distance = calculateDistance(seat1, seat2);
                  if (distance <= 2) {
                    closeSeatPairs.push([seat1, seat2]);
                  }
                }
              }

              if (closeSeatPairs.length === 0) {
                return {
                  success: false,
                  assignment: {},
                  error: "近くに配置する条件を満たす席のペアが存在しません。",
                };
              }

              for (const seat1 of availableSeats) {
                for (const seat2 of availableSeats) {
                  if (seat1.id === seat2.id) continue;
                  const distance = calculateDistance(seat1, seat2);
                  if (distance > 2) {
                    subjectTo.push({
                      name: `distance_close_${c.studentId1}_${seat1.id}_${c.studentId2}_${seat2.id}`,
                      vars: [
                        { name: `x_${c.studentId1}_${seat1.id}`, coef: 1 },
                        { name: `x_${c.studentId2}_${seat2.id}`, coef: 1 },
                      ],
                      bnds: { type: glpk.GLP_UP, lb: 0, ub: 1 },
                    });
                  }
                }
              }
            } else {
              for (const seat1 of availableSeats) {
                for (const seat2 of availableSeats) {
                  if (seat1.id >= seat2.id) continue;
                  const distance = calculateDistance(seat1, seat2);
                  if (distance < 3) {
                    subjectTo.push({
                      name: `distance_far_${seat1.id}_${seat2.id}`,
                      vars: [
                        { name: `x_${c.studentId1}_${seat1.id}`, coef: 1 },
                        { name: `x_${c.studentId2}_${seat2.id}`, coef: 1 },
                      ],
                      bnds: { type: glpk.GLP_UP, lb: 0, ub: 1 },
                    });
                    subjectTo.push({
                      name: `distance_far_${seat2.id}_${seat1.id}`,
                      vars: [
                        { name: `x_${c.studentId1}_${seat2.id}`, coef: 1 },
                        { name: `x_${c.studentId2}_${seat1.id}`, coef: 1 },
                      ],
                      bnds: { type: glpk.GLP_UP, lb: 0, ub: 1 },
                    });
                  }
                }
              }
            }
            break;
          }
        }
      }

      const lp: LP = {
        name: "seat_assignment",
        objective: {
          direction: glpk.GLP_MIN,
          name: "obj",
          vars,
        },
        subjectTo,
        binaries,
      };

      const res: Result = await glpk.solve(lp, glpk.GLP_MSG_OFF);

      if (
        res.result.status !== glpk.GLP_OPT &&
        res.result.status !== glpk.GLP_FEAS
      ) {
        return {
          success: false,
          assignment: {},
          error:
            "最適解が見つかりませんでした。条件が複雑すぎるか、解が存在しない可能性があります。",
        };
      }

      const assignment: { [seatId: string]: string | undefined } = {};

      for (const seat of seats) {
        if (seat.isEmpty) {
          assignment[seat.id] = undefined;
        } else {
          let assigned = false;
          for (const student of students) {
            const v = res.result.vars[`x_${student.id}_${seat.id}`];
            if (v === 1) {
              assignment[seat.id] = student.id;
              assigned = true;
              break;
            }
          }
          if (!assigned) {
            assignment[seat.id] = undefined;
          }
        }
      }

      const failedConditions = this.analyzeConditions(
        assignment,
        enabledConditions,
        students,
        seats,
        groups,
        roles,
      );

      return {
        success: true,
        assignment,
        analysis: {
          totalConditions: enabledConditions.length,
          failedConditions,
        },
      };
    } catch (error) {
      return {
        success: false,
        assignment: {},
        error:
          error instanceof Error ? error.message : "不明なエラーが発生しました",
      };
    }
  }

  private analyzeConditions(
    assignment: { [seatId: string]: string | undefined },
    conditions: Condition[],
    students: Student[],
    seats: Seat[],
    groups: Group[],
    roles: Role[],
  ): Array<{ condition: Condition; satisfied: boolean; reason?: string }> {
    const failedConditions: Array<{
      condition: Condition;
      satisfied: boolean;
      reason?: string;
    }> = [];

    for (const condition of conditions) {
      let satisfied = true;
      let reason = "";

      switch (condition.type) {
        case "student-group": {
          const c = condition as StudentGroupCondition;
          for (const studentId of c.studentIds) {
            const assignedSeatId = Object.keys(assignment).find(
              (seatId) => assignment[seatId] === studentId,
            );
            if (!assignedSeatId) continue;

            const seat = seats.find((s) => s.id === assignedSeatId);
            if (!seat) continue;

            const hasTargetGroup = seat.groupIds.some((gid) =>
              c.groupIds.includes(gid),
            );
            if (c.shouldPlace && !hasTargetGroup) {
              satisfied = false;
              reason = `${students.find((s) => s.id === studentId)?.name}が対象グループに配置されていません`;
              break;
            } else if (!c.shouldPlace && hasTargetGroup) {
              satisfied = false;
              reason = `${students.find((s) => s.id === studentId)?.name}が対象グループに配置されています`;
              break;
            }
          }
          break;
        }

        case "role-group": {
          const c = condition as RoleGroupCondition;
          for (const groupId of c.groupIds) {
            const groupSeats = seats.filter(
              (s) => s.groupIds.includes(groupId) && !s.isEmpty,
            );
            const roleStudentsInGroup = groupSeats.filter((seat) => {
              const studentId = assignment[seat.id];
              if (!studentId) return false;
              const student = students.find((s) => s.id === studentId);
              if (!student) return false;
              if (c.roleId) return student.roleIds.includes(c.roleId);
              if (c.gender) return student.gender === c.gender;
              return false;
            }).length;

            if (roleStudentsInGroup !== c.count) {
              satisfied = false;
              reason = `${roles.find((r) => r.id === c.roleId)?.name || "ロール"}が${groups.find((g) => g.id === groupId)?.name || "グループ"}に${c.count}人配置されていません（実際: ${roleStudentsInGroup}人）`;
              break;
            }
          }
          break;
        }

        case "student-distance": {
          const c = condition as StudentDistanceCondition;
          const student1SeatId = Object.keys(assignment).find(
            (seatId) => assignment[seatId] === c.studentId1,
          );
          const student2SeatId = Object.keys(assignment).find(
            (seatId) => assignment[seatId] === c.studentId2,
          );

          if (student1SeatId && student2SeatId) {
            const seat1 = seats.find((s) => s.id === student1SeatId);
            const seat2 = seats.find((s) => s.id === student2SeatId);

            if (seat1 && seat2) {
              const distance = calculateDistance(seat1, seat2);
              const student1Name = students.find(
                (s) => s.id === c.studentId1,
              )?.name;
              const student2Name = students.find(
                (s) => s.id === c.studentId2,
              )?.name;

              if (c.shouldBeClose && distance > 2) {
                satisfied = false;
                reason = `${student1Name}と${student2Name}が近くに配置されていません（距離: ${distance.toFixed(1)}）`;
              } else if (!c.shouldBeClose && distance < 3) {
                satisfied = false;
                reason = `${student1Name}と${student2Name}が遠くに配置されていません（距離: ${distance.toFixed(1)}）`;
              }
            }
          }
          break;
        }
      }

      if (!satisfied) {
        failedConditions.push({
          condition,
          satisfied: false,
          reason,
        });
      }
    }

    return failedConditions;
  }

  canHandle(students: Student[], seats: Seat[]): boolean {
    return students.length > 0 && seats.length > 0;
  }
}
