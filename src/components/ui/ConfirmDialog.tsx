import React from "react";
import { createPortal } from "react-dom";
import { AlertCircle, AlertTriangle, RotateCcw } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary" | "warning";
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "実行する",
  cancelText = "キャンセル",
  variant = "danger",
}) => {
  if (!isOpen) return null;

  const isDanger = variant === "danger";

  const getIcon = () => {
    switch (variant) {
      case "danger":
        return (
          <AlertCircle
            size={22}
            style={{ color: "var(--c-error)", flexShrink: 0 }}
          />
        );
      case "warning":
        return (
          <AlertTriangle
            size={22}
            style={{ color: "var(--c-primary)", flexShrink: 0 }}
          />
        );
      case "primary":
      default:
        return (
          <RotateCcw
            size={22}
            style={{ color: "var(--c-primary)", flexShrink: 0 }}
          />
        );
    }
  };

  return createPortal(
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content"
        style={{
          width: "100%",
          maxWidth: "380px",
          padding: "var(--spacing-lg)",
          gap: "var(--spacing-md)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-sm)",
          }}
        >
          {getIcon()}
          <h3
            className="text-title3"
            style={{ margin: 0, color: "var(--c-text-main)" }}
          >
            {title}
          </h3>
        </div>

        <p
          className="text-body"
          style={{
            color: "var(--c-text-sub)",
            lineHeight: 1.6,
            fontSize: "14px",
          }}
        >
          {message}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "var(--spacing-sm)",
            marginTop: "var(--spacing-xs)",
          }}
        >
          <button type="button" className="btn-secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            type="button"
            className={isDanger ? "btn-danger" : "btn-primary"}
            onClick={() => {
              onConfirm();
              onCancel();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ConfirmDialog;
