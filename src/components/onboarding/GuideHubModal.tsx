import React from "react";
import { X, Sparkles, CheckCircle2, Keyboard } from "lucide-react";
import { useOnboardingStore } from "../../stores/onboarding";
import GuideDemoAnimation from "./GuideDemoAnimation";
import { GUIDE_ITEMS } from "../../constants/guideItems";

export const GuideHubModal: React.FC = () => {
  const isOpen = useOnboardingStore((state) => state.isGuideHubOpen);
  const closeGuideHub = useOnboardingStore((state) => state.closeGuideHub);
  const selectedTab = useOnboardingStore((state) => state.selectedGuideTab);
  const setSelectedTab = useOnboardingStore(
    (state) => state.setSelectedGuideTab,
  );
  const handleStartTourRequest = useOnboardingStore(
    (state) => state.handleStartTourRequest,
  );

  if (!isOpen) return null;

  const currentItem =
    GUIDE_ITEMS.find((item) => item.id === selectedTab) || GUIDE_ITEMS[0];

  return (
    <div className="modal-overlay" onClick={closeGuideHub}>
      <div
        className="modal-content"
        style={{
          maxWidth: "840px",
          height: "min(620px, 90vh)",
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
              席替え先生 操作ガイド
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
          {/* Left Navigation Sidebar */}
          <aside
            style={{
              width: "220px",
              backgroundColor: "var(--c-bg-main)",
              borderRight: "1px solid var(--c-border)",
              padding: "12px 8px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              overflowY: "auto",
              flexShrink: 0,
            }}
          >
            {GUIDE_ITEMS.map((item) => {
              const isActive = item.id === selectedTab;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedTab(item.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-md)",
                    fontSize: "13px",
                    fontWeight: isActive ? 700 : 500,
                    color: isActive
                      ? "var(--c-primary-hover)"
                      : "var(--c-text-main)",
                    backgroundColor: isActive
                      ? "var(--c-primary-pale)"
                      : "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span
                    style={{
                      color: isActive
                        ? "var(--c-primary-hover)"
                        : "var(--c-text-sub)",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </aside>

          {/* Right Content Area */}
          <main
            style={{
              flex: 1,
              padding: "24px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {/* Title & Action */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div>
                <h3
                  className="text-title2"
                  style={{
                    fontSize: "18px",
                    margin: "0 0 6px 0",
                    color: "var(--c-text-main)",
                  }}
                >
                  {currentItem.title}
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--c-text-sub)",
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {currentItem.description}
                </p>
              </div>

              <button
                className="btn-primary"
                onClick={handleStartTourRequest}
                style={{
                  gap: "6px",
                  padding: "8px 14px",
                  fontSize: "13px",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                <Sparkles size={16} /> 3分ツアーを開始
              </button>
            </div>

            {/* Visual Animated Preview */}
            <GuideDemoAnimation type={currentItem.id} />

            {/* Key Operation Points */}
            <div style={{ marginTop: "4px" }}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "var(--c-text-main)",
                  marginBottom: "8px",
                }}
              >
                主な機能と操作ポイント:
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {currentItem.points.map((p, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                      fontSize: "13px",
                    }}
                  >
                    <CheckCircle2
                      size={16}
                      style={{
                        color: "var(--c-primary)",
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                    />
                    <div>
                      <strong style={{ color: "var(--c-text-main)" }}>
                        {p.title}:
                      </strong>{" "}
                      <span style={{ color: "var(--c-text-sub)" }}>
                        {p.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shortcuts if available */}
            {currentItem.shortcuts && (
              <div
                style={{
                  marginTop: "8px",
                  padding: "12px 16px",
                  backgroundColor: "var(--c-bg-main)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--c-border)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--c-text-main)",
                    marginBottom: "8px",
                  }}
                >
                  <Keyboard size={15} /> 便利なショートカット:
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                  }}
                >
                  {currentItem.shortcuts.map((sc, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "12px",
                      }}
                    >
                      <kbd
                        style={{
                          padding: "2px 6px",
                          backgroundColor: "var(--c-surface)",
                          border: "1px solid var(--c-border)",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "var(--c-text-main)",
                          boxShadow: "0 1px 1px rgba(0,0,0,0.05)",
                        }}
                      >
                        {sc.key}
                      </kbd>
                      <span style={{ color: "var(--c-text-sub)" }}>
                        {sc.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default GuideHubModal;
