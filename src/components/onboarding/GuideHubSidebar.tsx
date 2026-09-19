import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { useOnboardingStore } from "../../stores/onboarding";
import { GUIDE_CATEGORIES } from "./data/guideItems";

export const GuideHubSidebar: React.FC = () => {
  const selectedTab = useOnboardingStore((state) => state.selectedGuideTab);
  const setSelectedTab = useOnboardingStore(
    (state) => state.setSelectedGuideTab,
  );

  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({
    layout: true,
    manage: true,
    constraints: true,
    shuffle: true,
  });

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <aside className="guide-hub-sidebar">
      <button
        onClick={() => setSelectedTab("tour")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 12px",
          borderRadius: "8px",
          backgroundColor:
            selectedTab === "tour"
              ? "var(--c-primary-pale)"
              : "var(--c-primary)",
          color: selectedTab === "tour" ? "var(--c-primary)" : "#ffffff",
          border: "none",
          fontWeight: 700,
          cursor: "pointer",
          marginBottom: "8px",
          boxShadow:
            selectedTab === "tour" ? "none" : "0 2px 4px rgba(0,0,0,0.1)",
          transition: "all 0.15s ease",
        }}
      >
        <Sparkles size={16} />
        3分実践ツアーを始める
      </button>

      {GUIDE_CATEGORIES.map((category) => {
        const isExpanded = expandedCategories[category.id];
        return (
          <div
            key={category.id}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2px",
            }}
          >
            <button
              onClick={() => toggleCategory(category.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 12px",
                borderRadius: "6px",
                backgroundColor: "transparent",
                border: "none",
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--c-text-main)",
                cursor: "pointer",
                textAlign: "left",
                transition: "background-color 0.15s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--c-bg-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <span
                style={{
                  transform: `rotate(${isExpanded ? 90 : 0}deg)`,
                  transition: "transform 0.15s ease",
                  fontSize: "10px",
                }}
              >
                ▶
              </span>
              {category.label}
            </button>
            {isExpanded && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  paddingLeft: "16px",
                  gap: "2px",
                  marginTop: "2px",
                }}
              >
                {category.items.map((item) => {
                  const isActive = selectedTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedTab(item.id)}
                      style={{
                        textAlign: "left",
                        padding: "6px 12px",
                        borderRadius: "6px",
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
                        transition: "all 0.15s ease",
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
};

export default GuideHubSidebar;
