import React from "react";
import { Shuffle, Eye, PenLine } from "lucide-react";
import { useStore } from "../../stores";

const Footer: React.FC = () => {
  const isViewMode = useStore((state) => state.isViewMode);
  const setIsViewMode = useStore((state) => state.setIsViewMode);

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
