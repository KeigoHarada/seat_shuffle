import type { Student, Seat, Condition } from "../../types";
import { ShuffleManager } from "../../utils/ShuffleManager";
import { ConditionalShuffleAlgorithm } from "../../algorithms/ConditionalShuffleAlgorithm";
import { RandomShuffleAlgorithm } from "../../algorithms/RandomShuffleAlgorithm";
import {
  SHUFFLE_ANIMATIONS,
  DEFAULT_SHUFFLE_ANIMATION,
  type ShuffleAnimation,
} from "../../utils/shuffleAnimations";

type SetState = (partial: unknown) => void;
type GetState = () => unknown;

function createShuffleManager(): ShuffleManager {
  return new ShuffleManager({
    defaultAlgorithm: "conditional",
    algorithms: {
      conditional: new ConditionalShuffleAlgorithm(),
      random: new RandomShuffleAlgorithm(),
    },
    maxAttempts: 1000,
    timeout: 10000,
  });
}

export function createShuffleSlice(set: SetState, get: GetState) {
  const shuffleManager = createShuffleManager();

  let currentAnimation: ShuffleAnimation =
    SHUFFLE_ANIMATIONS[DEFAULT_SHUFFLE_ANIMATION] ||
    SHUFFLE_ANIMATIONS["name-shuffle"]!;

  return {
    shuffleManager,

    setShuffleAnimation: (animationName: string) => {
      const animation = SHUFFLE_ANIMATIONS[animationName];
      if (animation) {
        currentAnimation = animation;
      }
    },

    getShuffleAnimation: (): ShuffleAnimation => {
      return currentAnimation;
    },

    shuffleSeats: async () => {
      type ShuffleState = {
        currentLayout: { seats: Seat[] } | null;
        students: Student[];
        conditions: Condition[];
        shuffleManager: ShuffleManager;
      };
      const state = get() as ShuffleState;
      if (!state.currentLayout) return;

      const animation = currentAnimation;
      const startTime = Date.now();
      (window as any).__shuffleStartTime = startTime;
      set({ isShuffling: true });

      let audio: HTMLAudioElement | null = null;
      if (animation.audioUrl) {
        try {
          const baseUrl = import.meta.env.BASE_URL || "/";
          const audioPath = baseUrl + animation.audioUrl.replace(/^\//, "");
          console.log(
            "音楽ファイルを読み込みます:",
            audioPath,
            "BASE_URL:",
            baseUrl,
          );
          audio = new Audio(audioPath);
          audio.volume = 0.5;
          audio.loop = true;

          const currentAudio = audio;
          currentAudio.addEventListener("canplaythrough", () => {
            console.log("音楽ファイルの読み込み完了:", audioPath);
          });

          currentAudio.addEventListener("error", (e) => {
            console.error("音楽ファイルの読み込みエラー:", e, audioPath);
            console.error("Audio要素のエラー詳細:", currentAudio.error);
          });

          const playPromise = currentAudio.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("音楽の再生を開始しました:", audioPath);
              })
              .catch((error) => {
                console.error("音楽の再生に失敗しました:", error, audioPath);
                console.error("エラー詳細:", error.name, error.message);
              });
          }
        } catch (error) {
          console.error("音楽ファイルの読み込みに失敗しました:", error);
        }
      }

      try {
        const {
          currentLayout,
          students,
          conditions,
          shuffleManager: manager,
        } = get() as ShuffleState;
        if (!currentLayout) return;

        const enabledConditions = conditions.filter((c) => c.enabled);
        if (enabledConditions.length === 0) {
          manager.setAlgorithm("random");
        } else {
          manager.setAlgorithm("conditional");
        }

        const shufflePromise = manager.shuffle(
          students,
          currentLayout.seats,
          conditions,
        );

        const animationPromise = new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve();
          }, animation.duration);
        });

        const [assignment] = await Promise.all([
          shufflePromise,
          animationPromise,
        ]);

        const beforeAssignment: Record<string, string | undefined> = {};
        for (const seat of currentLayout.seats) {
          beforeAssignment[seat.id] = seat.studentId;
        }

        const formatDisplay = (
          seats: Seat[],
          assignment: Record<string, string | undefined>,
        ): string => {
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
        };

        const beforeAssignedStudents = new Set(
          Object.values(beforeAssignment).filter((id) => id !== undefined),
        );
        const beforeUnnamedCount = currentLayout.seats.filter(
          (s) => !s.isEmpty && !s.studentId,
        ).length;
        const beforeEmptyCount = currentLayout.seats.filter(
          (s) => s.isEmpty,
        ).length;

        console.log(
          "\n【シャッフル前】\n" +
            formatDisplay(currentLayout.seats, beforeAssignment),
        );
        console.log(
          `\n【統計】割り当て済み生徒: ${beforeAssignedStudents.size}人, 名無し席: ${beforeUnnamedCount}席, 空席: ${beforeEmptyCount}席, 全生徒数: ${students.length}人`,
        );

        const afterAssignedStudents = new Set(
          Object.values(assignment).filter((id) => id !== undefined),
        );
        const afterUnnamedCount = currentLayout.seats.filter(
          (seat) => !seat.isEmpty && assignment[seat.id] === undefined,
        ).length;
        const afterEmptyCount = currentLayout.seats.filter(
          (s) => s.isEmpty,
        ).length;

        console.log(
          "\n【シャッフル後】\n" +
            formatDisplay(currentLayout.seats, assignment),
        );
        console.log(
          `\n【統計】割り当て済み生徒: ${afterAssignedStudents.size}人, 名無し席: ${afterUnnamedCount}席, 空席: ${afterEmptyCount}席`,
        );

        const newStudents = Array.from(afterAssignedStudents).filter(
          (id) => !beforeAssignedStudents.has(id),
        );
        const removedStudents = Array.from(beforeAssignedStudents).filter(
          (id) => !afterAssignedStudents.has(id),
        );
        if (newStudents.length > 0) {
          console.log(
            `\n【追加された生徒】${newStudents.map((id) => students.find((s) => s.id === id)?.name ?? id).join(", ")}`,
          );
        }
        if (removedStudents.length > 0) {
          console.log(
            `\n【削除された生徒】${removedStudents.map((id) => students.find((s) => s.id === id)?.name ?? id).join(", ")}`,
          );
        }
        const newSeats = currentLayout.seats.map((seat) => {
          if (seat.isEmpty) return seat;
          const assignedStudentId = assignment[seat.id];
          if (assignedStudentId) {
            return { ...seat, studentId: assignedStudentId };
          }
          const { studentId, ...rest } = seat;
          return rest;
        });

        set({
          currentLayout: { ...currentLayout, seats: newSeats },
        });
      } catch (error) {
        console.error("シャッフル中にエラーが発生しました:", error);
      } finally {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
        set({ isShuffling: false });
      }
    },
  };
}
