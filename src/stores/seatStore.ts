import { create } from "zustand";
import {
  Seat,
  Student,
  SeatLayout,
  AppState,
  Group,
  Role,
  Condition,
  StudentGroupCondition,
  RoleGroupCondition,
  StudentDistanceCondition,
} from "../types";
import { AssignmentAnalysis } from "../utils/conditionUtils";
import {
  validateAllConditions,
  checkConditionConflicts,
  ConditionValidationResult,
} from "../utils/conditionValidator";
import {
  DEFAULT_LAYOUT_ROWS,
  DEFAULT_LAYOUT_COLS,
  DEFAULT_LAYOUT_NAME,
} from "../constants/layout";
import { UI_CONSTANTS } from "../constants/ui";
import { ShuffleManager } from "../utils/ShuffleManager";
import { ConditionalShuffleAlgorithm } from "../algorithms/ConditionalShuffleAlgorithm";
import { RandomShuffleAlgorithm } from "../algorithms/RandomShuffleAlgorithm";

interface SeatStore extends AppState {
  // シャッフルマネージャー
  shuffleManager: ShuffleManager;

  // アクション
  setCurrentLayout: (layout: SeatLayout) => void;
  addStudent: (student: Student) => void;
  removeStudent: (studentId: string) => void;
  updateStudent: (studentId: string, updates: Partial<Student>) => void;
  assignStudentToSeat: (studentId: string, seatId: string) => void;
  removeStudentFromSeat: (seatId: string) => void;
  createLayout: (rows: number, cols: number, name: string) => void;
  toggleSeatEmpty: (seatId: string) => void;
  shuffleSeats: () => Promise<void>;
  setShuffleAlgorithm: (algorithmName: string) => boolean;
  getAvailableAlgorithms: () => { name: string; description: string }[];
  toggleSettings: () => void;
  setShuffling: (isShuffling: boolean) => void;

  // グループ管理
  addGroup: (group: Group) => void;
  removeGroup: (groupId: string) => void;
  updateGroup: (groupId: string, updates: Partial<Group>) => void;
  toggleGroupOnSeat: (seatId: string, groupId: string) => void;
  removeGroupFromSeat: (seatId: string, groupId: string) => void;
  addGroupToSeat: (seatId: string, groupId: string) => void;

  // ロール管理
  addRole: (role: Role) => void;
  removeRole: (roleId: string) => void;
  updateRole: (roleId: string, updates: Partial<Role>) => void;
  assignRoleToStudent: (studentId: string, roleId: string) => void;
  removeRoleFromStudent: (studentId: string, roleId: string) => void;

  // 条件管理
  addCondition: (
    condition:
      | StudentGroupCondition
      | RoleGroupCondition
      | StudentDistanceCondition,
  ) => void;
  removeCondition: (conditionId: string) => void;
  updateCondition: (conditionId: string, updates: Partial<Condition>) => void;
  toggleCondition: (conditionId: string) => void;

  // 新しい機能
  selectedSeatId: string | null;
  setSelectedSeatId: (seatId: string | null) => void;
  swapSeats: (seatId1: string, seatId2: string) => void;
  assignStudentNameToSeat: (seatId: string, studentName: string) => void;
  initializeDefaultLayout: () => void;
  settingsPanelWidth: number;
  setSettingsPanelWidth: (width: number) => void;

  // シャッフル結果分析
  lastShuffleAnalysis: AssignmentAnalysis | null;
  setLastShuffleAnalysis: (analysis: AssignmentAnalysis | null) => void;

  // 条件検証
  validateConditions: () => ConditionValidationResult;
  checkConditionConflicts: () => ConditionValidationResult;
}

// シャッフルマネージャーの初期化
const createShuffleManager = (): ShuffleManager => {
  return new ShuffleManager({
    defaultAlgorithm: "conditional",
    algorithms: {
      conditional: new ConditionalShuffleAlgorithm(),
      random: new RandomShuffleAlgorithm(),
    },
    maxAttempts: 1000,
    timeout: 10000, // 10秒
  });
};

