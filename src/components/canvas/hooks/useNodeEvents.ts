import {
  useCallback,
  useRef,
  type PointerEvent,
  type MouseEvent,
  type RefObject,
} from "react";
import type { Seat } from "../../../types/seat";
import { contextMenuFromClient } from "../../../services/canvasGeometry";
import {
  isTouchPointerType,
  LONG_PRESS_MS,
  movedPastTap,
  shouldSelectOnNodePointerDown,
} from "../../../services/canvasGesture";

interface UseNodeEventsProps {
  seats: Seat[];
  selectedIds: string[];
  toggleSelection: (id: string) => void;
  selectOnly: (id: string) => void;
  viewportRef: RefObject<HTMLDivElement | null>;
  pan: { x: number; y: number };
  scale: number;
  isViewMode: boolean;
  getPointerCount: () => number;
  cancelDrag: () => void;
  setContextMenu: (
    menu: { x: number; y: number; worldX: number; worldY: number } | null,
  ) => void;
  setPopoverPos: (pos: { x: number; y: number }) => void;
  setAssignPopoverSeatId: (id: string | null) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setActiveSettingsTab: (
    tab: "students" | "roles" | "groups" | "constraints" | "global",
  ) => void;
  setHighlightedStudentId: (id: string | null) => void;
  updatePointerDownPos: (x: number, y: number) => void;
}

export const useNodeEvents = ({
  seats,
  selectedIds,
  toggleSelection,
  selectOnly,
  viewportRef,
  pan,
  scale,
  isViewMode,
  getPointerCount,
  cancelDrag,
  setContextMenu,
  setPopoverPos,
  setAssignPopoverSeatId,
  setIsSettingsOpen,
  setActiveSettingsTab,
  setHighlightedStudentId,
  updatePointerDownPos,
}: UseNodeEventsProps) => {
  const longPressTimerRef = useRef<number | null>(null);
  const downRef = useRef({ x: 0, y: 0, id: "" });

  const clearLongPress = useCallback(() => {
    if (longPressTimerRef.current != null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const openAssign = useCallback(
    (id: string, clientX: number, clientY: number) => {
      const rect = viewportRef.current?.getBoundingClientRect();
      if (rect) {
        setPopoverPos({
          x: clientX - rect.left,
          y: clientY - rect.top,
        });
      }
      setAssignPopoverSeatId(id);
    },
    [viewportRef, setPopoverPos, setAssignPopoverSeatId],
  );

  const handleNodePointerDown = useCallback(
    (id: string, e: PointerEvent) => {
      if (
        !shouldSelectOnNodePointerDown({
          pointerType: e.pointerType,
          isPrimary: e.isPrimary,
          pointerCount: isTouchPointerType(e.pointerType)
            ? getPointerCount()
            : 1,
        })
      ) {
        return;
      }
      e.stopPropagation();
      updatePointerDownPos(e.clientX, e.clientY);
      if (e.ctrlKey || e.metaKey) {
        toggleSelection(id);
      } else if (!selectedIds.includes(id)) {
        selectOnly(id);
      }

      clearLongPress();
      if (!isTouchPointerType(e.pointerType) || isViewMode) return;

      downRef.current = { x: e.clientX, y: e.clientY, id };
      const { clientX, clientY } = e;
      longPressTimerRef.current = window.setTimeout(() => {
        longPressTimerRef.current = null;
        cancelDrag();
        const rect = viewportRef.current?.getBoundingClientRect();
        if (!rect) return;
        setContextMenu(
          contextMenuFromClient(clientX, clientY, rect, pan, scale),
        );
      }, LONG_PRESS_MS);
    },
    [
      selectedIds,
      toggleSelection,
      selectOnly,
      updatePointerDownPos,
      isViewMode,
      getPointerCount,
      clearLongPress,
      cancelDrag,
      viewportRef,
      setContextMenu,
      pan,
      scale,
    ],
  );

  const handleNodeLongPressMove = useCallback(
    (e: PointerEvent) => {
      if (longPressTimerRef.current == null) return;
      const dx = e.clientX - downRef.current.x;
      const dy = e.clientY - downRef.current.y;
      if (movedPastTap(dx, dy)) clearLongPress();
    },
    [clearLongPress],
  );

  const handleNodeLongPressUp = useCallback(
    (id: string, e: PointerEvent) => {
      const waiting = longPressTimerRef.current != null;
      clearLongPress();
      if (!waiting || !isTouchPointerType(e.pointerType) || isViewMode) return;

      const dx = e.clientX - downRef.current.x;
      const dy = e.clientY - downRef.current.y;
      if (movedPastTap(dx, dy)) return;

      const seat = seats.find((item) => item.id === id);
      if (seat && !seat.studentId) {
        openAssign(id, e.clientX, e.clientY);
      }
    },
    [clearLongPress, isViewMode, seats, openAssign],
  );

  const handleSeatDoubleClick = useCallback(
    (id: string, e: MouseEvent) => {
      e.stopPropagation();
      const seat = seats.find((s) => s.id === id);
      if (seat && !seat.studentId) {
        openAssign(id, e.clientX, e.clientY);
      } else if (seat && seat.studentId) {
        setIsSettingsOpen(true);
        setActiveSettingsTab("students");
        setHighlightedStudentId(seat.studentId);
      }
    },
    [
      seats,
      openAssign,
      setIsSettingsOpen,
      setActiveSettingsTab,
      setHighlightedStudentId,
    ],
  );

  return {
    handleNodePointerDown,
    handleNodeLongPressMove,
    handleNodeLongPressUp,
    handleSeatDoubleClick,
    cancelNodeLongPress: clearLongPress,
  };
};
