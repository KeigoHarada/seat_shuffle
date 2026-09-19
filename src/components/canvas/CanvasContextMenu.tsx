import React, { useRef, useLayoutEffect, useState } from "react";
import { Lock, Unlock } from "lucide-react";
import { clampMenuPosition } from "../../services/canvasGeometry";

interface CanvasContextMenuProps {
  contextMenu: { x: number; y: number; worldX: number; worldY: number } | null;
  onClose: () => void;
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
  contextMenu,
  onClose,
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
      <button
        onClick={() => {
          onAddSeat();
          onClose();
        }}
        style={{
          padding: "8px 16px",
          textAlign: "left",
          background: "none",
          border: "none",
          color: "var(--c-text-main)",
          fontSize: 14,
          cursor: "pointer",
          transition: "background-color 0.1s",
          width: "100%",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "var(--c-surface-hover)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "transparent")
        }
      >
        座席を新規作成
      </button>

      {hasSelection && (
        <>
          {hasSelectedSeats && onAssignGroupSelected && (
            <button
              onClick={() => {
                onAssignGroupSelected();
                onClose();
              }}
              style={{
                padding: "8px 16px",
                textAlign: "left",
                background: "none",
                border: "none",
                color: "var(--c-text-main)",
                fontSize: 14,
                cursor: "pointer",
                transition: "background-color 0.1s",
                width: "100%",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--c-surface-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              グループを選択
            </button>
          )}

          {hasOccupiedSeats && onUnassignSelected && (
            <button
              onClick={() => {
                onUnassignSelected();
                onClose();
              }}
              style={{
                padding: "8px 16px",
                textAlign: "left",
                background: "none",
                border: "none",
                color: "var(--c-text-main)",
                fontSize: 14,
                cursor: "pointer",
                transition: "background-color 0.1s",
                width: "100%",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--c-surface-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              生徒の割り当て解除
            </button>
          )}

          {hasSingleEmptySeat && onAssignStudentSelected && (
            <button
              onClick={() => {
                onAssignStudentSelected();
                onClose();
              }}
              style={{
                padding: "8px 16px",
                textAlign: "left",
                background: "none",
                border: "none",
                color: "var(--c-text-main)",
                fontSize: 14,
                cursor: "pointer",
                transition: "background-color 0.1s",
                width: "100%",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--c-surface-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              生徒を割り当て
            </button>
          )}

          {hasOccupiedSeats && onToggleLockSelected && (
            <button
              onClick={() => {
                onToggleLockSelected(!isAllSelectedLocked);
                onClose();
              }}
              style={{
                padding: "8px 16px",
                textAlign: "left",
                background: "none",
                border: "none",
                color: "var(--c-text-main)",
                fontSize: 14,
                cursor: "pointer",
                transition: "background-color 0.1s",
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--c-surface-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <span>
                {isAllSelectedLocked ? "ロックを解除" : "座席をロック"}
              </span>
              <span style={{ display: "flex", alignItems: "center" }}>
                {isAllSelectedLocked ? (
                  <Unlock size={14} />
                ) : (
                  <Lock size={14} />
                )}
              </span>
            </button>
          )}

          <button
            onClick={() => {
              if (onDuplicateSelected) onDuplicateSelected();
              onClose();
            }}
            style={{
              padding: "8px 16px",
              textAlign: "left",
              background: "none",
              border: "none",
              color: "var(--c-text-main)",
              fontSize: 14,
              cursor: "pointer",
              transition: "background-color 0.1s",
              width: "100%",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--c-surface-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            複製
          </button>

          <button
            onClick={() => {
              onDeleteSelected();
              onClose();
            }}
            style={{
              padding: "8px 16px",
              textAlign: "left",
              background: "none",
              border: "none",
              color: "var(--c-danger)",
              fontSize: 14,
              cursor: "pointer",
              transition: "background-color 0.1s",
              width: "100%",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--c-surface-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            削除
          </button>
        </>
      )}
    </div>
  );
};

export default CanvasContextMenu;