export const useSeatStore = create<SeatStore>((set, get) => ({
  // 初期状態
  currentLayout: null,
  students: [],
  groups: [
    { id: "group-han-1", name: "班1", color: "#3B82F6" },
    { id: "group-han-2", name: "班2", color: "#10B981" },
    { id: "group-han-3", name: "班3", color: "#F59E0B" },
    { id: "group-han-4", name: "班4", color: "#EF4444" },
    { id: "group-han-5", name: "班5", color: "#8B5CF6" },
    { id: "group-han-6", name: "班6", color: "#EC4899" },
  ],
  roles: [
    // サンプルロール
    {
      id: "role-class-leader",
      name: "学級委員",
      icon: "crown",
      description: "クラスの代表として活動する",
    },
    {
      id: "role-vice-leader",
      name: "副学級委員",
      icon: "shield",
      description: "学級委員をサポートする",
    },
  ],
  conditions: [
    {
      id: "condition-han-1-leaders",
      name: "班1に学級委員を配置",
      type: "role-group" as const,
      enabled: true,
      description: "班1に学級委員を1人配置する",
      roleId: "role-class-leader",
      groupIds: ["group-han-1"],
      count: 1,
    },
    {
      id: "condition-gender-balance",
      name: "班1・班2に男女バランス",
      type: "role-group" as const,
      enabled: true,
      description: "班1・班2に男女をバランスよく配置する",
      gender: "male" as const,
      groupIds: ["group-han-1", "group-han-2"],
      count: 2,
    },
    {
      id: "condition-separate-troublemakers",
      name: "問題児を離す",
      type: "student-distance" as const,
      enabled: false,
      description: "特定の生徒同士を離して配置する",
      studentId1: "student-1",
      studentId2: "student-2",
      shouldBeClose: false,
    },
  ],
  isShuffling: false,
  showSettings: false,
  selectedSeatId: null,
  settingsPanelWidth: 600,
  lastShuffleAnalysis: null,
  shuffleManager: createShuffleManager(),

  // アクション
  setCurrentLayout: (layout) => set({ currentLayout: layout }),

  addStudent: (student) =>
    set((state) => {
      // 生徒番号を自動で割り当て（連番で詰める）
      const studentWithNumber = {
        ...student,
        studentNumber: state.students.length + 1,
        roleIds: student.roleIds || [],
      };

      return {
        students: [...state.students, studentWithNumber],
      };
    }),

  removeStudent: (studentId) =>
    set((state) => {
      // 生徒を削除
      const updatedStudents = state.students.filter((s) => s.id !== studentId);

      // 生徒番号を詰める（1から連番に再割り当て）
      const renumberedStudents = updatedStudents.map((student, index) => ({
        ...student,
        studentNumber: index + 1,
      }));

      return {
        students: renumberedStudents,
        currentLayout: state.currentLayout
          ? {
              ...state.currentLayout,
              seats: state.currentLayout.seats.map((seat) =>
                seat.studentId === studentId
                  ? { ...seat, studentId: undefined }
                  : seat,
              ),
            }
          : null,
      };
    }),

  updateStudent: (studentId, updates) =>
    set((state) => ({
      students: state.students.map((s) =>
        s.id === studentId ? { ...s, ...updates } : s,
      ),
    })),

  assignStudentToSeat: (studentId, seatId) =>
    set((state) => {
      if (!state.currentLayout) return state;

      return {
        currentLayout: {
          ...state.currentLayout,
          seats: state.currentLayout.seats.map((seat) =>
            seat.id === seatId ? { ...seat, studentId } : seat,
          ),
        },
      };
    }),

  removeStudentFromSeat: (seatId) =>
    set((state) => {
      if (!state.currentLayout) return state;

      // 削除される生徒のIDを取得
      const seatToRemove = state.currentLayout.seats.find(
        (seat) => seat.id === seatId,
      );
      const studentIdToRemove = seatToRemove?.studentId;

      // 席から生徒を削除
      const updatedLayout = {
        ...state.currentLayout,
        seats: state.currentLayout.seats.map((seat) =>
          seat.id === seatId ? { ...seat, studentId: undefined } : seat,
        ),
      };

      // 生徒管理からも削除（生徒番号を詰める）
      if (studentIdToRemove) {
        const updatedStudents = state.students.filter(
          (s) => s.id !== studentIdToRemove,
        );
        const renumberedStudents = updatedStudents.map((student, index) => ({
          ...student,
          studentNumber: index + 1,
        }));

        return {
          currentLayout: updatedLayout,
          students: renumberedStudents,
        };
      }

      return {
        currentLayout: updatedLayout,
      };
    }),

  createLayout: (rows, cols, name) => {
    const seats: Seat[] = [];
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

    const layout: SeatLayout = {
      id: `layout-${Date.now()}`,
      name,
      rows,
      cols,
      seats,
      teacherDeskPosition: "top",
    };

    set({ currentLayout: layout });
  },

  toggleSeatEmpty: (seatId) =>
    set((state) => {
      if (!state.currentLayout) return state;

      // 空席に変更される席の生徒IDを取得
      const seatToToggle = state.currentLayout.seats.find(
        (seat) => seat.id === seatId,
      );
      const studentIdToRemove = seatToToggle?.studentId;

      // 席を空席に変更
      const updatedLayout = {
        ...state.currentLayout,
        seats: state.currentLayout.seats.map((seat) =>
          seat.id === seatId
            ? { ...seat, isEmpty: !seat.isEmpty, studentId: undefined }
            : seat,
        ),
      };

      // 空席に変更する場合、生徒管理からも削除（生徒番号を詰める）
      if (studentIdToRemove && !seatToToggle.isEmpty) {
        const updatedStudents = state.students.filter(
          (s) => s.id !== studentIdToRemove,
        );
        const renumberedStudents = updatedStudents.map((student, index) => ({
          ...student,
          studentNumber: index + 1,
        }));

        return {
          currentLayout: updatedLayout,
          students: renumberedStudents,
        };
      }

      return {
        currentLayout: updatedLayout,
      };
    }),

  shuffleSeats: async () => {
    const state = get();
    if (!state.currentLayout) return;

    set({ isShuffling: true });

    try {
      // シャッフルエフェクトのための遅延
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const {
        currentLayout,
        students,
        conditions,
        groups,
        roles,
        shuffleManager,
      } = get();
      if (!currentLayout) return;

      // 有効な条件があるかチェック
      const enabledConditions = conditions.filter((c) => c.enabled);

      // 条件がない場合はランダムアルゴリズムを使用
      if (enabledConditions.length === 0) {
        shuffleManager.setAlgorithm("random");
      } else {
        shuffleManager.setAlgorithm("conditional");
      }

      // シャッフルマネージャーを使用してシャッフル実行
      const result = await shuffleManager.shuffle(
        students,
        currentLayout.seats,
        conditions,
        groups,
        roles,
      );

      if (result.success) {
        // 成功した場合、席の配置を更新
        const newSeats = currentLayout.seats.map((seat) => {
          if (seat.isEmpty) return seat;

          const assignedStudentId = result.assignment[seat.id];

          if (assignedStudentId) {
            return {
              ...seat,
              studentId: assignedStudentId,
            };
          } else {
            // 名無し席の場合、studentIdプロパティを削除
            const { studentId, ...seatWithoutStudentId } = seat;
            return seatWithoutStudentId;
          }
        });

        set({
          currentLayout: {
            ...currentLayout,
            seats: newSeats,
          },
          lastShuffleAnalysis: result.analysis
            ? {
                totalConditions: result.analysis.totalConditions,
                failedConditions: result.analysis.failedConditions,
                assignment: Object.fromEntries(
                  Object.entries(result.assignment).filter(
                    ([_, value]) => value !== undefined,
                  ),
                ) as { [seatId: string]: string },
              }
            : null,
        });
      } else {
        // 失敗した場合、エラーメッセージを表示
        console.error("シャッフルに失敗しました:", result.error);
        set({ lastShuffleAnalysis: null });
      }
    } catch (error) {
      console.error("シャッフル中にエラーが発生しました:", error);
      set({ lastShuffleAnalysis: null });
    } finally {
      set({ isShuffling: false });
    }
  },

  // シャッフルアルゴリズムを変更
  setShuffleAlgorithm: (algorithmName: string) => {
    const { shuffleManager } = get();
    return shuffleManager.setAlgorithm(algorithmName);
  },

  // 利用可能なアルゴリズム一覧を取得
  getAvailableAlgorithms: () => {
    const { shuffleManager } = get();
    return shuffleManager.getAvailableAlgorithms();
  },

  toggleSettings: () =>
    set((state) => ({
      showSettings: !state.showSettings,
    })),

  setShuffling: (isShuffling) => set({ isShuffling }),

  // 新しい機能の実装
  setSelectedSeatId: (seatId) => set({ selectedSeatId: seatId }),

  swapSeats: (seatId1, seatId2) =>
    set((state) => {
      if (!state.currentLayout) return state;

      const seat1 = state.currentLayout.seats.find((s) => s.id === seatId1);
      const seat2 = state.currentLayout.seats.find((s) => s.id === seatId2);

      if (!seat1 || !seat2) return state;

      return {
        currentLayout: {
          ...state.currentLayout,
          seats: state.currentLayout.seats.map((seat) => {
            if (seat.id === seatId1) {
              return {
                ...seat,
                studentId: seat2.studentId,
                isEmpty: seat2.isEmpty,
              };
            }
            if (seat.id === seatId2) {
              return {
                ...seat,
                studentId: seat1.studentId,
                isEmpty: seat1.isEmpty,
              };
            }
            return seat;
          }),
        },
        selectedSeatId: null,
      };
    }),

  assignStudentNameToSeat: (seatId, studentName) => {
    const state = get();
    if (!state.currentLayout) return;

    // 既存の生徒を探すか、新しく作成
    let student = state.students.find((s) => s.name === studentName);
    if (!student) {
      student = {
        id: `student-${Date.now()}`,
        name: studentName,
        furigana: "",
        gender: "other" as const,
        studentNumber: state.students.length + 1,
        roleIds: [],
      };
      set((state) => ({
        students: [...state.students, student!],
      }));
    }

    // 席に生徒を割り当て
    set((state) => ({
      currentLayout: state.currentLayout
        ? {
            ...state.currentLayout,
            seats: state.currentLayout.seats.map((seat) =>
              seat.id === seatId
                ? { ...seat, studentId: student!.id, isEmpty: false }
                : seat,
            ),
          }
        : null,
    }));
  },

  initializeDefaultLayout: () => {
    const state = get();
    if (!state.currentLayout) {
      // デフォルトレイアウトを作成
      get().createLayout(
        DEFAULT_LAYOUT_ROWS,
        DEFAULT_LAYOUT_COLS,
        DEFAULT_LAYOUT_NAME,
      );

      // 席に班を塊で割り当て
      const layout = get().currentLayout;
      if (layout) {
        const groupIds = [
          "group-han-1",
          "group-han-2",
          "group-han-3",
          "group-han-4",
          "group-han-5",
          "group-han-6",
        ];
        const updatedSeats = layout.seats.map((seat) => {
          const { row, col } = seat;
          let assignedGroupId: string | null = null;

          // 行0-1: 班1(列0-2), 班2(列3-5)
          if (row <= 1) {
            if (col <= 2) {
              assignedGroupId = groupIds[0];
            } else {
              assignedGroupId = groupIds[1];
            }
          }
          // 行2-3: 班3(列0-2), 班4(列3-5)
          else if (row <= 3) {
            if (col <= 2) {
              assignedGroupId = groupIds[2];
            } else {
              assignedGroupId = groupIds[3];
            }
          }
          // 行4-5: 班5(列0-2), 班6(列3-5)
          else if (row <= 5) {
            if (col <= 2) {
              assignedGroupId = groupIds[4];
            } else {
              assignedGroupId = groupIds[5];
            }
          }
          // 行6: 班1-6に均等に割り当て
          else {
            const groupIndex = col % 6;
            assignedGroupId = groupIds[groupIndex];
          }

          return {
            ...seat,
            groupIds: assignedGroupId ? [assignedGroupId] : [],
          };
        });

        set({
          currentLayout: {
            ...layout,
            seats: updatedSeats,
          },
        });
      }

      // サンプルデータを作成・追加
      const sampleStudents = [
        {
          id: "student-1",
          name: "田中太郎",
          furigana: "たなかたろう",
          gender: "male" as const,
          studentNumber: 1,
          roleIds: ["role-class-leader"],
        },
        {
          id: "student-2",
          name: "佐藤花子",
          furigana: "さとうはなこ",
          gender: "female" as const,
          studentNumber: 2,
          roleIds: ["role-vice-leader"],
        },
        {
          id: "student-3",
          name: "鈴木次郎",
          furigana: "すずきじろう",
          gender: "male" as const,
          studentNumber: 3,
          roleIds: [],
        },
        {
          id: "student-4",
          name: "高橋美咲",
          furigana: "たかはしみさき",
          gender: "female" as const,
          studentNumber: 4,
          roleIds: [],
        },
        {
          id: "student-5",
          name: "伊藤健太",
          furigana: "いとうけんた",
          gender: "male" as const,
          studentNumber: 5,
          roleIds: [],
        },
        {
          id: "student-6",
          name: "山田一郎",
          furigana: "やまだいちろう",
          gender: "male" as const,
          studentNumber: 6,
          roleIds: [],
        },
        {
          id: "student-7",
          name: "中村花子",
          furigana: "なかむらはなこ",
          gender: "female" as const,
          studentNumber: 7,
          roleIds: [],
        },
        {
          id: "student-8",
          name: "小林三郎",
          furigana: "こばやしさぶろう",
          gender: "male" as const,
          studentNumber: 8,
          roleIds: [],
        },
        {
          id: "student-9",
          name: "加藤美咲",
          furigana: "かとうみさき",
          gender: "female" as const,
          studentNumber: 9,
          roleIds: [],
        },
        {
          id: "student-10",
          name: "吉田健太",
          furigana: "よしだけんた",
          gender: "male" as const,
          studentNumber: 10,
          roleIds: [],
        },
        {
          id: "student-11",
          name: "松本一郎",
          furigana: "まつもといちろう",
          gender: "male" as const,
          studentNumber: 11,
          roleIds: [],
        },
        {
          id: "student-12",
          name: "木村花子",
          furigana: "きむらはなこ",
          gender: "female" as const,
          studentNumber: 12,
          roleIds: [],
        },
        {
          id: "student-13",
          name: "林三郎",
          furigana: "はやしさぶろう",
          gender: "male" as const,
          studentNumber: 13,
          roleIds: [],
        },
        {
          id: "student-14",
          name: "森美咲",
          furigana: "もりみさき",
          gender: "female" as const,
          studentNumber: 14,
          roleIds: [],
        },
        {
          id: "student-15",
          name: "清水健太",
          furigana: "しみずけんた",
          gender: "male" as const,
          studentNumber: 15,
          roleIds: [],
        },
        {
          id: "student-16",
          name: "斎藤一郎",
          furigana: "さいとういちろう",
          gender: "male" as const,
          studentNumber: 16,
          roleIds: [],
        },
        {
          id: "student-17",
          name: "渡辺花子",
          furigana: "わたなべはなこ",
          gender: "female" as const,
          studentNumber: 17,
          roleIds: [],
        },
        {
          id: "student-18",
          name: "石川三郎",
          furigana: "いしかわさぶろう",
          gender: "male" as const,
          studentNumber: 18,
          roleIds: [],
        },
        {
          id: "student-19",
          name: "阿部美咲",
          furigana: "あべみさき",
          gender: "female" as const,
          studentNumber: 19,
          roleIds: [],
        },
        {
          id: "student-20",
          name: "福田健太",
          furigana: "ふくだけんた",
          gender: "male" as const,
          studentNumber: 20,
          roleIds: [],
        },
        {
          id: "student-21",
          name: "岡田一郎",
          furigana: "おかだいちろう",
          gender: "male" as const,
          studentNumber: 21,
          roleIds: [],
        },
        {
          id: "student-22",
          name: "中島花子",
          furigana: "なかじまはなこ",
          gender: "female" as const,
          studentNumber: 22,
          roleIds: [],
        },
        {
          id: "student-23",
          name: "藤田三郎",
          furigana: "ふじたさぶろう",
          gender: "male" as const,
          studentNumber: 23,
          roleIds: [],
        },
        {
          id: "student-24",
          name: "村上美咲",
          furigana: "むらかみみさき",
          gender: "female" as const,
          studentNumber: 24,
          roleIds: [],
        },
        {
          id: "student-25",
          name: "西村健太",
          furigana: "にしむらけんた",
          gender: "male" as const,
          studentNumber: 25,
          roleIds: [],
        },
        {
          id: "student-26",
          name: "東一郎",
          furigana: "ひがしいちろう",
          gender: "male" as const,
          studentNumber: 26,
          roleIds: [],
        },
        {
          id: "student-27",
          name: "南花子",
          furigana: "みなみはなこ",
          gender: "female" as const,
          studentNumber: 27,
          roleIds: [],
        },
        {
          id: "student-28",
          name: "北三郎",
          furigana: "きたさぶろう",
          gender: "male" as const,
          studentNumber: 28,
          roleIds: [],
        },
        {
          id: "student-29",
          name: "上美咲",
          furigana: "うえみさき",
          gender: "female" as const,
          studentNumber: 29,
          roleIds: [],
        },
        {
          id: "student-30",
          name: "下健太",
          furigana: "しもけんた",
          gender: "male" as const,
          studentNumber: 30,
          roleIds: [],
        },
        {
          id: "student-31",
          name: "前田一郎",
          furigana: "まえだいちろう",
          gender: "male" as const,
          studentNumber: 31,
          roleIds: [],
        },
        {
          id: "student-32",
          name: "後藤花子",
          furigana: "ごとうはなこ",
          gender: "female" as const,
          studentNumber: 32,
          roleIds: [],
        },
        {
          id: "student-33",
          name: "左藤三郎",
          furigana: "さとうさぶろう",
          gender: "male" as const,
          studentNumber: 33,
          roleIds: [],
        },
        {
          id: "student-34",
          name: "右田美咲",
          furigana: "みぎたみさき",
          gender: "female" as const,
          studentNumber: 34,
          roleIds: [],
        },
        {
          id: "student-35",
          name: "中央健太",
          furigana: "ちゅうおうけんた",
          gender: "male" as const,
          studentNumber: 35,
          roleIds: [],
        },
        {
          id: "student-36",
          name: "外側一郎",
          furigana: "そとがわいちろう",
          gender: "male" as const,
          studentNumber: 36,
          roleIds: [],
        },
        {
          id: "student-37",
          name: "内側花子",
          furigana: "うちがわはなこ",
          gender: "female" as const,
          studentNumber: 37,
          roleIds: [],
        },
        {
          id: "student-38",
          name: "上側三郎",
          furigana: "うえがわさぶろう",
          gender: "male" as const,
          studentNumber: 38,
          roleIds: [],
        },
        {
          id: "student-39",
          name: "下側美咲",
          furigana: "したがわみさき",
          gender: "female" as const,
          studentNumber: 39,
          roleIds: [],
        },
      ];

      // サンプルデータを追加
      sampleStudents.forEach((student) => {
        set((state) => ({
          students: [...state.students, student],
        }));
      });

      // 席に生徒をランダムに割り当て
      const currentLayout = get().currentLayout;
      if (currentLayout) {
        const allSeats = [...currentLayout.seats];
        const shuffledStudents = [...sampleStudents].sort(
          () => Math.random() - UI_CONSTANTS.LAYOUT.RANDOM_SORT_OFFSET,
        );

        // 3席を空席にする
        const emptySeats = allSeats
          .sort(() => Math.random() - UI_CONSTANTS.LAYOUT.RANDOM_SORT_OFFSET)
          .slice(0, 3);

        emptySeats.forEach((seat) => {
          get().toggleSeatEmpty(seat.id);
        });

        // 2席を名無し席にする（生徒IDは設定しない）
        const unnamedSeats = allSeats
          .filter(
            (seat) => !emptySeats.some((emptySeat) => emptySeat.id === seat.id),
          )
          .sort(() => Math.random() - UI_CONSTANTS.LAYOUT.RANDOM_SORT_OFFSET)
          .slice(0, 2);

        // 名無し席のstudentIdプロパティを削除
        unnamedSeats.forEach((seat) => {
          const { studentId, ...seatWithoutStudentId } = seat;
          get().setCurrentLayout({
            ...get().currentLayout!,
            seats: get().currentLayout!.seats.map((s) =>
              s.id === seat.id ? seatWithoutStudentId : s,
            ),
          });
        });

        // 残りの席に生徒を割り当て
        const remainingSeats = allSeats.filter(
          (seat) =>
            !emptySeats.some((emptySeat) => emptySeat.id === seat.id) &&
            !unnamedSeats.some((unnamedSeat) => unnamedSeat.id === seat.id),
        );

        remainingSeats.forEach((seat, index) => {
          if (index < shuffledStudents.length) {
            get().assignStudentToSeat(shuffledStudents[index].id, seat.id);
          }
        });
      }
    }
  },

  setSettingsPanelWidth: (width) => set({ settingsPanelWidth: width }),

  // グループ管理の実装
  addGroup: (group) =>
    set((state) => ({
      groups: [...state.groups, group],
    })),

  removeGroup: (groupId) =>
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== groupId),
      currentLayout: state.currentLayout
        ? {
            ...state.currentLayout,
            seats: state.currentLayout.seats.map((seat) => ({
              ...seat,
              groupIds: seat.groupIds.filter((gid) => gid !== groupId),
            })),
          }
        : null,
    })),

  updateGroup: (groupId, updates) =>
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId ? { ...g, ...updates } : g,
      ),
    })),

  toggleGroupOnSeat: (seatId, groupId) =>
    set((state) => {
      if (!state.currentLayout) return state;

      return {
        currentLayout: {
          ...state.currentLayout,
          seats: state.currentLayout.seats.map((seat) => {
            if (seat.id !== seatId) return seat;

            const hasGroup = seat.groupIds.includes(groupId);
            return {
              ...seat,
              groupIds: hasGroup
                ? seat.groupIds.filter((gid) => gid !== groupId)
                : [...seat.groupIds, groupId],
            };
          }),
        },
      };
    }),

  removeGroupFromSeat: (seatId, groupId) =>
    set((state) => {
      if (!state.currentLayout) return state;

      return {
        currentLayout: {
          ...state.currentLayout,
          seats: state.currentLayout.seats.map((seat) =>
            seat.id === seatId
              ? {
                  ...seat,
                  groupIds: seat.groupIds.filter((gid) => gid !== groupId),
                }
              : seat,
          ),
        },
      };
    }),

  addGroupToSeat: (seatId, groupId) =>
    set((state) => {
      if (!state.currentLayout) return state;

      return {
        currentLayout: {
          ...state.currentLayout,
          seats: state.currentLayout.seats.map((seat) =>
            seat.id === seatId && !seat.groupIds.includes(groupId)
              ? { ...seat, groupIds: [...seat.groupIds, groupId] }
              : seat,
          ),
        },
      };
    }),

  // ロール管理の実装
  addRole: (role) =>
    set((state) => ({
      roles: [...state.roles, role],
    })),

  removeRole: (roleId) =>
    set((state) => ({
      roles: state.roles.filter((r) => r.id !== roleId),
      students: state.students.map((student) => ({
        ...student,
        roleIds: student.roleIds.filter((id) => id !== roleId),
      })),
    })),

  updateRole: (roleId, updates) =>
    set((state) => ({
      roles: state.roles.map((r) =>
        r.id === roleId ? { ...r, ...updates } : r,
      ),
    })),

  assignRoleToStudent: (studentId, roleId) =>
    set((state) => ({
      students: state.students.map((student) =>
        student.id === studentId
          ? {
              ...student,
              roleIds: [
                ...student.roleIds.filter((id) => id !== roleId),
                roleId,
              ],
            }
          : student,
      ),
    })),

  removeRoleFromStudent: (studentId, roleId) =>
    set((state) => ({
      students: state.students.map((student) =>
        student.id === studentId
          ? {
              ...student,
              roleIds: student.roleIds.filter((id) => id !== roleId),
            }
          : student,
      ),
    })),

  // 条件管理の実装
  addCondition: (condition) =>
    set((state) => ({
      conditions: [...state.conditions, condition],
    })),

  removeCondition: (conditionId) =>
    set((state) => ({
      conditions: state.conditions.filter((c) => c.id !== conditionId),
    })),

  updateCondition: (conditionId, updates) =>
    set((state) => ({
      conditions: state.conditions.map((c) =>
        c.id === conditionId ? { ...c, ...updates } : c,
      ),
    })),

  toggleCondition: (conditionId) =>
    set((state) => ({
      conditions: state.conditions.map((c) =>
        c.id === conditionId ? { ...c, enabled: !c.enabled } : c,
      ),
    })),

  // シャッフル結果分析の管理
  setLastShuffleAnalysis: (analysis) => set({ lastShuffleAnalysis: analysis }),

  // 条件検証の実装
  validateConditions: () => {
    const state = get();
    if (!state.currentLayout) {
      return {
        isValid: false,
        errors: ["席配置が設定されていません"],
        warnings: [],
      };
    }

    return validateAllConditions(
      state.conditions,
      state.students,
      state.groups,
      state.roles,
      state.currentLayout.seats,
    );
  },

  checkConditionConflicts: () => {
    const state = get();
    if (!state.currentLayout) {
      return {
        isValid: false,
        errors: ["席配置が設定されていません"],
        warnings: [],
      };
    }

    return checkConditionConflicts(
      state.conditions,
      state.students,
      state.groups,
      state.roles,
    );
  },
}));
