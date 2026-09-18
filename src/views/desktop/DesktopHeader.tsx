import React, { useEffect, useRef, useState } from "react";
import { Archive, Settings, Sprout, Upload } from "lucide-react";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Input from "../../components/ui/Input";
import Logo from "../../components/ui/Logo";
import { useCompactLayout } from "../../hooks/useCompactLayout";
import {
  ROSTER_CSV_EXPLAIN,
  ROSTER_IMPORT_CONFIRM,
  useProjectIo,
} from "../../hooks/useProjectIo";
import { useOnboardingStore } from "../../stores/onboarding";
import { useStore } from "../../stores";
import type { RosterParseOk } from "../../utils/roster";

interface HeaderProps {
  showSettings: boolean;
  onToggleSettings: () => void;
}

type HeaderIo =
  | { type: "idle" }
  | { type: "roster-explain" }
  | { type: "roster-confirm"; parsed: RosterParseOk }
  | { type: "backup-menu" };

const DesktopHeader: React.FC<HeaderProps> = ({
  showSettings,
  onToggleSettings,
}) => {
  const isCompact = useCompactLayout();
  const isViewMode = useStore((state) => state.isViewMode);
  const openGuideHub = useOnboardingStore((state) => state.openGuideHub);
  const rosterInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);
  const backupWrapRef = useRef<HTMLDivElement>(null);
  const [io, setIo] = useState<HeaderIo>({ type: "idle" });
  const { handleRosterFile, handleSaveBackup, handleLoadBackup, importRoster } =
    useProjectIo();

  useEffect(() => {
    const handleOutsideClick = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Element &&
        backupWrapRef.current?.contains(target)
      ) {
        return;
      }
      setIo((current) =>
        current.type === "backup-menu" ? { type: "idle" } : current,
      );
    };
    if (io.type === "backup-menu") {
      window.addEventListener("pointerdown", handleOutsideClick);
    }
    return () => window.removeEventListener("pointerdown", handleOutsideClick);
  }, [io.type]);

  return (
    <header className="app-header">
      <Logo size={isCompact ? "sm" : "md"} />

      <div className="app-header-actions">
        <button
          type="button"
          id="btn-header-roster"
          className="btn-secondary"
          style={{ gap: "4px" }}
          onClick={() => setIo({ type: "roster-explain" })}
          title="名簿を取り込む"
          aria-label="名簿を取り込む"
        >
          <Upload size={16} />
          <span className="app-chrome-label">名簿を取り込む</span>
        </button>

        <div className="app-header-menu-wrap" ref={backupWrapRef}>
          <button
            type="button"
            id="btn-header-backup"
            className={
              io.type === "backup-menu" ? "btn-primary" : "btn-secondary"
            }
            style={{ gap: "4px" }}
            onClick={() =>
              setIo((current) =>
                current.type === "backup-menu"
                  ? { type: "idle" }
                  : { type: "backup-menu" },
              )
            }
            title="バックアップ"
            aria-label="バックアップ"
            aria-expanded={io.type === "backup-menu"}
          >
            <Archive size={16} />
            <span className="app-chrome-label">バックアップ</span>
          </button>
          {io.type === "backup-menu" && (
            <div className="app-header-menu">
              <button
                type="button"
                id="btn-header-backup-save"
                className="app-header-menu-item"
                onClick={() => {
                  handleSaveBackup();
                  setIo({ type: "idle" });
                }}
              >
                保存
              </button>
              <button
                type="button"
                id="btn-header-backup-load"
                className="app-header-menu-item"
                onClick={() => {
                  backupInputRef.current?.click();
                  setIo({ type: "idle" });
                }}
              >
                読み込み
              </button>
            </div>
          )}
        </div>

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
        accept=".csv,text/csv"
        id="btn-header-roster-file"
        ref={rosterInputRef}
        style={{ display: "none" }}
        onChange={(e) =>
          handleRosterFile(e, (parsed) =>
            setIo({ type: "roster-confirm", parsed }),
          )
        }
      />
      <Input
        type="file"
        id="btn-header-backup-file"
        ref={backupInputRef}
        style={{ display: "none" }}
        onChange={handleLoadBackup}
      />

      <ConfirmDialog
        isOpen={io.type === "roster-explain"}
        title="名簿を取り込む"
        message={ROSTER_CSV_EXPLAIN}
        confirmText="読み込む"
        cancelText="キャンセル"
        variant="primary"
        onConfirm={() => rosterInputRef.current?.click()}
        onCancel={() => setIo({ type: "idle" })}
      />
      <ConfirmDialog
        isOpen={io.type === "roster-confirm"}
        title="名簿の取り込み"
        message={ROSTER_IMPORT_CONFIRM}
        confirmText="取り込む"
        cancelText="キャンセル"
        variant="warning"
        onConfirm={() => {
          if (io.type === "roster-confirm") importRoster(io.parsed);
        }}
        onCancel={() => setIo({ type: "idle" })}
      />
    </header>
  );
};

export default DesktopHeader;
