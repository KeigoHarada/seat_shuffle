import React from "react";
import { Sparkles, HelpCircle, Check, PartyPopper, X } from "lucide-react";
import { useOnboardingStore } from "../../stores/onboarding";

export const TourCompletionModal: React.FC = () => {
  const isOpen = useOnboardingStore((state) => state.isCompletionModalOpen);
  const closeCompletionModal = useOnboardingStore(
    (state) => state.closeCompletionModal,
  );
  const openGuideHub = useOnboardingStore((state) => state.openGuideHub);

  if (!isOpen) return null;

  const handleOpenGuide = () => {
    closeCompletionModal();
    openGuideHub("move_seats");
  };

  return (
    <div className="modal-overlay" onClick={closeCompletionModal}>
      <div
        className="modal-content"
        style={{
          maxWidth: "440px",
          textAlign: "center",
          padding: "32px 24px 24px 24px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeCompletionModal}
          className="modal-close-btn"
          style={{
            position: "absolute",
            top: "14px",
            right: "14px",
          }}
          title="閉じる"
        >
          <X size={20} />
        </button>
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--c-primary-pale)",
            color: "var(--c-primary-hover)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
            boxShadow: "0 0 16px rgba(245, 158, 11, 0.3)",
          }}
        >
          <Sparkles size={28} />
        </div>

        <h2
          className="text-title1"
          style={{
            fontSize: "20px",
            margin: "0 0 8px 0",
            color: "var(--c-text-main)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
          }}
        >
          ツアー完了！準備完了です <PartyPopper size={20} />
        </h2>

        <p
          style={{
            fontSize: "13px",
            color: "var(--c-text-sub)",
            lineHeight: 1.6,
            margin: "0 0 24px 0",
          }}
        >
          基本的な操作の流れをマスターしました！
          <br />
          生徒名簿の編集や、グループ・条件の追加など、自由に席替えをお試しください。
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <button
            className="btn-primary"
            onClick={closeCompletionModal}
            style={{
              justifyContent: "center",
              padding: "12px 20px",
              fontSize: "14px",
              fontWeight: 700,
              gap: "6px",
            }}
          >
            <Check size={18} /> さっそく使ってみる
          </button>

          <button
            className="btn-secondary"
            onClick={handleOpenGuide}
            style={{
              justifyContent: "center",
              padding: "10px 16px",
              fontSize: "13px",
              gap: "6px",
            }}
          >
            <HelpCircle size={16} /> 各種操作ガイドを見る
          </button>
        </div>
      </div>
    </div>
  );
};

export default TourCompletionModal;
