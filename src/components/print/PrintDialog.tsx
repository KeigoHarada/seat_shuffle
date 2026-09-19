import React from "react";
import { createPortal } from "react-dom";
import { printOrientationLabel } from "../../services/printLayout";
import type { PrintMode, PrintOrientation } from "../../types/print";

interface PrintDialogProps {
  draftMode: PrintMode;
  draftOrientation: PrintOrientation;
  onChangeMode: (mode: PrintMode) => void;
  onChangeOrientation: (orientation: PrintOrientation) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const PrintDialog: React.FC<PrintDialogProps> = ({
  draftMode,
  draftOrientation,
  onChangeMode,
  onChangeOrientation,
  onConfirm,
  onCancel,
}) => {
  const host = document.querySelector("[data-screen-root]") ?? document.body;

  return createPortal(
    <div className="modal-overlay" onClick={onCancel}>
      <div
        id="print-dialog"
        className="modal-content"
        role="dialog"
        aria-labelledby="print-dialog-title"
        style={{
          width: "100%",
          maxWidth: "380px",
          padding: "var(--spacing-lg)",
          gap: "var(--spacing-md)",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <h3
          id="print-dialog-title"
          className="text-title3"
          style={{ margin: 0, color: "var(--c-text-main)" }}
        >
          印刷設定
        </h3>
        <fieldset
          style={{
            border: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-sm)",
          }}
        >
          <legend className="text-body" style={{ color: "var(--c-text-sub)" }}>
            用途
          </legend>
          <label className="print-mode-option" htmlFor="print-mode-wall">
            <input
              id="print-mode-wall"
              type="radio"
              name="print-mode"
              checked={draftMode === "wall"}
              onChange={() => onChangeMode("wall")}
            />
            掲示用（文字を正立）
          </label>
          <label className="print-mode-option" htmlFor="print-mode-desk">
            <input
              id="print-mode-desk"
              type="radio"
              name="print-mode"
              checked={draftMode === "desk"}
              onChange={() => onChangeMode("desk")}
            />
            机上確認用（文字を 180° 回転）
          </label>
        </fieldset>
        <fieldset
          id="print-orientation"
          style={{
            border: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-sm)",
          }}
        >
          <legend className="text-body" style={{ color: "var(--c-text-sub)" }}>
            用紙
          </legend>
          <label
            className="print-mode-option"
            htmlFor="print-orientation-landscape"
          >
            <input
              id="print-orientation-landscape"
              type="radio"
              name="print-orientation"
              checked={draftOrientation === "landscape"}
              onChange={() => onChangeOrientation("landscape")}
            />
            {printOrientationLabel("landscape")}
          </label>
          <label
            className="print-mode-option"
            htmlFor="print-orientation-portrait"
          >
            <input
              id="print-orientation-portrait"
              type="radio"
              name="print-orientation"
              checked={draftOrientation === "portrait"}
              onChange={() => onChangeOrientation("portrait")}
            />
            {printOrientationLabel("portrait")}
          </label>
        </fieldset>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "var(--spacing-sm)",
            marginTop: "var(--spacing-xs)",
          }}
        >
          <button
            id="btn-print-cancel"
            type="button"
            className="btn-secondary"
            onClick={onCancel}
          >
            キャンセル
          </button>
          <button
            id="btn-print-confirm"
            type="button"
            className="btn-primary"
            onClick={onConfirm}
          >
            印刷する
          </button>
        </div>
      </div>
    </div>,
    host,
  );
};

export default PrintDialog;
