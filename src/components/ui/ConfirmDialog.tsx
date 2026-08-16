import React from "react";
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

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(15, 23, 42, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(4px)",
        padding: "var(--spacing-md)",
      }}
      onClick={onCancel}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "380px",
          padding: "var(--spacing-lg)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-md)",
          boxShadow: "var(--shadow-3)",
          animation: "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          backgroundColor: "var(--c-surface)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--c-border)",
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
      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ConfirmDialog;
