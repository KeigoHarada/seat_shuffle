import React from "react";
import { X, Shield, Zap, Lock, Sparkles } from "lucide-react";
import { BrandSymbol } from "../ui/Logo";
import { useOnboardingStore } from "../../stores/onboarding";

export const WelcomeModal: React.FC = () => {
  const isOpen = useOnboardingStore((state) => state.isWelcomeModalOpen);
  const closeWelcomeModal = useOnboardingStore(
    (state) => state.closeWelcomeModal,
  );
  const startTour = useOnboardingStore((state) => state.startTour);
  const setHasCompletedOnboarding = useOnboardingStore(
    (state) => state.setHasCompletedOnboarding,
  );

  if (!isOpen) return null;

  const handleStartTour = () => {
    startTour(0);
  };

  const handleSkip = () => {
    setHasCompletedOnboarding(true);
    closeWelcomeModal();
  };

  return (
    <div className="modal-overlay" onClick={handleSkip}>
      <div
        className="modal-content"
        style={{
          maxWidth: "480px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div
          style={{
            background:
              "linear-gradient(135deg, var(--c-primary-pale) 0%, #fff7ed 100%)",
            padding: "28px 24px 20px 24px",
            borderBottom: "1px solid var(--c-border)",
            textAlign: "center",
            position: "relative",
          }}
        >
          <button
            onClick={handleSkip}
            className="modal-close-btn"
            style={{
              position: "absolute",
              top: "14px",
              right: "14px",
            }}
            title="閉じる"
          >
            <X size={18} />
          </button>

          <div
            style={{
              marginBottom: "12px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <BrandSymbol
              size={52}
              style={{
                boxShadow: "var(--shadow-2)",
              }}
            />
          </div>
          <h2
            className="text-title1"
            style={{
              fontSize: "22px",
              margin: "0 0 6px 0",
              color: "var(--c-text-main)",
            }}
          >
            ラクガエへようこそ！
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              color: "var(--c-text-sub)",
              lineHeight: 1.5,
            }}
          >
            条件を満たす座席配置を瞬時に自動作成。
            <br />
            まずは3分で実際に操作しながら体験してみましょう！
          </p>
        </div>

        {/* Feature Highlights */}
        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: "10px 12px",
              backgroundColor: "var(--c-bg-main)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--c-primary-pale)",
                color: "var(--c-primary-hover)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Zap size={18} />
            </div>
            <div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "var(--c-text-main)",
                }}
              >
                3分で直感的に体験
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--c-text-sub)",
                  lineHeight: 1.4,
                }}
              >
                画面の指示に従って操作するだけで、座席配置からシャッフルまでの一連の流れを習得できます。
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: "10px 12px",
              backgroundColor: "var(--c-bg-main)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "#e0f2fe",
                color: "#0284c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Shield size={18} />
            </div>
            <div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "var(--c-text-main)",
                }}
              >
                柔軟な条件設定
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--c-text-sub)",
                  lineHeight: 1.4,
                }}
              >
                「離したい生徒」「班長の分散」「視力配慮」などを自動で満たします。
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: "10px 12px",
              backgroundColor: "var(--c-bg-main)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "#dcfce7",
                color: "#16a34a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Lock size={18} />
            </div>
            <div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "var(--c-text-main)",
                }}
              >
                安心の完全ローカル保存
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--c-text-sub)",
                  lineHeight: 1.4,
                }}
              >
                生徒の氏名や情報は外部サーバーに送信されず、お使いのブラウザ内でのみ安全に動作します。
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--c-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "var(--c-bg-main)",
          }}
        >
          <button
            className="btn-secondary"
            onClick={handleSkip}
            style={{ fontSize: "13px" }}
          >
            スキップ
          </button>
          <button
            className="btn-primary"
            onClick={handleStartTour}
            style={{
              gap: "6px",
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            <Sparkles size={16} /> 3分ガイドを始める
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
