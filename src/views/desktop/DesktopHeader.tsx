import React, { useRef } from "react";
import { Settings, Download, Upload, Sprout } from "lucide-react";
import { useCsvSettings } from "../../hooks/useCsvSettings";
import { useCompactLayout } from "../../hooks/useCompactLayout";
import Input from "../../components/ui/Input";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isCompact = useCompactLayout();
  const isViewMode = useStore((state) => state.isViewMode);
  const openGuideHub = useOnboardingStore((state) => state.openGuideHub);

  const { handleSave, handleLoad } = useCsvSettings();

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

        <Input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleLoad}
        />
        <button
          className="btn-secondary"
          style={{ gap: "4px" }}
          onClick={() => fileInputRef.current?.click()}
          aria-label="読み込み"
        >
          <Upload size={16} />
          <span className="app-chrome-label">読み込み</span>
        </button>
        <button
          className="btn-secondary"
          style={{ gap: "4px" }}
          onClick={handleSave}
          aria-label="保存"
        >
          <Download size={16} />
          <span className="app-chrome-label">保存</span>
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
