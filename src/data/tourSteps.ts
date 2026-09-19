import { generateTemplate } from "../services/templates";
import { assignGroupsByBlocks } from "../services/group";
import {
  createSampleStudents,
  createDefaultClassroomState,
  createTourInitialState,
} from "./defaultData";
import { sortStudentsByNameLogic } from "../services/student";
import { optimizeShuffle } from "../services/shuffle";
import type { TourStep } from "../types/onboarding";

export const TOUR_STEPS: TourStep[] = [
  {
    id: "step-intro-canvas",
    targetSelector: "#canvas-main-area",
    title: "1. 座席を配置する場所（Canvas）",
    description:
      "左側の広いエリアは「Canvas」です。ここに座席を配置し、視覚的に席替えの結果を確認します。",
    actionHint: "「次へ」または「スキップ」をクリックしてください",
    placement: "right",
    isInfoOnly: true,
    setupPreState: (mainStore) => {
      mainStore.setIsViewMode(false);
      mainStore.setIsSettingsOpen(false);
      mainStore.loadTourInitialState();
      mainStore.setSeats([]);
      mainStore.objects.forEach((o) => mainStore.removeObject(o.id));
    },
    setupPostState: (mainStore) => {
      mainStore.loadTourInitialState();
      mainStore.setSeats([]);
      mainStore.objects.forEach((o) => mainStore.removeObject(o.id));
    },
    setupIdealState: (mainStore) => {
      mainStore.loadTourInitialState();
      mainStore.setSeats([]);
      mainStore.objects.forEach((o) => mainStore.removeObject(o.id));
    },
    checkCondition: () => true,
  },
  {
    id: "step-intro-settings",
    targetSelector: "#settings-main-area",
    title: "2. 各種設定を行う場所（設定パネル）",
    description:
      "右側のエリアは「設定パネル」です。生徒の名簿や班、様々な条件をここで細かく設定します。まずは基本操作を体験してみましょう！",
    actionHint: "「次へ」または「スキップ」をクリックしてください",
    placement: "left",
    settingsTab: "global",
    isInfoOnly: true,
    setupPreState: (mainStore) => {
      mainStore.setIsViewMode(false);
      mainStore.setIsSettingsOpen(true);
      mainStore.setActiveSettingsTab("global");
      mainStore.loadTourInitialState();
      mainStore.setSeats([]);
      mainStore.objects.forEach((o) => mainStore.removeObject(o.id));
    },
    setupPostState: (mainStore) => {
      mainStore.loadTourInitialState();
      mainStore.setSeats([]);
      mainStore.objects.forEach((o) => mainStore.removeObject(o.id));
    },
    setupIdealState: (mainStore) => {
      mainStore.loadTourInitialState();
      mainStore.setSeats([]);
      mainStore.objects.forEach((o) => mainStore.removeObject(o.id));
    },
    checkCondition: () => true,
  },
  {
    id: "step-template",
    targetSelector: "#btn-toolbar-template",
    title: "3. テンプレートから座席を配置",
    description:
      "まずは教室の座席を配置しましょう！ツールバーの「テンプレート」をクリックし、「教室」を選択してください。",
    actionHint: "「テンプレート」から「教室」を選択してください",
    placement: "right",
    setupPreState: (mainStore) => {
      mainStore.setIsViewMode(false);
      mainStore.setIsSettingsOpen(true);
      mainStore.setSeats([]);
      mainStore.objects.forEach((o) => mainStore.removeObject(o.id));
    },
    setupPostState: () => {},
    setupIdealState: (mainStore) => {
      mainStore.setSeats([]);
      mainStore.objects.forEach((o) => mainStore.removeObject(o.id));
      const { seats, objects } = generateTemplate("classroom", 0, 0);
      const cleanSeats = seats.map((s) => ({ ...s, groupIds: [] }));
      mainStore.setSeats(cleanSeats);
      objects.forEach((o) => mainStore.addObject(o));
    },
    checkCondition: (mainStore) => mainStore.seats.length >= 30,
  },
  {
    id: "step-add-student",
    targetSelector: "#student-add-form",
    title: "4. 生徒を1名追加登録",
    description:
      "現在29名の生徒が登録されています。30人目の生徒（例: 名前「そ花子」、ふりがな「ソハナコ」）を入力して「生徒を追加」ボタンを押してみましょう！",
    actionHint: "名前を入力して「生徒を追加」してください",
    placement: "left",
    settingsTab: "students",
    setupPreState: (mainStore) => {
      mainStore.setIsViewMode(false);
      mainStore.setIsSettingsOpen(true);
      mainStore.setActiveSettingsTab("students");
      const { seats, objects } = generateTemplate("classroom", 0, 0);
      const cleanSeats = seats.map((s) => ({ ...s, groupIds: [] }));
      mainStore.setSeats(cleanSeats);
      mainStore.objects.forEach((o) => mainStore.removeObject(o.id));
      objects.forEach((o) => mainStore.addObject(o));
      const baseState = createTourInitialState();
      mainStore.loadState({ students: baseState.students });
    },
    setupPostState: () => {},
    setupIdealState: (mainStore) => {
      const expectedStudents = createSampleStudents();
      let newStudent = mainStore.students.find(
        (s) => !createTourInitialState().students.some((ts) => ts.id === s.id),
      );
      if (!newStudent) newStudent = expectedStudents[29];
      const baseState = createTourInitialState();
      mainStore.loadState({
        students: [...baseState.students, newStudent],
      });
    },
    checkCondition: (mainStore) => mainStore.students.length >= 30,
  },
  {
    id: "step-sort-students",
    targetSelector: "#btn-sort-students",
    title: "5. 名簿を名前順に整列",
    description:
      "追加した生徒を含めて出席番号を整列します。「ふりがな / 名前」の横にある「名前順ソート」ボタンをクリックしてください。",
    actionHint: "「名前順ソート」ボタンをクリックしてください",
    placement: "left",
    settingsTab: "students",
    setupPreState: (mainStore) => {
      mainStore.setIsViewMode(false);
      mainStore.setIsSettingsOpen(true);
      mainStore.setActiveSettingsTab("students");
    },
    setupPostState: () => {},
    setupIdealState: (mainStore) => {
      const expectedStudents = createSampleStudents();
      let newStudent = mainStore.students.find(
        (s) => !createTourInitialState().students.some((ts) => ts.id === s.id),
      );
      if (!newStudent) newStudent = expectedStudents[29];
      const baseState = createTourInitialState();
      mainStore.loadState({
        students: sortStudentsByNameLogic([...baseState.students, newStudent]),
      });
    },
    checkCondition: (mainStore) =>
      mainStore.students.length >= 30 &&
      mainStore.students[0]?.name === "あ太郎" &&
      mainStore.students[1]?.name === "あ花子",
  },
  {
    id: "step-assign-groups",
    targetSelector: "#canvas-main-area",
    title: "6. 座席への班割り当て",
    description:
      "9割の座席には自動で班を割り当てました。残りの空席を右クリックして、未設定の班（6班）を手動で割り当ててみましょう！",
    actionHint: "空席に班を割り当ててください",
    placement: "right",
    setupPreState: (mainStore) => {
      mainStore.setIsViewMode(false);
      mainStore.setIsSettingsOpen(true);
      mainStore.setActiveSettingsTab("groups");

      const classGroups = mainStore.groups.filter(
        (g) => g.id !== "group-vision" && g.id !== "group-6",
      );
      const cleanSeats = mainStore.seats.map((s) => ({ ...s, groupIds: [] }));
      let finalSeats = assignGroupsByBlocks(
        cleanSeats,
        classGroups,
        3,
        2,
        "right-to-left",
      );
      mainStore.setSeats(finalSeats);
    },
    setupPostState: () => {},
    setupIdealState: (mainStore) => {
      let finalSeats = mainStore.seats.map((s) => {
        if (s.groupIds.length === 0) return { ...s, groupIds: ["group-6"] };
        return s;
      });
      mainStore.setSeats(finalSeats);
    },
    checkCondition: (mainStore) =>
      mainStore.seats.length > 0 &&
      !mainStore.seats.some((s) => s.groupIds.length === 0),
  },
  {
    id: "step-add-constraint",
    targetSelector: "#tab-btn-constraints",
    title: "7. 条件を追加（班長と前方配慮）",
    description:
      "「条件」タブを選択し、班長が各班に1名以上入る条件（役割条件）や、前方配慮が必要な生徒を前方に配置する条件を追加・設定しましょう！",
    actionHint: "「条件」タブで必要な条件を追加してください",
    placement: "left",
    settingsTab: "constraints",
    setupPreState: (mainStore) => {
      mainStore.setIsViewMode(false);
      mainStore.setIsSettingsOpen(true);
      mainStore.setActiveSettingsTab("constraints");

      const newSeats = mainStore.seats.map((s) => ({
        ...s,
        groupIds: s.groupIds.filter((g) => g !== "group-vision"),
      }));
      mainStore.setSeats(newSeats);
    },
    setupPostState: (mainStore) => {
      const minY = Math.min(...mainStore.seats.map((s) => s.y));
      const hasVisionGroup = mainStore.groups.some(
        (g) => g.id === "group-vision",
      );
      if (hasVisionGroup) {
        const finalSeats = mainStore.seats.map((seat) => ({
          ...seat,
          groupIds:
            seat.y === minY && !seat.groupIds.includes("group-vision")
              ? [...seat.groupIds, "group-vision"]
              : seat.groupIds,
        }));
        mainStore.setSeats(finalSeats);
      }
    },
    setupIdealState: (mainStore) => {
      const { constraints: defaultConstraints } = createDefaultClassroomState();
      mainStore.loadState({ constraints: defaultConstraints });

      const minY = Math.min(...mainStore.seats.map((s) => s.y));
      const hasVisionGroup = mainStore.groups.some(
        (g) => g.id === "group-vision",
      );
      if (hasVisionGroup) {
        const finalSeats = mainStore.seats.map((seat) => ({
          ...seat,
          groupIds:
            seat.y === minY && !seat.groupIds.includes("group-vision")
              ? [...seat.groupIds, "group-vision"]
              : seat.groupIds,
        }));
        mainStore.setSeats(finalSeats);
      }
    },
    checkCondition: (mainStore) => mainStore.constraints.length > 3,
  },
  {
    id: "step-shuffle",
    targetSelector: "#btn-footer-shuffle",
    title: "8. シャッフルを実行",
    description:
      "すべての条件が整いました！フッター中央の「シャッフル実行」ボタンを押して、条件を満たした最適な座席配置を自動計算しましょう！",
    actionHint: "「シャッフル実行」をクリックしてください",
    placement: "right",
    setupPreState: (mainStore) => {
      mainStore.setIsViewMode(false);
      mainStore.setIsSettingsOpen(true);

      mainStore.loadState({ undoStack: [] } as any);
      const newSeats = mainStore.seats.map((s) => ({ ...s, studentId: null }));
      mainStore.setSeats(newSeats);
    },
    setupPostState: (mainStore) => {
      if (mainStore.undoStack.length === 0) {
        mainStore.pushUndo();
      }
    },
    setupIdealState: (mainStore) => {
      if (mainStore.undoStack.length === 0) {
        mainStore.pushUndo();
      }
      const { newSeats } = optimizeShuffle(
        mainStore.students,
        mainStore.seats,
        mainStore.constraints,
      );
      mainStore.setSeats(newSeats);
    },
    checkCondition: (mainStore) =>
      mainStore.undoStack.length > 0 || mainStore.isShuffling,
  },
  {
    id: "step-viewmode",
    targetSelector: "#btn-footer-viewmode",
    title: "9. 生徒閲覧モードで確認",
    description:
      "右下の「閲覧」スイッチをクリックして、生徒に見せる専用モードに切り替えてみましょう。配慮メモが隠れて安心です！",
    actionHint: "「閲覧」スイッチをクリックしてください",
    placement: "right",
    setupPreState: (mainStore) => {
      mainStore.setIsViewMode(false);
      mainStore.setIsSettingsOpen(true);
    },
    setupPostState: () => {},
    setupIdealState: (mainStore) => {
      mainStore.setIsViewMode(true);
    },
    checkCondition: (mainStore) => mainStore.isViewMode,
  },
];
