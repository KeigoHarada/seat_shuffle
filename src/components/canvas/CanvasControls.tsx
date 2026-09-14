import React from "react";

interface Props {
  scale: number;
  onResetView: () => void;
}

const CanvasControls: React.FC<Props> = ({ scale, onResetView }) => {
  return (
    <div
      className="app-canvas-controls"
      style={{
        position: "absolute",
        bottom: 24,
        left: 24,
        display: "flex",
        alignItems: "center",
        backgroundColor: "var(--c-surface)",
        border: "1px solid var(--c-border)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-1)",
        padding: "6px 12px",
        gap: 12,
        zIndex: 100,
        userSelect: "none",
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: "var(--c-text-main)",
          minWidth: 48,
          textAlign: "center",
        }}
      >
        {Math.round(scale * 100)}%
      </div>
      <div
        style={{ width: 1, height: 16, backgroundColor: "var(--c-border)" }}
      />
      <button
        onClick={onResetView}
        style={{
          background: "none",
          border: "none",
          color: "var(--c-text-sub)",
          fontSize: 14,
          cursor: "pointer",
          padding: "4px 8px",
          borderRadius: "4px",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--c-surface-disabled)";
          e.currentTarget.style.color = "var(--c-text-main)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "var(--c-text-sub)";
        }}
        title="位置とズームを初期状態に戻す"
      >
        表示リセット
      </button>
    </div>
  );
};

export default CanvasControls;
