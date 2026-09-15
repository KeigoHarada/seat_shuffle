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
        <PenLine size={16} /> 編集
      </div>
      <div
        className="view-mode-toggle-label"
        style={{
          color: isViewMode ? "var(--c-text-main)" : "var(--c-text-sub)",
        }}
      >
        <Eye size={16} /> 閲覧
      </div>
    </button>
  );
};

export default DesktopViewModeToggle;
