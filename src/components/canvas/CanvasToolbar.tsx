import React, { useEffect, useState } from "react";
import { Plus, Shapes, LayoutTemplate, Wand2 } from "lucide-react";

interface Props {
  onAddSeat: () => void;
  onAddRectangle: () => void;
  onAddCircle: () => void;
  onApplyTemplate: (templateName: string) => void;
  onAutoAssign: () => void;
}

const TEMPLATES = [
  { id: "classroom", label: "教室" },
  { id: "group4", label: "4人席" },
  { id: "group6_v", label: "6人席（縦）" },
  { id: "group6_h", label: "6人席（横）" },
] as const;

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

  return (
    <div
      className="app-canvas-toolbar"
      onPointerDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="app-canvas-toolbar-btn"
        onClick={onAddSeat}
        aria-label="座席を追加"
        title="座席を追加"
      >
        <Plus size={16} /> 座席を追加
      </button>

      <div className="app-canvas-toolbar-divider" />

      <div className="app-canvas-toolbar-menu-wrap">
        <button
          type="button"
          className={
            openMenu === "shapes"
              ? "app-canvas-toolbar-btn is-open"
              : "app-canvas-toolbar-btn"
          }
          aria-label="図形"
          aria-expanded={openMenu === "shapes"}
          title="図形"
          onClick={() => setOpenMenu(openMenu === "shapes" ? null : "shapes")}
        >
          <Shapes size={16} /> 図形
        </button>

        {openMenu === "shapes" && (
          <div className="app-canvas-toolbar-menu">
            <button
              type="button"
              className="app-canvas-toolbar-menu-item"
              onClick={() => {
                onAddRectangle();
                setOpenMenu(null);
              }}
            >
              四角形
            </button>
            <button
              type="button"
              className="app-canvas-toolbar-menu-item"
              onClick={() => {
                onAddCircle();
                setOpenMenu(null);
              }}
            >
              円形
            </button>
          </div>
        )}
      </div>

      <div className="app-canvas-toolbar-divider" />

      <div id="btn-toolbar-template" className="app-canvas-toolbar-menu-wrap">
        <button
          type="button"
          className={
            openMenu === "templates"
              ? "app-canvas-toolbar-btn is-open"
              : "app-canvas-toolbar-btn"
          }
          aria-label="テンプレート"
          aria-expanded={openMenu === "templates"}
          title="テンプレート"
          onClick={() =>
            setOpenMenu(openMenu === "templates" ? null : "templates")
          }
        >
          <LayoutTemplate size={16} /> テンプレート
        </button>

        {openMenu === "templates" && (
          <div className="app-canvas-toolbar-menu">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                id={`btn-template-${tpl.id}`}
                type="button"
                className="app-canvas-toolbar-menu-item"
                onClick={() => {
                  onApplyTemplate(tpl.id);
                  setOpenMenu(null);
                }}
              >
                {tpl.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="app-canvas-toolbar-divider" />

      <button
        type="button"
        className="app-canvas-toolbar-btn app-canvas-toolbar-btn-accent"
        onClick={onAutoAssign}
        aria-label="自動割り当て"
        title="生徒を空席に自動割り当て"
      >
        <Wand2 size={16} /> 自動割り当て
      </button>
    </div>
  );
};

export default CanvasToolbar;
