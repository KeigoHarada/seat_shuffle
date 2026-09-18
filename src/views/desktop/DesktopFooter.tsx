import React, { useState } from "react";
import { Printer, Shuffle, Undo2 } from "lucide-react";
import LegalModal from "../../components/ui/LegalModal";
import { useShuffle } from "../../hooks/useShuffle";
import DesktopViewModeToggle from "./DesktopViewModeToggle";

const DesktopFooter: React.FC = () => {
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const { handleShuffle, undo, isShuffling, canUndo } = useShuffle();

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
          onClick={() => window.print()}
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
        <DesktopViewModeToggle />
      </div>
    </footer>
  );
};

export default DesktopFooter;
