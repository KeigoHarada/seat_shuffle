import { useCallback } from "react";
import { useStore } from "../../../stores/appStore";
import { autoAssignStudents } from "../../../services/autoAssign";
import { showToast } from "../../../stores/toast";

export const useAutoAssignAction = () => {
  const seats = useStore((state) => state.seats);
  const students = useStore((state) => state.students);
  const setSeats = useStore((state) => state.setSeats);

  const handleAutoAssign = useCallback(() => {
    const algorithm = useStore.getState().appSettings.autoAssignAlgorithm;
    const { assignments, error } = autoAssignStudents(
      seats,
      students,
      algorithm,
    );

    if (error) {
      switch (error) {
        case "no-empty-seats":
          showToast.error("空席がありません。座席を追加してください。");
          return;
        case "no-waiting-students":
          showToast.info("割り当て待ちの生徒がいません。");
          return;
        default: {
          const _exhaustive: never = error;
          return _exhaustive;
        }
      }
    }

    const assigned = new Map(
      assignments.map(({ seatId, studentId }) => [seatId, studentId]),
    );
    useStore.getState().pushUndo();
    setSeats(
      seats.map((seat) => {
        const studentId = assigned.get(seat.id);
        return studentId === undefined ? seat : { ...seat, studentId };
      }),
    );

    showToast.success(`${assignments.length}人の生徒を自動割り当てしました！`);
  }, [seats, students, setSeats]);

  return { handleAutoAssign };
};
