import React from "react";
import { Shuffle, Undo2 } from "lucide-react";
import { useShuffle } from "../../hooks/useShuffle";

interface ShuffleControlsProps {
  layout: "footer" | "phone";
}

const ShuffleControls: React.FC<ShuffleControlsProps> = ({ layout }) => {
  const { handleShuffle, undoShuffle, isShuffling, canUndo } = useShuffle();

  return (
    <div
      className={
        layout === "phone"
          ? "shuffle-controls shuffle-controls-phone"
          : "shuffle-controls"
      }
    >
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
  );
};

export default ShuffleControls;
