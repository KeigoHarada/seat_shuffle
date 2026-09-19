import React from "react";
import { AlertCircle, X } from "lucide-react";
import { useOnboardingStore } from "../../stores/onboarding";

const ResetConfirmModal: React.FC = () => {
  const isOpen = useOnboardingStore((state) => state.isResetConfirmOpen);
  const closeResetConfirm = useOnboardingStore(
    (state) => state.closeResetConfirm,
  );
  const confirmStartTourWithDefaultData = useOnboardingStore(
    (state) => state.confirmStartTourWithDefaultData,
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={closeResetConfirm}>
      <div
        className="modal-content"
        style={{
          maxWidth: "420px",
          padding: "24px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeResetConfirm}
          className="modal-close-btn"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
          }}
          title="閉じる"
        >
          <X size={18} />
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "14px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--c-primary-pale)",
              color: "var(--c-primary-hover)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <AlertCircle size={20} />
          </div>
          <h3
            className="text-title2"
            style={{ margin: 0, fontSize: "17px", color: "var(--c-text-main)" }}
          >
            ガイドの開始方法を選択
          </h3>
        </div>

        <p
          style={{
            fontSize: "13px",
            color: "var(--c-text-sub)",
            lineHeight: 1.6,
            margin: "0 0 20px 0",
          }}
        >
          現在編集中のデータが存在します。
          <br />
          ガイド用のデータを読み込んでツアーを開始しますか？
          <br />
          <span
            style={{
              color: "var(--c-danger)",
              fontSize: "12px",
              fontWeight: 500,
            }}
          >
            ※現在のデータは上書きされるためご注意ください。
          </span>
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <button
            className="btn-primary"
            onClick={confirmStartTourWithDefaultData}
            style={{
              justifyContent: "center",
              padding: "10px 16px",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            ガイド用のデータで開始
          </button>
          <button
            className="btn-secondary"
            onClick={closeResetConfirm}
            style={{
              justifyContent: "center",
              padding: "8px 16px",
              fontSize: "12px",
              color: "var(--c-text-sub)",
              border: "none",
              background: "transparent",
            }}
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetConfirmModal;
