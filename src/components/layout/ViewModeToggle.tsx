import React from "react";
import { Eye, PenLine } from "lucide-react";
import { useStore } from "../../stores";

interface ViewModeToggleProps {
  compact?: boolean;
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ compact = false }) => {
  const isViewMode = useStore((state) => state.isViewMode);
  const setIsViewMode = useStore((state) => state.setIsViewMode);

  return (
    <button
      id="btn-footer-viewmode"
      className={compact ? "view-mode-toggle compact" : "view-mode-toggle"}
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
        <PenLine size={compact ? 14 : 16} /> 編集
      </div>
      <div
        className="view-mode-toggle-label"
        style={{
          color: isViewMode ? "var(--c-text-main)" : "var(--c-text-sub)",
        }}
      >
        <Eye size={compact ? 14 : 16} /> 閲覧
      </div>
    </button>
  );
};

export default ViewModeToggle;
