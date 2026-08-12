import React from "react";
import { useToastStore } from "../../stores/toast";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "24px",
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pointerEvents: "none",
        gap: "8px",
        zIndex: 9999,
      }}
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isError = toast.type === "error";

        const bgColor = isSuccess ? "#ecfdf5" : isError ? "#fef2f2" : "#eff6ff";
        const textColor = isSuccess
          ? "#059669"
          : isError
            ? "#dc2626"
            : "#2563eb";
        const borderColor = isSuccess
          ? "#a7f3d0"
          : isError
            ? "#fecaca"
            : "#bfdbfe";

        return (
          <div
            key={toast.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              backgroundColor: bgColor,
              color: textColor,
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-lg)",
              border: `1px solid ${borderColor}`,
              minWidth: "250px",
              pointerEvents: "auto",
              animation: "slideDown 0.3s cubic-bezier(0.2, 0, 0, 1)",
            }}
          >
            {isSuccess && <CheckCircle2 size={20} />}
            {isError && <AlertCircle size={20} />}
            {!isSuccess && !isError && <Info size={20} />}

            <span style={{ flex: 1, fontSize: "0.875rem", fontWeight: 700 }}>
              {toast.message}
            </span>

            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: "none",
                border: "none",
                color: textColor,
                opacity: 0.7,
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
      <style>
        {`
          @keyframes slideDown {
            from {
              transform: translateY(-100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};
