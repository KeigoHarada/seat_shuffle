import React from "react";
import { Settings, Sprout } from "lucide-react";
import { useCompactLayout } from "../../hooks/useCompactLayout";
import Logo from "../../components/ui/Logo";
import { useStore } from "../../stores";
import { useOnboardingStore } from "../../stores/onboarding";

interface HeaderProps {
  showSettings: boolean;
  onToggleSettings: () => void;
}

const DesktopHeader: React.FC<HeaderProps> = ({
  showSettings,
  onToggleSettings,
}) => {
  const isCompact = useCompactLayout();
  const isViewMode = useStore((state) => state.isViewMode);
  const openGuideHub = useOnboardingStore((state) => state.openGuideHub);

  return (
    <header className="app-header">
      <Logo size={isCompact ? "sm" : "md"} />

      <div className="app-header-actions">
        <button
          id="header-guide-btn"
          className="btn-secondary"
          style={{
            gap: "6px",
            backgroundColor: "var(--c-primary-pale)",
            borderColor: "var(--c-primary)",
            color: "var(--c-primary-hover)",
            fontWeight: 700,
          }}
          onClick={() => openGuideHub("tour")}
          title="操作ガイド・ツアーを見る"
          aria-label="はじめてガイド"
        >
          <Sprout size={16} style={{ marginTop: "-1px" }} />
          <span className="app-chrome-label">はじめてガイド</span>
        </button>

        <div className="app-header-divider" />

        {!isViewMode && (
          <button
            id="btn-header-settings"
            className={showSettings ? "btn-primary" : "btn-secondary"}
            onClick={onToggleSettings}
            style={{ gap: "4px" }}
            title="設定パネルの表示/非表示"
            aria-label="設定"
          >
            <Settings size={16} />
            <span className="app-chrome-label">設定</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default DesktopHeader;
