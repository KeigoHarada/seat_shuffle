import React from "react";
import { Eye, PenLine } from "lucide-react";
import { useStore } from "../../stores";

const PhoneViewModeToggle: React.FC = () => {
  const isViewMode = useStore((state) => state.isViewMode);
  const setIsViewMode = useStore((state) => state.setIsViewMode);

  return (
    <div className="phone-view-toggle" role="group" aria-label="表示モード">
      <button
        id="btn-phone-viewmode"
        type="button"
        className={
          isViewMode ? "phone-view-toggle-btn" : "phone-view-toggle-btn on"
        }
        aria-pressed={!isViewMode}
        onClick={() => setIsViewMode(false)}
      >
        <PenLine size={14} />
        編集
      </button>
      <button
        id="btn-phone-viewmode-view"
        type="button"
        className={
          isViewMode ? "phone-view-toggle-btn on" : "phone-view-toggle-btn"
        }
        aria-pressed={isViewMode}
        onClick={() => setIsViewMode(true)}
      >
        <Eye size={14} />
        閲覧
      </button>
    </div>
  );
};

export default PhoneViewModeToggle;
