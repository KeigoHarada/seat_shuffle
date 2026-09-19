import {
  useRef,
  useCallback,
  type PointerEvent,
  type MouseEvent,
  type RefObject,
} from "react";
import { screenToWorld, contextMenuFromClient } from "../../../services/canvasGeometry";
import {
  isCanvasChromeTarget,
  isCanvasNodeTarget,
  isTouchPointerType,
  LONG_PRESS_MS,
  movedPastTap,
  resolveCanvasDownGesture,
  shouldClearSelectionForPointerGesture,
  tryReleasePointerCapture,
  trySetPointerCapture,
} from "../../../services/canvasGesture";

interface UseCanvasPointerEventsProps {
  canvasTool: "select" | "hand";
  isSpaceMode: boolean;
  isViewMode: boolean;
  pan: { x: number; y: number };
  scale: number;
  viewportRef: RefObject<HTMLDivElement | null>;
  clearSelection: () => void;
  startSelectionBox: (x: number, y: number) => void;
  updateSelectionBox: (x: number, y: number) => void;
  endSelectionBox: () => void;
  trackPointer: (e: PointerEvent) => void;
  getPointerCount: () => number;
  promoteToPinch: (target: EventTarget | null) => void;
  handlePointerDown: (e: PointerEvent, forcePan: boolean) => boolean;
  handlePointerMove: (e: PointerEvent) => void;
  handlePointerUp: (e: PointerEvent) => void;
  cancelDrag: () => void;
  cancelNodeLongPress: () => void;
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
  trackPointer,
  getPointerCount,
  promoteToPinch,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
  cancelDrag,
  cancelNodeLongPress,
  setContextMenu,
}: UseCanvasPointerEventsProps) => {
  const pointerDownPosRef = useRef({ x: 0, y: 0 });
  const isMarqueeRef = useRef(false);
  const longPressTimerRef = useRef<number | null>(null);

  const clearLongPress = useCallback(() => {
    if (longPressTimerRef.current != null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const abortMarquee = useCallback(() => {
    if (!isMarqueeRef.current) return;
    isMarqueeRef.current = false;
    endSelectionBox();
    clearSelection();
  }, [clearSelection, endSelectionBox]);

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

  const startTouchLongPress = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!isTouchPointerType(e.pointerType) || isViewMode) return;
      const { clientX, clientY, pointerId } = e;
      const canvasEl = e.currentTarget;
      longPressTimerRef.current = window.setTimeout(() => {
        longPressTimerRef.current = null;
        tryReleasePointerCapture(canvasEl, pointerId);
        abortMarquee();
        handlePointerUp(e);
        openMenuAt(clientX, clientY);
      }, LONG_PRESS_MS);
    },
    [abortMarquee, handlePointerUp, isViewMode, openMenuAt],
  );

  const beginMarqueeAt = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      isMarqueeRef.current = true;
      trySetPointerCapture(e.currentTarget, e.pointerId);
      const rect = viewportRef.current?.getBoundingClientRect();
      if (!rect) return;
      const { worldX, worldY } = screenToWorld(
        e.clientX,
        e.clientY,
        rect,
        pan,
        scale,
      );
      startSelectionBox(worldX, worldY);
    },
    [pan, scale, startSelectionBox, viewportRef],
  );

  const onCanvasPointerDownCapture = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (isCanvasChromeTarget(e.target)) return;
      if (!isTouchPointerType(e.pointerType)) return;

      trackPointer(e);
      if (getPointerCount() < 2) return;

      e.stopPropagation();
      promoteToPinch(e.currentTarget);
      abortMarquee();
      cancelDrag();
      cancelNodeLongPress();
      clearLongPress();
      clearSelection();
    },
    [
      abortMarquee,
      cancelDrag,
      cancelNodeLongPress,
      clearLongPress,
      clearSelection,
      getPointerCount,
      promoteToPinch,
      trackPointer,
    ],
  );

  const onCanvasPointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
      setContextMenu(null);
      clearLongPress();

      if (isCanvasChromeTarget(e.target)) return;

      const isTouch = isTouchPointerType(e.pointerType);
      const gesture = resolveCanvasDownGesture({
        pointerType: e.pointerType,
        button: e.button,
        pointerCount: isTouch ? getPointerCount() : 1,
        onChrome: false,
        onNode: isCanvasNodeTarget(e.target),
        isViewMode,
        isSpaceMode,
        canvasTool,
      });

      if (gesture === "pinch") {
        handlePointerDown(e, false);
        return;
      }
      if (gesture === "node" || gesture === "none") return;

      if (
        shouldClearSelectionForPointerGesture(gesture) &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        e.button === 0
      ) {
        clearSelection();
      }

      if (gesture === "pan") {
        handlePointerDown(e, true);
        startTouchLongPress(e);
        return;
      }

      if (gesture === "marquee") {
        handlePointerDown(e, false);
        beginMarqueeAt(e);
        startTouchLongPress(e);
      }
    },
    [
      beginMarqueeAt,
      canvasTool,
      clearLongPress,
      clearSelection,
      getPointerCount,
      handlePointerDown,
      isSpaceMode,
      isViewMode,
      setContextMenu,
      startTouchLongPress,
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
      if (
        isMarqueeRef.current &&
        getPointerCount() < 2 &&
        viewportRef.current
      ) {
        const rect = viewportRef.current.getBoundingClientRect();
        const { worldX, worldY } = screenToWorld(
          e.clientX,
          e.clientY,
          rect,
          pan,
          scale,
        );
        updateSelectionBox(worldX, worldY);
      }
    },
    [
      clearLongPress,
      getPointerCount,
      handlePointerMove,
      pan,
      scale,
      updateSelectionBox,
      viewportRef,
    ],
  );

  const onCanvasPointerUp = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      clearLongPress();
      handlePointerUp(e);
      if (isMarqueeRef.current && getPointerCount() === 0) {
        isMarqueeRef.current = false;
        endSelectionBox();
        tryReleasePointerCapture(e.currentTarget, e.pointerId);
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
      clearLongPress,
      endSelectionBox,
      getPointerCount,
      handlePointerUp,
      isViewMode,
      openMenuAt,
    ],
  );

  const updatePointerDownPos = useCallback((x: number, y: number) => {
    pointerDownPosRef.current = { x, y };
  }, []);

  return {
    handleContextMenu,
    onCanvasPointerDownCapture,
    onCanvasPointerDown,
    onCanvasPointerMove,
    onCanvasPointerUp,
    updatePointerDownPos,
  };
};
