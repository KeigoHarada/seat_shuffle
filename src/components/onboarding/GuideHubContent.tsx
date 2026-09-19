import React from "react";
import { Sparkles, Keyboard, ListChecks, Lightbulb } from "lucide-react";
import { useOnboardingStore } from "../../stores/onboarding";
import GuideDemoAnimation from "./GuideDemoAnimation";
import { GUIDE_ITEMS, TOUR_ITEM } from "./data/guideItems";

export const GuideHubContent: React.FC = () => {
  const selectedTab = useOnboardingStore((state) => state.selectedGuideTab);
  const handleStartTourRequest = useOnboardingStore(
    (state) => state.handleStartTourRequest,
  );

  const currentItem =
    GUIDE_ITEMS.find((item) => item.id === selectedTab) || TOUR_ITEM;

  return (
    <main className="guide-hub-content">
      <div className="guide-hub-title-row">
        <div>
          <h3
            className="text-title2"
            style={{
              fontSize: "20px",
              margin: "0 0 6px 0",
              color: "var(--c-text-main)",
            }}
          >
            {currentItem.title}
          </h3>
          <p
            style={{
              fontSize: "14px",
              color: "var(--c-text-sub)",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {currentItem.description}
          </p>
        </div>

        {currentItem.id === "tour" && (
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
            <Sparkles size={16} /> ツアーを開始
          </button>
        )}
      </div>

      {currentItem.id !== "tour" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {currentItem.videos && currentItem.videos.length > 0 ? (
            currentItem.videos.map((vid, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <h4
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    color: "var(--c-text-main)",
                  }}
                >
                  {vid.title}
                </h4>
                <div
                  style={{
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid var(--c-border)",
                    backgroundColor: "var(--c-bg-sub)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    aspectRatio: "16 / 9",
                  }}
                >
                  <video
                    className="guide-video"
                    controls
                    playsInline
                    src={`${import.meta.env.BASE_URL}videos/${vid.url}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      backgroundColor: "transparent",
                    }}
                  />
                </div>
                {vid.steps && vid.steps.length > 0 && (
                  <div
                    style={{
                      backgroundColor: "var(--c-bg-main)",
                      border: "1px solid var(--c-border)",
                      borderRadius: "8px",
                      padding: "16px",
                      marginTop: "4px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "var(--c-primary)",
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <ListChecks size={16} /> 操作ステップ
                    </div>
                    <ol
                      style={{
                        margin: 0,
                        paddingLeft: "24px",
                        lineHeight: 1.8,
                        fontSize: "13px",
                        color: "var(--c-text-main)",
                      }}
                    >
                      {vid.steps.map((step, stepIdx) => (
                        <li key={stepIdx} style={{ marginBottom: "6px" }}>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div
              style={{
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid var(--c-border)",
                backgroundColor: "var(--c-bg-sub)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <GuideDemoAnimation />
            </div>
          )}
        </div>
      )}

      {(!currentItem.videos ||
        currentItem.videos.length === 0 ||
        currentItem.id === "tour") &&
        currentItem.points &&
        currentItem.points.length > 0 && (
          <div
            style={{
              backgroundColor: "var(--c-bg-main)",
              border: "1px solid var(--c-border)",
              borderRadius: "8px",
              padding: "16px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--c-primary)",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <ListChecks size={16} /> 操作ステップ
            </div>

            <ol
              style={{
                margin: 0,
                paddingLeft: "24px",
                lineHeight: 1.8,
                fontSize: "14px",
                color: "var(--c-text-main)",
              }}
            >
              {currentItem.points.map((p, idx) => (
                <li key={idx} style={{ marginBottom: "6px" }}>
                  {p}
                </li>
              ))}
            </ol>

            {currentItem.hint && (
              <div
                style={{
                  marginTop: "16px",
                  paddingTop: "16px",
                  borderTop: "1px dashed var(--c-border)",
                  fontSize: "13px",
                  color: "var(--c-text-sub)",
                  lineHeight: 1.6,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "6px",
                  }}
                >
                  <Lightbulb
                    size={16}
                    style={{
                      flexShrink: 0,
                      marginTop: "2px",
                      color: "var(--c-primary)",
                    }}
                  />
                  <div>
                    <strong>ヒント:</strong> {currentItem.hint}
                  </div>
                </div>
              </div>
            )}

            {currentItem.shortcuts && currentItem.shortcuts.length > 0 && (
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
                <div className="guide-hub-shortcuts">
                  {currentItem.shortcuts.map((sc, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "12px",
                        color: "var(--c-text-sub)",
                      }}
                    >
                      <kbd
                        style={{
                          backgroundColor: "var(--c-bg-sub)",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          border: "1px solid var(--c-border)",
                          fontFamily: "monospace",
                          fontSize: "11px",
                          color: "var(--c-text-main)",
                        }}
                      >
                        {sc.key}
                      </kbd>
                      {sc.desc}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
    </main>
  );
};

export default GuideHubContent;
