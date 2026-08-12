import React from "react";

interface CanvasContextMenuProps {
  contextMenu: { x: number; y: number; worldX: number; worldY: number } | null;
  onClose: () => void;
  onAddSeat: () => void;
  hasSelection: boolean;
  onDeleteSelected: () => void;
}

const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({
  contextMenu,
  onClose,
  onAddSeat,
  hasSelection,
  onDeleteSelected,
}) => {
  if (!contextMenu) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: contextMenu.x,
        top: contextMenu.y,
        backgroundColor: "var(--c-surface)",
        border: "1px solid var(--c-border)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-lg)",
        padding: "4px 0",
        zIndex: 1000,
        minWidth: 150,
        display: "flex",
        flexDirection: "column",
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
      )}
    </div>
  );
};

export default CanvasContextMenu;
