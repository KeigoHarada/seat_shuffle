import React, { useEffect, useState } from "react";
import { Plus, Shapes, LayoutTemplate, Wand2 } from "lucide-react";
import { usePressAction } from "../../hooks/usePressAction";

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

const ToolbarMenuItem: React.FC<{
  id?: string;
  children: React.ReactNode;
  onSelect: () => void;
}> = ({ id, children, onSelect }) => {
  const press = usePressAction(onSelect);
  return (
    <button
      id={id}
      type="button"
      className="app-canvas-toolbar-menu-item"
      {...press}
    >
      {children}
    </button>
  );
};

const CanvasToolbar: React.FC<Props> = ({
  onAddSeat,
  onAddRectangle,
  onAddCircle,
  onApplyTemplate,
  onAutoAssign,
}) => {
  const [openMenu, setOpenMenu] = useState<"shapes" | "templates" | null>(null);
  const addSeatPress = usePressAction(onAddSeat);
  const autoAssignPress = usePressAction(onAutoAssign);
  const shapesPress = usePressAction(() =>
    setOpenMenu((current) => (current === "shapes" ? null : "shapes")),
  );
  const templatesPress = usePressAction(() =>
    setOpenMenu((current) => (current === "templates" ? null : "templates")),
  );

  useEffect(() => {
    const handleOutsideClick = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest(".app-canvas-toolbar")) {
        return;
      }
      setOpenMenu(null);
    };
    if (openMenu) {
      window.addEventListener("pointerdown", handleOutsideClick);
    }
    return () => window.removeEventListener("pointerdown", handleOutsideClick);
  }, [openMenu]);

  return (
    <div
      className="app-canvas-toolbar"
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="app-canvas-toolbar-btn"
        aria-label="座席を追加"
        title="座席を追加"
        {...addSeatPress}
      >
        <Plus size={16} />
        <span className="app-canvas-toolbar-label">座席を追加</span>
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
          {...shapesPress}
        >
          <Shapes size={16} />
          <span className="app-canvas-toolbar-label">図形</span>
        </button>

        {openMenu === "shapes" && (
          <div className="app-canvas-toolbar-menu">
            <ToolbarMenuItem
              onSelect={() => {
                onAddRectangle();
                setOpenMenu(null);
              }}
            >
              四角形
            </ToolbarMenuItem>
            <ToolbarMenuItem
              onSelect={() => {
                onAddCircle();
                setOpenMenu(null);
              }}
            >
              円形
            </ToolbarMenuItem>
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
          {...templatesPress}
        >
          <LayoutTemplate size={16} />
          <span className="app-canvas-toolbar-label">テンプレート</span>
        </button>

        {openMenu === "templates" && (
          <div className="app-canvas-toolbar-menu">
            {TEMPLATES.map((tpl) => (
              <ToolbarMenuItem
                key={tpl.id}
                id={`btn-template-${tpl.id}`}
                onSelect={() => {
                  onApplyTemplate(tpl.id);
                  setOpenMenu(null);
                }}
              >
                {tpl.label}
              </ToolbarMenuItem>
            ))}
          </div>
        )}
      </div>

      <div className="app-canvas-toolbar-divider" />

      <button
        type="button"
        className="app-canvas-toolbar-btn app-canvas-toolbar-btn-accent"
        aria-label="自動割り当て"
        title="生徒を空席に自動割り当て"
        {...autoAssignPress}
      >
        <Wand2 size={16} />
        <span className="app-canvas-toolbar-label">自動割り当て</span>
      </button>
    </div>
  );
};

export default CanvasToolbar;
