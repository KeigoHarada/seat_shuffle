import React, { useState } from "react";
import { Shuffle, Undo2 } from "lucide-react";
import LegalModal from "../../components/ui/LegalModal";
import { useShuffle } from "../../hooks/useShuffle";
import DesktopViewModeToggle from "./DesktopViewModeToggle";

const DesktopFooter: React.FC = () => {
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const { handleShuffle, undoShuffle, isShuffling, canUndo } = useShuffle();

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
      </div>
      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
      />
      <div className="app-footer-cluster app-footer-cluster-center">
        <div className="shuffle-controls">
          <button
            className="btn-secondary shuffle-undo"
            onClick={undoShuffle}
            disabled={!canUndo}
            type="button"
            title="一つ前の配置に戻す"
          >
            <Undo2 size={20} />
          </button>
          <button
            id="btn-footer-shuffle"
            className="btn-primary shuffle-run"
            onClick={handleShuffle}
            disabled={isShuffling}
            type="button"
          >
            <Shuffle size={20} />{" "}
            {isShuffling ? "シャッフル中..." : "シャッフル実行"}
          </button>
        </div>
      </div>
      <div className="app-footer-cluster app-footer-cluster-end">
        <DesktopViewModeToggle />
      </div>
    </footer>
  );
};

export default DesktopFooter;
