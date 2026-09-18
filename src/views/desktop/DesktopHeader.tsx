import React, { useRef, useState } from "react";
import { Download, Settings, Sprout, Upload } from "lucide-react";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Input from "../../components/ui/Input";
import Logo from "../../components/ui/Logo";
import { useCompactLayout } from "../../hooks/useCompactLayout";
import {
  BACKUP_EXPORT_EXPLAIN,
  BACKUP_IMPORT_EXPLAIN,
  useProjectIo,
} from "../../hooks/useProjectIo";
import { useOnboardingStore } from "../../stores/onboarding";
import { useStore } from "../../stores";

interface HeaderProps {
  showSettings: boolean;
  onToggleSettings: () => void;
}

type HeaderIo = "idle" | "import-explain" | "export-explain";

const DesktopHeader: React.FC<HeaderProps> = ({
  showSettings,
  onToggleSettings,
}) => {
  const isCompact = useCompactLayout();
  const isViewMode = useStore((state) => state.isViewMode);
  const openGuideHub = useOnboardingStore((state) => state.openGuideHub);
  const backupInputRef = useRef<HTMLInputElement>(null);
  const [io, setIo] = useState<HeaderIo>("idle");
  const { handleSaveBackup, handleLoadBackup } = useProjectIo();

  return (
    <header className="app-header">
      <Logo size={isCompact ? "sm" : "md"} />

      <div className="app-header-actions">
        <button
          type="button"
          id="btn-header-import"
          className="btn-secondary"
          style={{ gap: "4px" }}
          onClick={() => setIo("import-explain")}
          title="インポート"
          aria-label="インポート"
        >
          <Upload size={16} />
          <span className="app-chrome-label">インポート</span>
        </button>

        <button
          type="button"
          id="btn-header-export"
          className="btn-secondary"
          style={{ gap: "4px" }}
          onClick={() => setIo("export-explain")}
          title="エクスポート"
          aria-label="エクスポート"
        >
          <Download size={16} />
          <span className="app-chrome-label">エクスポート</span>
        </button>

        <div className="app-header-divider" />

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

      <Input
        type="file"
        id="btn-header-backup-file"
        ref={backupInputRef}
        style={{ display: "none" }}
        onChange={handleLoadBackup}
      />

      <ConfirmDialog
        isOpen={io === "import-explain"}
        title="インポート"
        message={BACKUP_IMPORT_EXPLAIN}
        confirmText="読み込む"
        cancelText="キャンセル"
        variant="primary"
        onConfirm={() => backupInputRef.current?.click()}
        onCancel={() => setIo("idle")}
      />
      <ConfirmDialog
        isOpen={io === "export-explain"}
        title="エクスポート"
        message={BACKUP_EXPORT_EXPLAIN}
        confirmText="保存"
        cancelText="キャンセル"
        variant="primary"
        onConfirm={handleSaveBackup}
        onCancel={() => setIo("idle")}
      />
    </header>
  );
};

export default DesktopHeader;
