import React, { useState, useEffect } from "react";
import { Plus, Shapes, LayoutTemplate, Wand2 } from "lucide-react";

interface Props {
  onAddSeat: () => void;
  onAddRectangle: () => void;
  onAddCircle: () => void;
  onApplyTemplate: (templateName: string) => void;
  onAutoAssign: () => void;
}

const CanvasToolbar: React.FC<Props> = ({
  onAddSeat,
  onAddRectangle,
  onAddCircle,
  onApplyTemplate,
  onAutoAssign,
}) => {
  const [openMenu, setOpenMenu] = useState<"shapes" | "templates" | null>(null);

  useEffect(() => {
    const handleOutsideClick = () => setOpenMenu(null);
    if (openMenu) {
      window.addEventListener("pointerdown", handleOutsideClick);
    }
    return () => window.removeEventListener("pointerdown", handleOutsideClick);
  }, [openMenu]);

  const buttonStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "6px 12px",
    borderRadius: "var(--radius-md)",
    border: "none",
    background: "transparent",
    color: "var(--c-text-main)",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    transition: "background-color 0.1s",
  };

  const menuItemStyle = {
    padding: "8px 16px",
    textAlign: "left" as const,
    background: "none",
    border: "none",
    color: "var(--c-text-main)",
    fontSize: 14,
    cursor: "pointer",
    transition: "background-color 0.1s",
    width: "100%",
  };

  return (
    <div
      className="app-canvas-toolbar"
      style={{
        position: "absolute",
        top: 24,
        left: 24,
        display: "flex",
        backgroundColor: "var(--c-surface)",
        border: "1px solid var(--c-border)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-1)",
        padding: 4,
        gap: 4,
        zIndex: 100,
        userSelect: "none",
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.stopPropagation()}
    >
      <button
        onClick={onAddSeat}
        style={buttonStyle}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "var(--c-surface-hover)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "transparent")
        }
      >
        <Plus size={16} /> 座席を追加
      </button>

      <div
        style={{
          width: 1,
          backgroundColor: "var(--c-border)",
          margin: "4px 0",
        }}
      />

      <div style={{ position: "relative" }}>
        <button
          onClick={() => setOpenMenu(openMenu === "shapes" ? null : "shapes")}
          style={{
            ...buttonStyle,
            backgroundColor:
              openMenu === "shapes" ? "var(--c-surface-hover)" : "transparent",
          }}
          onMouseEnter={(e) => {
            if (openMenu !== "shapes")
              e.currentTarget.style.backgroundColor = "var(--c-surface-hover)";
          }}
          onMouseLeave={(e) => {
            if (openMenu !== "shapes")
              e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <Shapes size={16} /> 図形
        </button>

        {openMenu === "shapes" && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              marginTop: 4,
              backgroundColor: "var(--c-surface)",
              border: "1px solid var(--c-border)",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-1)",
              padding: "4px 0",
              minWidth: 120,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <button
              onClick={() => {
                onAddRectangle();
                setOpenMenu(null);
              }}
              style={menuItemStyle}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--c-surface-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              四角形
            </button>
            <button
              onClick={() => {
                onAddCircle();
                setOpenMenu(null);
              }}
              style={menuItemStyle}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--c-surface-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              円形
            </button>
          </div>
        )}
      </div>

      <div
        style={{
          width: 1,
          backgroundColor: "var(--c-border)",
          margin: "4px 0",
        }}
      />

      <div id="btn-toolbar-template" style={{ position: "relative" }}>
        <button
          onClick={() =>
            setOpenMenu(openMenu === "templates" ? null : "templates")
          }
          style={{
            ...buttonStyle,
            backgroundColor:
              openMenu === "templates"
                ? "var(--c-surface-hover)"
                : "transparent",
          }}
          onMouseEnter={(e) => {
            if (openMenu !== "templates")
              e.currentTarget.style.backgroundColor = "var(--c-surface-hover)";
          }}
          onMouseLeave={(e) => {
            if (openMenu !== "templates")
              e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <LayoutTemplate size={16} /> テンプレート
        </button>

        {openMenu === "templates" && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              marginTop: 4,
              backgroundColor: "var(--c-surface)",
              border: "1px solid var(--c-border)",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-1)",
              padding: "4px 0",
              minWidth: 160,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {[
              { id: "classroom", label: "教室" },
              { id: "group4", label: "4人席" },
              { id: "group6_v", label: "6人席（縦）" },
              { id: "group6_h", label: "6人席（横）" },
            ].map((tpl) => (
              <button
                key={tpl.id}
                id={`btn-template-${tpl.id}`}
                onClick={() => {
                  onApplyTemplate(tpl.id);
                  setOpenMenu(null);
                }}
                style={menuItemStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--c-bg-sub)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                {tpl.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          width: 1,
          backgroundColor: "var(--c-border)",
          margin: "4px 0",
        }}
      />
      <button
        onClick={onAutoAssign}
        style={{
          ...buttonStyle,
          color: "var(--c-primary)",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "var(--c-surface-hover)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "transparent")
        }
        title="生徒を空席に自動割り当て"
      >
        <Wand2 size={16} /> 自動割り当て
      </button>
    </div>
  );
};

export default CanvasToolbar;
