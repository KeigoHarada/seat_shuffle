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
import { calculateDistance } from "../utils/conditionUtils";
import type { LP, Result } from "glpk.js";

async function loadGLPK() {
  const isNode = typeof window === "undefined";
  try {
    if (isNode) {
      const glpkModule = await import("glpk.js/node");
      return glpkModule.default;
    } else {
      const glpkModule = await import("glpk.js");
      return glpkModule.default;
    }
  } catch (error) {
    if (isNode) {
      throw new Error(
        `glpk.js/nodeの読み込みに失敗しました: ${error instanceof Error ? error.message : String(error)}`,
      );
    } else {
      throw new Error(
        `glpk.jsの読み込みに失敗しました: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

export class ConditionalShuffleAlgorithm implements ShuffleAlgorithm {
  name = "conditional";
  description = "GLPKを使用した条件を考慮した高度なシャッフルアルゴリズム";

  async shuffle(
    students: Student[],
    seats: Seat[],
    conditions: Condition[],
  ): Promise<ShuffleResult> {
    try {
      let GLPK;
      try {
        GLPK = await loadGLPK();
      } catch (loadError) {
        throw new Error(
          `GLPKの読み込みに失敗しました: ${loadError instanceof Error ? loadError.message : String(loadError)}`,
        );
      }

      let glpk;
      try {
        glpk = await GLPK();
      } catch (initError) {
        throw new Error(
          `GLPKの初期化に失敗しました: ${initError instanceof Error ? initError.message : String(initError)}`,
        );
      }
      const enabledConditions = conditions.filter((c) => c.enabled);
      const availableSeats = seats.filter((seat) => !seat.isEmpty);

      if (students.length > availableSeats.length) {
        throw new Error("生徒数が利用可能な席数を超えています。");
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

        return assignment;
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
                throw new Error(
                  "近くに配置する条件を満たす席のペアが存在しません。",
                );
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
        throw new Error(
          "最適解が見つかりませんでした。条件が複雑すぎるか、解が存在しない可能性があります。",
        );
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

      return assignment;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "不明なエラーが発生しました",
      );
    }
  }


  canHandle(students: Student[], seats: Seat[]): boolean {
    return students.length > 0 && seats.length > 0;
  }
}
