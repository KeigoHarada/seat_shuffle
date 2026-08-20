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
          className="modal-content"
          style={{
            width: "840px",
            maxWidth: "90vw",
            height: "min(620px, 90vh)",
            display: "flex",
            flexDirection: "column",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
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

          {/* 2-Column Body */}
          <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
            <GuideHubSidebar />
            <GuideHubContent />
          </div>
        </div>
      </div>
    </>
  );
};

export default GuideHubModal;
