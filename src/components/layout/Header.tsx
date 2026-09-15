import React, { useRef } from "react";
import { Settings, Download, Upload, Sprout } from "lucide-react";
import { useCsvSettings } from "../../hooks/useCsvSettings";
import Input from "../ui/Input";
import Logo from "../ui/Logo";
import { useStore } from "../../stores";
import { useOnboardingStore } from "../../stores/onboarding";

interface HeaderProps {
  showSettings: boolean;
  onToggleSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ showSettings, onToggleSettings }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isViewMode = useStore((state) => state.isViewMode);
  const openGuideHub = useOnboardingStore((state) => state.openGuideHub);

  const { handleSave, handleLoad } = useCsvSettings();

  return (
    <header className="app-header">
      <Logo size="md" />

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
        >
          <Sprout size={16} style={{ marginTop: "-1px" }} /> はじめてガイド
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
        >
          <Upload size={16} /> 読み込み
        </button>
        <button
          className="btn-secondary"
          style={{ gap: "4px" }}
          onClick={handleSave}
        >
          <Download size={16} /> 保存
        </button>

        <div
          style={{
            width: "1px",
            height: "24px",
            backgroundColor: "var(--c-border)",
            margin: "0 var(--spacing-xs)",
          }}
        ></div>

        {!isViewMode && (
          <button
            id="btn-header-settings"
            className={showSettings ? "btn-primary" : "btn-secondary"}
            onClick={onToggleSettings}
            style={{ gap: "4px" }}
            title="設定パネルの表示/非表示"
          >
            <Settings size={16} /> 設定
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
