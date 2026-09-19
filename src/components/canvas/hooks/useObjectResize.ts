import { useState, useRef, useCallback } from "react";
import type React from "react";
import type { CanvasObject } from "../../../types/canvas";
import { GRID_SIZE } from "../../../constants/canvas";
import { useStore } from "../../../stores/appStore";

interface UseObjectResizeOptions {
  obj: CanvasObject;
  scale: number;
  updateObject: (id: string, data: Partial<CanvasObject>) => void;
}

export function useObjectResize({
  obj,
  scale,
  updateObject,
}: UseObjectResizeOptions) {
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    recorded: boolean;
  } | null>(null);

  const isCircle = obj.type === "circle";

  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsResizing(true);

      resizeRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startWidth: obj.width,
        startHeight: obj.height,
        recorded: false,
      };
    },
    [obj.width, obj.height],
  );

  const handleResizePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!resizeRef.current) return;

      const dx = (e.clientX - resizeRef.current.startX) / scale;
      const dy = (e.clientY - resizeRef.current.startY) / scale;

      const diffCols = Math.round(dx / GRID_SIZE);
      const diffRows = Math.round(dy / GRID_SIZE);

      let newWidth = Math.max(2, resizeRef.current.startWidth + diffCols);
      let newHeight = Math.max(2, resizeRef.current.startHeight + diffRows);

      if (isCircle) {
        const maxDiff = Math.max(diffCols, diffRows);
        newWidth = Math.max(2, resizeRef.current.startWidth + maxDiff);
        newHeight = newWidth;
      }

      if (newWidth !== obj.width || newHeight !== obj.height) {
        if (!resizeRef.current.recorded) {
          useStore.getState().pushUndo();
          resizeRef.current.recorded = true;
        }
        updateObject(obj.id, { width: newWidth, height: newHeight });
      }
    },
    [isCircle, obj.id, obj.width, obj.height, scale, updateObject],
  );

  const handleResizePointerUp = useCallback((e: React.PointerEvent) => {
    setIsResizing(false);
    resizeRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  return {
    isResizing,
    handleResizePointerDown,
    handleResizePointerMove,
    handleResizePointerUp,
  };
}
