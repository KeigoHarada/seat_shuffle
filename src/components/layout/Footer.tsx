import React from "react";
import { Shuffle, Eye, PenLine, Undo2, Heart } from "lucide-react";
import { useStore } from "../../stores";
import { optimizeShuffle } from "../../utils/algorithm";
import { showToast } from "../../stores/toast";
import { useDonationStore } from "../../stores/donation";

const Footer: React.FC = () => {
  const isViewMode = useStore((state) => state.isViewMode);
  const setIsViewMode = useStore((state) => state.setIsViewMode);
  const isShuffling = useStore((state) => state.isShuffling);
  const setIsShuffling = useStore((state) => state.setIsShuffling);
  const pastSeats = useStore((state) => state.pastSeats);
  const saveSeatHistory = useStore((state) => state.saveSeatHistory);
  const undoShuffle = useStore((state) => state.undoShuffle);
  const openDonationModal = useDonationStore(
    (state) => state.openDonationModal,
  );
  const hasDonated = useDonationStore((state) => state.hasDonated());

  const handleShuffle = () => {
    if (isShuffling) return;

    saveSeatHistory();

    const state = useStore.getState();
    const { seats, students, constraints, appSettings, setSeats } = state;

    const algorithm = appSettings.algorithm || "random";
    const animation = appSettings.shuffleAnimation || "none";

    const computeFinalShuffle = () => {
      const activeConstraints = algorithm === "random" ? [] : constraints;
      const { newSeats, unsatisfiedCount } = optimizeShuffle(
        students,
        seats,
        activeConstraints,
      );

      return {
        newSeats,
        isSuccess: unsatisfiedCount === 0,
        message:
          algorithm === "random"
            ? "ランダムシャッフルが完了しました"
            : unsatisfiedCount === 0
              ? "すべての条件を満たした座席配置が完了しました！"
              : `最適化しましたが、${unsatisfiedCount}件の条件が満たせませんでした`,
      };
    };

    // 先に最終結果を計算する
    const finalResult = computeFinalShuffle();

    if (isViewMode) {
      setIsShuffling(true);
      const duration = animation === "none" ? 5000 : 3000;

      const interval = setInterval(() => {
        // Scramble ALL students across ALL seats rapidly
        const allStudentIds = students.map((s) => s.id);
        const nullCount = Math.max(0, seats.length - allStudentIds.length);
        const assignments = [
          ...allStudentIds,
          ...Array(nullCount).fill(null),
        ].sort(() => Math.random() - 0.5);

        const newSeats = seats.map((seat, idx) => {
          return { ...seat, studentId: assignments[idx] };
        });
        setSeats(newSeats);
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        // あらかじめ計算済みの結果を即座に適用する
        setSeats(finalResult.newSeats);
        setIsShuffling(false);
      }, duration);
    } else {
      setSeats(finalResult.newSeats);
      if (finalResult.isSuccess) {
        showToast.success(finalResult.message);
      } else {
        showToast.error(finalResult.message);
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
      {/* Left side */}
      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <button
          id="footer-donation-btn"
          onClick={() => openDonationModal()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--c-text-sub)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "6px 10px",
            borderRadius: "var(--radius-md)",
            transition: "all var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#e11d48";
            e.currentTarget.style.backgroundColor = "#fff1f2";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--c-text-sub)";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
          title="ラクガエの開発者を応援・寄付する"
        >
          <Heart size={15} color="#e11d48" fill="#fda4af" />
          <span>開発者を応援・寄付する</span>
          {hasDonated && (
            <span
              style={{
                fontSize: "11px",
                backgroundColor: "#fef3c7",
                color: "#b45309",
                padding: "1px 6px",
                borderRadius: "var(--radius-full)",
                fontWeight: 700,
              }}
            >
              サポーター ✨
            </span>
          )}
        </button>
      </div>

      {/* Center - Undo and Shuffle Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "16px",
          flex: 1,
        }}
      >
        <button
          className="btn-secondary"
          onClick={undoShuffle}
          disabled={pastSeats.length === 0 || isShuffling}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "48px",
            height: "48px",
            borderRadius: "var(--radius-full)",
            opacity: pastSeats.length === 0 || isShuffling ? 0.5 : 1,
            cursor:
              pastSeats.length === 0 || isShuffling ? "not-allowed" : "pointer",
            border: "1px solid var(--c-border)",
            backgroundColor: "var(--c-surface)",
          }}
          title="一つ前の配置に戻す"
        >
          <Undo2 size={20} />
        </button>

        <button
          id="btn-footer-shuffle"
          className="btn-primary"
          onClick={handleShuffle}
          disabled={isShuffling}
          style={{
            gap: "8px",
            padding: "12px 32px",
            fontSize: "18px",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-2)",
            opacity: isShuffling ? 0.7 : 1,
            cursor: isShuffling ? "not-allowed" : "pointer",
          }}
        >
          <Shuffle size={20} />{" "}
          {isShuffling ? "シャッフル中..." : "シャッフル実行"}
        </button>
      </div>

      {/* Right side - Mode Toggle */}
      <div style={{ display: "flex", justifyContent: "flex-end", flex: 1 }}>
        <button
          id="btn-footer-viewmode"
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
