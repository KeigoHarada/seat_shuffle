import { useRef, useCallback, type PointerEvent, type MouseEvent, type RefObject } from "react";
import { screenToWorld, contextMenuFromClient } from "../utils/canvas";
import {
  isCanvasChromeTarget,
  isCanvasNodeTarget,
  isTouchPointerType,
  LONG_PRESS_MS,
  movedPastTap,
} from "../utils/panZoomGesture";

interface UseCanvasPointerEventsProps {
  canvasTool: "select" | "hand";
  isSpaceMode: boolean;
  isViewMode: boolean;
  pan: { x: number; y: number };
  scale: number;
  viewportRef: RefObject<HTMLDivElement | null>;
  clearSelection: () => void;
  startSelectionBox: (x: number, y: number) => void;
  updateSelectionBox: (
    x: number,
    y: number,
    ctrl: boolean,
    ids: string[],
  ) => void;
  endSelectionBox: () => void;
  handlePointerDown: (e: PointerEvent, forcePan: boolean) => boolean;
  handlePointerMove: (e: PointerEvent) => void;
  handlePointerUp: (e: PointerEvent) => void;
  setContextMenu: (
    menu: { x: number; y: number; worldX: number; worldY: number } | null,
  ) => void;
}

export const useCanvasPointerEvents = ({
  canvasTool,
  isSpaceMode,
  isViewMode,
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
  const longPressTimerRef = useRef<number | null>(null);

  const clearLongPress = useCallback(() => {
    if (longPressTimerRef.current != null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const openMenuAt = useCallback(
    (clientX: number, clientY: number) => {
      if (isViewMode) return;
      const rect = viewportRef.current?.getBoundingClientRect();
      if (!rect) return;
      setContextMenu(contextMenuFromClient(clientX, clientY, rect, pan, scale));
    },
    [isViewMode, pan, scale, viewportRef, setContextMenu],
  );

  const handleContextMenu = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (isCanvasChromeTarget(e.target)) return;
      openMenuAt(e.clientX, e.clientY);
    },
    [openMenuAt],
  );

  const onCanvasPointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
      setContextMenu(null);
      clearLongPress();

      if (isCanvasChromeTarget(e.target)) return;

      const isTouch = isTouchPointerType(e.pointerType);
      if (isTouch && isCanvasNodeTarget(e.target)) return;

      if (isTouch) {
        handlePointerDown(e, true);
        if (!isViewMode) {
          const { clientX, clientY, pointerId } = e;
          const canvasEl = e.currentTarget;
          longPressTimerRef.current = window.setTimeout(() => {
            longPressTimerRef.current = null;
            if (canvasEl?.hasPointerCapture?.(pointerId)) {
              canvasEl.releasePointerCapture(pointerId);
            }
            handlePointerUp(e);
            openMenuAt(clientX, clientY);
          }, LONG_PRESS_MS);
        }
        return;
      }

      if (e.target !== e.currentTarget) return;

      if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
        clearSelection();
      }

      const forcePan = isSpaceMode || canvasTool === "hand" || isViewMode;
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
    },
    [
      canvasTool,
      isSpaceMode,
      isViewMode,
      pan,
      scale,
      viewportRef,
      clearSelection,
      handlePointerDown,
      handlePointerUp,
      startSelectionBox,
      setContextMenu,
      clearLongPress,
      openMenuAt,
    ],
  );

  const onCanvasPointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (longPressTimerRef.current != null) {
        const dx = e.clientX - pointerDownPosRef.current.x;
        const dy = e.clientY - pointerDownPosRef.current.y;
        if (movedPastTap(dx, dy)) clearLongPress();
      }
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
    },
    [
      handlePointerMove,
      pan,
      scale,
      viewportRef,
      updateSelectionBox,
      clearLongPress,
    ],
  );

  const onCanvasPointerUp = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      clearLongPress();
      handlePointerUp(e);
      if (isMarqueeRef.current) {
        isMarqueeRef.current = false;
        endSelectionBox();
        e.currentTarget.releasePointerCapture(e.pointerId);
      }

      if (e.button === 2 && !isViewMode) {
        const dx = e.clientX - pointerDownPosRef.current.x;
        const dy = e.clientY - pointerDownPosRef.current.y;
        if (!movedPastTap(dx, dy)) {
          openMenuAt(e.clientX, e.clientY);
        }
      }
    },
    [
      handlePointerUp,
      endSelectionBox,
      clearLongPress,
      openMenuAt,
      isViewMode,
    ],
  );

  const updatePointerDownPos = useCallback((x: number, y: number) => {
    pointerDownPosRef.current = { x, y };
  }, []);

  return {
    handleContextMenu,
    onCanvasPointerDown,
    onCanvasPointerMove,
    onCanvasPointerUp,
    updatePointerDownPos,
  };
};
