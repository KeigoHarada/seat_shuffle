import React from "react";
import { Shuffle, Undo2 } from "lucide-react";
import { useShuffle } from "../../hooks/useShuffle";
import PhoneViewModeToggle from "./PhoneViewModeToggle";

const PhoneShuffleBar: React.FC = () => {
  const { handleShuffle, undoShuffle, isShuffling, canUndo } = useShuffle();

  return (
    <div className="phone-shuffle-bar">
      <button
        className="phone-shuffle-undo"
        onClick={undoShuffle}
        disabled={!canUndo}
        type="button"
        aria-label="一つ前の配置に戻す"
        title="一つ前の配置に戻す"
      >
        <Undo2 size={20} />
      </button>
      <button
        id="btn-phone-shuffle"
        className="phone-shuffle-run"
        onClick={handleShuffle}
        disabled={isShuffling}
        type="button"
      >
        <Shuffle size={18} />
        {isShuffling ? "シャッフル中..." : "シャッフル実行"}
      </button>
      <PhoneViewModeToggle />
    </div>
  );
};

export default PhoneShuffleBar;
