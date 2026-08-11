import React from "react";
import { AlertCircle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "削除する",
  cancelText = "キャンセル",
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(2px)",
      }}
      onClick={onCancel}
    >
      <div
        className="card"
        style={{
          width: "320px",
          padding: "var(--spacing-lg)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-md)",
          boxShadow: "var(--shadow-3)",
          animation: "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-sm)",
            color: "var(--c-error)",
          }}
        >
          <AlertCircle size={20} />
          <h3
            className="text-title3"
            style={{ margin: 0, color: "var(--c-text-main)" }}
          >
            {title}
          </h3>
        </div>

        <p className="text-body" style={{ color: "var(--c-text-sub)" }}>
          {message}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "var(--spacing-sm)",
            marginTop: "var(--spacing-sm)",
          }}
        >
          <button className="btn-secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            className="btn-danger"
            style={{
              backgroundColor: "var(--c-error)",
              color: "white",
              padding: "8px 16px",
              borderRadius: "var(--radius-md)",
              border: "none",
              fontWeight: 700,
              cursor: "pointer",
            }}
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
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ConfirmDialog;
