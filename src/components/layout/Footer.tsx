import React from "react";
import { Shuffle, Eye, PenLine } from "lucide-react";
import { useStore } from "../../stores";
import { optimizeShuffle } from "../../utils/algorithm";
import { showToast } from "../../stores/toast";

const Footer: React.FC = () => {
  const isViewMode = useStore((state) => state.isViewMode);
  const setIsViewMode = useStore((state) => state.setIsViewMode);

  const handleShuffle = () => {
    const state = useStore.getState();
    const { seats, students, constraints, appSettings, setSeats } = state;

    const algorithm = appSettings.algorithm || "random";

    if (algorithm === "random") {
      const lockedSeats = seats.filter((s) => s.isLocked);
      const lockedStudentIds = new Set(
        lockedSeats.map((s) => s.studentId).filter(Boolean),
      );

      // We shuffle the available SEATS instead, so that if there are more seats
      // than students, the empty seats are scattered randomly across the canvas.
      const availableSeats = seats.filter((s) => !s.isLocked);
      const shuffledSeats = [...availableSeats];
      for (let i = shuffledSeats.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledSeats[i], shuffledSeats[j]] = [
          shuffledSeats[j],
          shuffledSeats[i],
        ];
      }

      // Map each student to a random seat
      const seatAssignments = new Map<string, string | null>();
      const availableStudents = students.filter(
        (s) => !lockedStudentIds.has(s.id),
      );
      availableStudents.forEach((student, index) => {
        if (index < shuffledSeats.length) {
          seatAssignments.set(shuffledSeats[index].id, student.id);
        }
      });
      // The remaining shuffled seats will be empty
      for (let i = availableStudents.length; i < shuffledSeats.length; i++) {
        seatAssignments.set(shuffledSeats[i].id, null);
      }

      const newSeats = seats.map((seat) => {
        if (seat.isLocked) return seat;
        return { ...seat, studentId: seatAssignments.get(seat.id) || null };
      });

      setSeats(newSeats);
      showToast.success("ランダムシャッフルが完了しました");
    } else if (algorithm === "optimize") {
      // Execute constrained optimization
      const { newSeats, unsatisfiedCount } = optimizeShuffle(
        students,
        seats,
        constraints,
      );
      setSeats(newSeats);
      if (unsatisfiedCount === 0) {
        showToast.success("すべての条件を満たした座席配置が完了しました！");
      } else {
        showToast.error(
          `最適化しましたが、${unsatisfiedCount}件の条件が満たせませんでした`,
        );
      }
    }
  };

  return (
    <footer
      style={{
        height: "80px",
        backgroundColor: "var(--c-surface)",
        borderTop: "1px solid var(--c-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 var(--spacing-lg)",
        flexShrink: 0,
        boxShadow: "0 -1px 3px rgba(0, 0, 0, 0.05)",
        zIndex: 10,
        position: "relative",
      }}
    >
      {/* Left side (empty for balance) */}
      <div style={{ flex: 1 }}></div>

      {/* Center - Shuffle Button */}
      <div style={{ display: "flex", justifyContent: "center", flex: 1 }}>
        <button
          className="btn-primary"
          onClick={handleShuffle}
          style={{
            gap: "8px",
            padding: "12px 32px",
            fontSize: "18px",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-2)",
          }}
        >
          <Shuffle size={20} /> シャッフル実行
        </button>
      </div>

      {/* Right side - Mode Toggle */}
      <div style={{ display: "flex", justifyContent: "flex-end", flex: 1 }}>
        <button
          onClick={() => setIsViewMode(!isViewMode)}
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            background: "var(--c-surface-disabled)",
            padding: "4px",
            borderRadius: "var(--radius-full)",
            border: "none",
            cursor: "pointer",
            width: "160px",
            height: "40px",
          }}
        >
          {/* Animated Slider Background */}
          <div
            style={{
              position: "absolute",
              top: "4px",
              bottom: "4px",
              left: isViewMode ? "50%" : "4px",
              width: "calc(50% - 4px)",
              background: "var(--c-surface)",
              borderRadius: "var(--radius-full)",
              boxShadow: "var(--shadow-1)",
              transition: "left 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)",
            }}
          />

          {/* Labels */}
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              fontWeight: 700,
              zIndex: 1,
              color: !isViewMode ? "var(--c-text-main)" : "var(--c-text-sub)",
              transition: "color 0.3s ease",
            }}
          >
            <PenLine size={16} /> 編集
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              fontWeight: 700,
              zIndex: 1,
              color: isViewMode ? "var(--c-text-main)" : "var(--c-text-sub)",
              transition: "color 0.3s ease",
            }}
          >
            <Eye size={16} /> 閲覧
          </div>
        </button>
      </div>
    </footer>
  );
};

export default Footer;
