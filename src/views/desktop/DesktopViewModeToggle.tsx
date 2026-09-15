import React from "react";
import { Eye, PenLine } from "lucide-react";
import { useStore } from "../../stores";

const DesktopViewModeToggle: React.FC = () => {
  const isViewMode = useStore((state) => state.isViewMode);
  const setIsViewMode = useStore((state) => state.setIsViewMode);

  return (
    <button
      id="btn-footer-viewmode"
      className="view-mode-toggle"
      onClick={() => setIsViewMode(!isViewMode)}
      type="button"
      aria-label="編集と閲覧の切り替え"
    >
      <div
        className="view-mode-toggle-knob"
        style={{ left: isViewMode ? "50%" : "4px" }}
      />
      <div
        className="view-mode-toggle-label"
        style={{
          color: !isViewMode ? "var(--c-text-main)" : "var(--c-text-sub)",
        }}
      >
        <PenLine size={16} />
        <span className="app-chrome-label">編集</span>
      </div>
      <div
        className="view-mode-toggle-label"
        style={{
          color: isViewMode ? "var(--c-text-main)" : "var(--c-text-sub)",
        }}
      >
        <Eye size={16} />
        <span className="app-chrome-label">閲覧</span>
      </div>
    </button>
  );
};

export default DesktopViewModeToggle;
