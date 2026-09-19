import React, { useState } from "react";
import { Eye, PenLine, Printer, Shuffle, Undo2 } from "lucide-react";
import { useUiStore } from "../stores/uiStore";
import { usePrintSessionStore } from "../stores/printSession";
import LegalModal from "../components/legal/LegalModal";
import { useShuffle } from "./hooks/useShuffle";

const ViewModeToggle: React.FC = () => {
  const isViewMode = useUiStore((state) => state.isViewMode);
  const setIsViewMode = useUiStore((state) => state.setIsViewMode);

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

const Footer: React.FC = () => {
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const { handleShuffle, undo, isShuffling, canUndo } = useShuffle();
  const openPrintDialog = usePrintSessionStore(
    (state) => state.openPrintDialog,
  );

  return (
    <footer className="app-footer">
      <div className="app-footer-cluster app-footer-cluster-start">
        <button
          type="button"
          className="app-legal-link"
          onClick={() => setIsLegalModalOpen(true)}
        >
          利用規約・免責事項
        </button>
        <button
          className="btn-secondary shuffle-undo"
          onClick={undo}
          disabled={!canUndo}
          type="button"
          title="一つ前の配置に戻す"
          aria-label="一つ前の配置に戻す"
        >
          <Undo2 size={20} />
        </button>
        <button
          type="button"
          id="btn-footer-print"
          className="btn-secondary footer-print"
          onClick={openPrintDialog}
          title="座席表を印刷"
          aria-label="印刷"
        >
          <Printer size={20} />
          <span className="app-chrome-label">印刷</span>
        </button>
      </div>
      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
      />
      <div className="app-footer-cluster app-footer-cluster-center">
        <button
          id="btn-footer-shuffle"
          className="btn-primary shuffle-run"
          onClick={handleShuffle}
          disabled={isShuffling}
          type="button"
        >
          <Shuffle size={20} />
          <span className="shuffle-run-label">
            {isShuffling ? "シャッフル中..." : "シャッフル実行"}
          </span>
        </button>
      </div>
      <div className="app-footer-cluster app-footer-cluster-end">
        <ViewModeToggle />
      </div>
    </footer>
  );
};

export default Footer;
