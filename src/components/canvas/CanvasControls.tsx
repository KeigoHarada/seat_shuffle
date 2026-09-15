import React from "react";

interface Props {
  scale: number;
  onResetView: () => void;
}

const CanvasControls: React.FC<Props> = ({ scale, onResetView }) => {
  return (
    <div
      className="app-canvas-controls"
      onPointerDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <div className="app-canvas-controls-scale">
        {Math.round(scale * 100)}%
      </div>
      <div className="app-canvas-controls-divider" />
      <button
        type="button"
        className="app-canvas-controls-reset"
        onClick={onResetView}
        title="位置とズームを初期状態に戻す"
      >
        表示リセット
      </button>
    </div>
  );
};

export default CanvasControls;
