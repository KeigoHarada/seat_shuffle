import React, { useRef, useLayoutEffect, useState } from "react";
import { Lock, Unlock } from "lucide-react";
import { clampMenuPosition } from "../../services/canvasGeometry";
import { useCanvasOverlayStore } from "../../stores/canvasOverlay";

interface MenuItemProps {
  onClick: () => void;
  color?: string;
  children: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const MenuItem: React.FC<MenuItemProps> = ({
  onClick,
  color = "var(--c-text-main)",
  children,
  rightIcon,
}) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      padding: "8px 16px",
      textAlign: "left",
      background: "none",
      border: "none",
      color,
      fontSize: 14,
      cursor: "pointer",
      transition: "background-color 0.1s",
      width: "100%",
      display: "flex",
      justifyContent: rightIcon ? "space-between" : "flex-start",
      alignItems: "center",
    }}
    onMouseEnter={(e) =>
      (e.currentTarget.style.backgroundColor = "var(--c-surface-hover)")
    }
    onMouseLeave={(e) =>
      (e.currentTarget.style.backgroundColor = "transparent")
    }
  >
    <span>{children}</span>
    {rightIcon && (
      <span style={{ display: "flex", alignItems: "center" }}>{rightIcon}</span>
    )}
  </button>
);

interface CanvasContextMenuProps {
  onAddSeat: () => void;
  hasSelection: boolean;
  onDeleteSelected: () => void;
  onDuplicateSelected?: () => void;
  onUnassignSelected?: () => void;
  onAssignGroupSelected?: () => void;
  isAllSelectedLocked?: boolean;
  hasSelectedSeats?: boolean;
  hasOccupiedSeats?: boolean;
  hasSingleEmptySeat?: boolean;
  onToggleLockSelected?: (locked: boolean) => void;
  onAssignStudentSelected?: () => void;
}

const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({
  onAddSeat,
  hasSelection,
  onDeleteSelected,
  onDuplicateSelected,
  onUnassignSelected,
  onAssignGroupSelected,
  isAllSelectedLocked,
  hasSelectedSeats,
  hasOccupiedSeats,
  hasSingleEmptySeat,
  onToggleLockSelected,
  onAssignStudentSelected,
}) => {
  const contextMenu = useCanvasOverlayStore((state) => state.contextMenu);
  const closeContextMenu = useCanvasOverlayStore(
    (state) => state.closeContextMenu,
  );
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPos, setAdjustedPos] = useState<{
    left: number;
    top: number;
  } | null>(null);

  useLayoutEffect(() => {
    if (!contextMenu || !menuRef.current) {
      setAdjustedPos(null);
      return;
    }
    const menu = menuRef.current;
    const parent = menu.offsetParent as HTMLElement | null;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    setAdjustedPos(
      clampMenuPosition(
        contextMenu.x,
        contextMenu.y,
        menu.offsetWidth,
        menu.offsetHeight,
        parentRect.width,
        parentRect.height,
      ),
    );
  }, [
    contextMenu,
    hasSelection,
    hasSelectedSeats,
    hasOccupiedSeats,
    hasSingleEmptySeat,
  ]);

  if (!contextMenu) return null;

  const pos = adjustedPos ?? { left: contextMenu.x, top: contextMenu.y };

  const handleAction = (action?: () => void) => {
    if (action) action();
    closeContextMenu();
  };

  return (
    <div
      ref={menuRef}
      className="canvas-context-menu"
      style={{
        position: "absolute",
        left: pos.left,
        top: pos.top,
        backgroundColor: "var(--c-surface)",
        border: "1px solid var(--c-border)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-lg)",
        padding: "4px 0",
        zIndex: 1000,
        minWidth: 150,
        display: "flex",
        flexDirection: "column",
        visibility: adjustedPos ? "visible" : "hidden",
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <MenuItem onClick={() => handleAction(onAddSeat)}>
        座席を新規作成
      </MenuItem>

      {hasSelection && (
        <>
          {hasSelectedSeats && onAssignGroupSelected && (
            <MenuItem onClick={() => handleAction(onAssignGroupSelected)}>
              グループを選択
            </MenuItem>
          )}

          {hasOccupiedSeats && onUnassignSelected && (
            <MenuItem onClick={() => handleAction(onUnassignSelected)}>
              生徒の割り当て解除
            </MenuItem>
          )}

          {hasSingleEmptySeat && onAssignStudentSelected && (
            <MenuItem onClick={() => handleAction(onAssignStudentSelected)}>
              生徒を割り当て
            </MenuItem>
          )}

          {hasOccupiedSeats && onToggleLockSelected && (
            <MenuItem
              onClick={() =>
                handleAction(() => onToggleLockSelected(!isAllSelectedLocked))
              }
              rightIcon={
                isAllSelectedLocked ? <Unlock size={14} /> : <Lock size={14} />
              }
            >
              {isAllSelectedLocked ? "ロックを解除" : "座席をロック"}
            </MenuItem>
          )}

          {onDuplicateSelected && (
            <MenuItem onClick={() => handleAction(onDuplicateSelected)}>
              複製
            </MenuItem>
          )}

          <MenuItem
            color="var(--c-danger)"
            onClick={() => handleAction(onDeleteSelected)}
          >
            削除
          </MenuItem>
        </>
      )}
    </div>
  );
};

export default CanvasContextMenu;
