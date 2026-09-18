import { useStore } from "../stores";
import { optimizeShuffle } from "../utils/algorithm";
import { showToast } from "../stores/toast";

export function useShuffle() {
  const isViewMode = useStore((state) => state.isViewMode);
  const isShuffling = useStore((state) => state.isShuffling);
  const setIsShuffling = useStore((state) => state.setIsShuffling);
  const undoStack = useStore((state) => state.undoStack);
  const pushUndo = useStore((state) => state.pushUndo);
  const undo = useStore((state) => state.undo);

  const canUndo = undoStack.length > 0 && !isShuffling;

  const handleShuffle = () => {
    if (isShuffling) return;

    pushUndo();

    const state = useStore.getState();
    const { seats, students, constraints, appSettings, setSeats } = state;

    const algorithm = appSettings.algorithm || "random";
    const animation = appSettings.shuffleAnimation || "none";

    const activeConstraints = algorithm === "random" ? [] : constraints;
    const { newSeats, unsatisfiedCount } = optimizeShuffle(
      students,
      seats,
      activeConstraints,
    );

    const isSuccess = unsatisfiedCount === 0;
    const message =
      algorithm === "random"
        ? "ランダムシャッフルが完了しました"
        : unsatisfiedCount === 0
          ? "すべての条件を満たした座席配置が完了しました！"
          : `最適化しましたが、${unsatisfiedCount}件の条件が満たせませんでした`;

    if (isViewMode) {
      setIsShuffling(true);
      const duration = animation === "none" ? 5000 : 3000;

      const interval = setInterval(() => {
        const allStudentIds = students.map((s) => s.id);
        const nullCount = Math.max(0, seats.length - allStudentIds.length);
        const assignments = [
          ...allStudentIds,
          ...Array(nullCount).fill(null),
        ].sort(() => Math.random() - 0.5);

        const scrambled = seats.map((seat, idx) => {
          return { ...seat, studentId: assignments[idx] };
        });
        setSeats(scrambled);
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        setSeats(newSeats);
        setIsShuffling(false);
      }, duration);
      return;
    }

    setSeats(newSeats);
    if (isSuccess) {
      showToast.success(message);
    } else {
      showToast.error(message);
    }
  };

  return {
    handleShuffle,
    undo,
    isShuffling,
    canUndo,
  };
}
