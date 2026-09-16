import React from "react";
import { X, Sparkles } from "lucide-react";
import { useOnboardingStore } from "../../stores/onboarding";
import GuideHubSidebar from "./GuideHubSidebar";
import GuideHubContent from "./GuideHubContent";

export const GuideHubModal: React.FC = () => {
  const isOpen = useOnboardingStore((state) => state.isGuideHubOpen);
  const closeGuideHub = useOnboardingStore((state) => state.closeGuideHub);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .guide-video::-webkit-media-controls-panel {
          background: linear-gradient(to top, rgba(0,0,0,0.15) 0%, transparent 100%) !important;
        }
        .guide-video::-webkit-media-controls-enclosure {
          background: transparent !important;
        }
      `}</style>
      <div className="modal-overlay" onClick={closeGuideHub}>
        <div
          className="modal-content guide-hub"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={20} />
              <h2
                className="text-title1"
                style={{
                  fontSize: "17px",
                  margin: 0,
                  color: "var(--c-text-main)",
                }}
              >
                ラクガエ はじめてガイド
              </h2>
            </div>

            <button
              onClick={closeGuideHub}
              className="modal-close-btn"
              title="閉じる"
            >
              <X size={20} />
            </button>
          </div>

          <div className="guide-hub-body">
            <GuideHubSidebar />
            <GuideHubContent />
          </div>
        </div>
      </div>
    </>
  );
};

export default GuideHubModal;
