import React, { useRef } from "react";
import { Settings, Download, Upload, Sprout, Heart } from "lucide-react";
import { useCsvSettings } from "../../hooks/useCsvSettings";
import Input from "../ui/Input";
import { useStore } from "../../stores";
import { useOnboardingStore } from "../../stores/onboarding";
import { useDonationStore } from "../../stores/donation";

interface HeaderProps {
  showSettings: boolean;
  onToggleSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ showSettings, onToggleSettings }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isViewMode = useStore((state) => state.isViewMode);
  const openGuideHub = useOnboardingStore((state) => state.openGuideHub);
  const openDonationModal = useDonationStore(
    (state) => state.openDonationModal,
  );
  const hasDonated = useDonationStore((state) => state.hasDonated());

  const { handleSave, handleLoad } = useCsvSettings();

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 var(--spacing-lg)",
        height: "60px",
        backgroundColor: "var(--c-surface)",
        borderBottom: "1px solid var(--c-border)",
        boxShadow: "var(--shadow-1)",
        zIndex: 10,
        flexShrink: 0,
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--spacing-sm)",
        }}
      >
        <span style={{ fontSize: "1.5rem" }}>🪑</span>
        <h1 className="text-title1" style={{ fontSize: "1.25rem", margin: 0 }}>
          ラクガエ
        </h1>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--spacing-md)",
        }}
      >
        <button
          id="header-donation-btn"
          className="btn-secondary"
          style={{
            gap: "6px",
            backgroundColor: "#fff1f2",
            borderColor: "#fecdd3",
            color: "#e11d48",
            fontWeight: 700,
          }}
          onClick={() => openDonationModal()}
          title="開発者を応援・寄付する"
        >
          <Heart
            size={16}
            fill="#fda4af"
            color="#e11d48"
            style={{ marginTop: "-1px" }}
          />
          {hasDonated ? "応援・寄付 ✨" : "寄付で応援"}
        </button>

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
