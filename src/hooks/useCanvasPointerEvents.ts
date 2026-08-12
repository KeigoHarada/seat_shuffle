import { useRef, useCallback } from "react";
import { screenToWorld } from "../utils/canvas";

interface UseCanvasPointerEventsProps {
  canvasTool: "select" | "hand";
  isSpaceMode: boolean;
  pan: { x: number; y: number };
  scale: number;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  clearSelection: () => void;
  startSelectionBox: (x: number, y: number) => void;
  updateSelectionBox: (x: number, y: number, ctrl: boolean, ids: string[]) => void;
  endSelectionBox: () => void;
  handlePointerDown: (e: React.PointerEvent, forcePan: boolean) => boolean;
  handlePointerMove: (e: React.PointerEvent) => void;
  handlePointerUp: (e: React.PointerEvent) => void;
  setContextMenu: (menu: { x: number; y: number; worldX: number; worldY: number } | null) => void;
}

export const useCanvasPointerEvents = ({
  canvasTool,
  isSpaceMode,
  pan,
  scale,
  viewportRef,
  clearSelection,
  startSelectionBox,
  updateSelectionBox,
  endSelectionBox,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
  setContextMenu,
}: UseCanvasPointerEventsProps) => {
  const pointerDownPosRef = useRef({ x: 0, y: 0 });
  const isMarqueeRef = useRef(false);
  const initialCtrlPressedRef = useRef(false);
  const initialSelectedIdsRef = useRef<string[]>([]);

  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onCanvasPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
    setContextMenu(null);
    if (e.target !== e.currentTarget) return;

    if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
      clearSelection();
    }

    const forcePan = isSpaceMode || canvasTool === "hand";
    const panStarted = handlePointerDown(e, forcePan);
    if (panStarted) return;

    if (e.button === 0 && canvasTool === "select" && !isSpaceMode) {
      e.currentTarget.setPointerCapture(e.pointerId);
      isMarqueeRef.current = true;
      initialCtrlPressedRef.current = false;
      initialSelectedIdsRef.current = [];

      const rect = viewportRef.current!.getBoundingClientRect();
      const { worldX, worldY } = screenToWorld(
        e.clientX,
        e.clientY,
        rect,
        pan,
        scale,
      );
      startSelectionBox(worldX, worldY);
    }
  }, [
    canvasTool, isSpaceMode, pan, scale, viewportRef,
    clearSelection, handlePointerDown, startSelectionBox, setContextMenu
  ]);

  const onCanvasPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    handlePointerMove(e);
    if (isMarqueeRef.current && viewportRef.current) {
      const rect = viewportRef.current.getBoundingClientRect();
      const { worldX, worldY } = screenToWorld(
        e.clientX,
        e.clientY,
        rect,
        pan,
        scale,
      );
      updateSelectionBox(
        worldX,
        worldY,
        initialCtrlPressedRef.current,
        initialSelectedIdsRef.current,
      );
    }
  }, [handlePointerMove, pan, scale, viewportRef, updateSelectionBox]);

  const onCanvasPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    handlePointerUp(e);
    if (isMarqueeRef.current) {
      isMarqueeRef.current = false;
      endSelectionBox();
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    if (e.button === 2) {
      const dx = e.clientX - pointerDownPosRef.current.x;
      const dy = e.clientY - pointerDownPosRef.current.y;
      if (dx * dx + dy * dy <= 25) {
        const rect = viewportRef.current?.getBoundingClientRect();
        if (rect) {
          const { worldX, worldY } = screenToWorld(
            e.clientX,
            e.clientY,
            rect,
            pan,
            scale,
          );
          setContextMenu({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            worldX,
            worldY,
          });
        }
      }
    }
  }, [handlePointerUp, endSelectionBox, pan, scale, viewportRef, setContextMenu]);

  return {
    handleContextMenu,
    onCanvasPointerDown,
    onCanvasPointerMove,
    onCanvasPointerUp,
  };
};
