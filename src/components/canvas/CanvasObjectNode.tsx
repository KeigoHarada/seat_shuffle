import React, { useState } from "react";
import { CanvasObject } from "../../types/canvas";
import { GRID_SIZE } from "../../constants/canvas";
import { useStore } from "../../stores/appStore";
import { useObjectResize } from "./hooks/useObjectResize";

interface Props {
  obj: CanvasObject;
  isDragging: boolean;
  isSelected?: boolean;
  scale: number;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove?: (e: React.PointerEvent) => void;
  onPointerUp?: (e: React.PointerEvent) => void;
  onPointerCancel?: (e: React.PointerEvent) => void;
  updateObject: (id: string, data: Partial<CanvasObject>) => void;
}

const CanvasObjectNode: React.FC<Props> = ({
  obj,
  isDragging,
  isSelected,
  scale,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  updateObject,
}) => {
  const isCircle = obj.type === "circle";
  const [isEditing, setIsEditing] = useState(false);
  const [textValue, setTextValue] = useState(obj.text || "");

  const {
    handleResizePointerDown,
    handleResizePointerMove,
    handleResizePointerUp,
  } = useObjectResize({
    obj,
    scale,
    updateObject,
  });

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setTextValue(obj.text || "");
  };

  const handleTextBlur = () => {
    setIsEditing(false);
    if (textValue === (obj.text || "")) return;
    useStore.getState().pushUndo();
    updateObject(obj.id, { text: textValue });
  };

  const handleTextKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  return (
    <div
      className="canvas-object-node"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={(e) => {
        if (onPointerCancel) onPointerCancel(e);
        else if (onPointerUp) onPointerUp(e);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDoubleClick={handleDoubleClick}
      style={{
        position: "absolute",
        left: obj.x * GRID_SIZE,
        top: obj.y * GRID_SIZE,
        width: obj.width * GRID_SIZE,
        height: obj.height * GRID_SIZE,
        backgroundColor: "rgba(0, 0, 0, 0.001)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        userSelect: "none",
        zIndex: isDragging ? 2 : isSelected ? 1 : 0,
        opacity: isDragging ? 0.8 : 1,
        cursor: isEditing ? "text" : "grab",
        touchAction: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 4,
          backgroundColor: "var(--c-surface)",
          border: isSelected
            ? "2px solid var(--c-primary)"
            : "1px solid var(--c-border)",
          borderRadius: isCircle ? "50%" : "var(--radius-md)",
          boxShadow: isDragging ? "var(--shadow-3)" : "var(--shadow-1)",
          transition: isDragging
            ? "none"
            : "box-shadow 0.2s, border-color 0.2s",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {isEditing ? (
          <input
            autoFocus
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onBlur={handleTextBlur}
            onKeyDown={handleTextKeyDown}
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              width: "80%",
              textAlign: "center",
              fontSize: 24,
              fontWeight: "bold",
              border: "1px solid var(--c-primary)",
              borderRadius: "var(--radius-sm)",
              outline: "none",
              backgroundColor: "transparent",
              color: "var(--c-text-main)",
            }}
          />
        ) : (
          obj.text && (
            <span
              style={{
                color: "var(--c-text-main)",
                fontSize: 24,
                fontWeight: "bold",
                pointerEvents: "none",
              }}
            >
              {obj.text}
            </span>
          )
        )}
      </div>

      {!isEditing && (
        <div
          onPointerDown={handleResizePointerDown}
          onPointerMove={handleResizePointerMove}
          onPointerUp={handleResizePointerUp}
          onPointerCancel={handleResizePointerUp}
          draggable={false}
          style={{
            position: "absolute",
            right: 4,
            bottom: 4,
            width: 16,
            height: 16,
            cursor: "nwse-resize",
            zIndex: 10,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-end",
            padding: 2,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              backgroundColor: "var(--c-text-sub)",
              borderTopLeftRadius: isCircle ? 0 : 4,
              borderBottomRightRadius: isCircle ? "50%" : 4,
              opacity: 0.5,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CanvasObjectNode;
