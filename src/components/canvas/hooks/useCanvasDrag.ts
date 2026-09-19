import { useState, useCallback, useMemo, useRef } from "react";
import type { Seat } from "../../../types/seat";
import type { CanvasObject, DragNode } from "../../../types/canvas";
import { GRID_SIZE, SEAT_COLS, SEAT_ROWS } from "../../../constants/canvas";

import { checkCollision, screenToWorld } from "../../../services/canvasGeometry";
import {
  isTouchPointerType,
  tryReleasePointerCapture,
  trySetPointerCapture,
} from "../../../services/canvasGesture";
import { showToast } from "../../../stores/toast";
import { useStore } from "../../../stores/appStore";

export const useCanvasDrag = (
  seats: Seat[],
  objects: CanvasObject[],
  updateSeat: (id: string, data: Partial<Seat>) => void,
  updateObject: (id: string, data: Partial<CanvasObject>) => void,
  pan: { x: number; y: number },
  scale: number,
  viewportRef: React.RefObject<HTMLDivElement | null>,
  selectedIds: string[],
) => {
  const nodes: DragNode[] = useMemo(() => {
    return [
      ...seats.map((s) => ({
        id: s.id,
        x: s.x,
        y: s.y,
        width: SEAT_COLS,
        height: SEAT_ROWS,
        isSeat: true,
        isLocked: s.isLocked,
      })),
      ...objects.map((o) => ({
        id: o.id,
        x: o.x,
        y: o.y,
        width: o.width,
        height: o.height,
        isSeat: false,
      })),
    ];
  }, [seats, objects]);

  const [dragState, setDragState] = useState<{
    baseId: string;
    draggedIds: string[];
    startX: number;
    startY: number;
    visualDeltaX: number;
    visualDeltaY: number;
    validDeltaX: number;
    validDeltaY: number;
    isSwapMode: boolean;
  } | null>(null);
  const dragStateRef = useRef(dragState);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const commitDragState = useCallback((next: typeof dragState) => {
    dragStateRef.current = next;
    setDragState(next);
  }, []);

  const handleNodeDragPointerDown = useCallback(
    (id: string, e: React.PointerEvent) => {
      if (isTouchPointerType(e.pointerType) && !e.isPrimary) return;
      const isRightClick = e.button === 2;
      if (e.button !== 0 && !isRightClick) return;

      const node = nodes.find((n) => n.id === id);
      if (!node) return;

      if (isRightClick && !node.isSeat) return;

      const draggedIds =
        !isRightClick && selectedIds.includes(id) ? selectedIds : [id];

      commitDragState({
        baseId: id,
        draggedIds,
        startX: node.x,
        startY: node.y,
        visualDeltaX: 0,
        visualDeltaY: 0,
        validDeltaX: 0,
        validDeltaY: 0,
        isSwapMode: isRightClick,
      });

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      dragOffsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      trySetPointerCapture(e.currentTarget, e.pointerId);
    },
    [commitDragState, nodes, selectedIds],
  );

  const handleNodeDragPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const session = dragStateRef.current;
      if (!session) return;
      if (!viewportRef.current) return;

      const dragOffset = dragOffsetRef.current;
      const rect = viewportRef.current.getBoundingClientRect();
      const { worldX: dropX, worldY: dropY } = screenToWorld(
        e.clientX - dragOffset.x,
        e.clientY - dragOffset.y,
        rect,
        pan,
        scale,
      );

      const newBaseX = Math.round(dropX / GRID_SIZE);
      const newBaseY = Math.round(dropY / GRID_SIZE);

      const visualDeltaX = newBaseX - session.startX;
      const visualDeltaY = newBaseY - session.startY;

      const checkGroupCollision = (dx: number, dy: number) => {
        for (const dragId of session.draggedIds) {
          const n = nodes.find((no) => no.id === dragId);
          if (!n || !n.isSeat) continue;

          const hit = checkCollision(
            n.x + dx,
            n.y + dy,
            n.width,
            n.height,
            session.draggedIds,
            nodes,
          );
          if (hit) return true;
        }
        return false;
      };

      let nextValidDeltaX = session.validDeltaX;
      let nextValidDeltaY = session.validDeltaY;

      if (!checkGroupCollision(visualDeltaX, visualDeltaY)) {
        nextValidDeltaX = visualDeltaX;
        nextValidDeltaY = visualDeltaY;
      } else if (!checkGroupCollision(visualDeltaX, session.validDeltaY)) {
        nextValidDeltaX = visualDeltaX;
      } else if (!checkGroupCollision(session.validDeltaX, visualDeltaY)) {
        nextValidDeltaY = visualDeltaY;
      }

      if (
        visualDeltaX !== session.visualDeltaX ||
        visualDeltaY !== session.visualDeltaY ||
        nextValidDeltaX !== session.validDeltaX ||
        nextValidDeltaY !== session.validDeltaY
      ) {
        commitDragState({
          ...session,
          visualDeltaX,
          visualDeltaY,
          validDeltaX: nextValidDeltaX,
          validDeltaY: nextValidDeltaY,
        });
      }
    },
    [commitDragState, pan, scale, nodes, viewportRef],
  );

  const handleNodeDragPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const session = dragStateRef.current;
      if (!session) return;

      const draggingNode = nodes.find((n) => n.id === session.baseId);
      if (!draggingNode) {
        commitDragState(null);
        return;
      }

      if (session.isSwapMode && draggingNode.isSeat) {
        const cx = Math.floor(
          draggingNode.x + session.visualDeltaX + draggingNode.width / 2,
        );
        const cy = Math.floor(
          draggingNode.y + session.visualDeltaY + draggingNode.height / 2,
        );
        const targetNode = nodes.find(
          (n) =>
            cx >= n.x &&
            cx < n.x + n.width &&
            cy >= n.y &&
            cy < n.y + n.height &&
            n.id !== session.baseId,
        );

        if (targetNode && targetNode.isSeat) {
          if (draggingNode.isLocked || targetNode.isLocked) {
            showToast.error("ロックされた座席はスワップできません。");
          } else {
            const s1 = seats.find((s) => s.id === draggingNode.id);
            const s2 = seats.find((s) => s.id === targetNode.id);
            if (s1 && s2) {
              useStore.getState().pushUndo();
              updateSeat(s1.id, { studentId: s2.studentId });
              updateSeat(s2.id, { studentId: s1.studentId });
            }
          }
        }
      } else {
        const moved = session.validDeltaX !== 0 || session.validDeltaY !== 0;
        if (moved) {
          useStore.getState().pushUndo();
        }
        session.draggedIds.forEach((id) => {
          const node = nodes.find((n) => n.id === id);
          if (node) {
            const finalX = node.x + session.validDeltaX;
            const finalY = node.y + session.validDeltaY;
            if (node.isSeat) {
              updateSeat(id, { x: finalX, y: finalY });
            } else {
              updateObject(id, { x: finalX, y: finalY });
            }
          }
        });
      }

      commitDragState(null);
      tryReleasePointerCapture(e.currentTarget, e.pointerId);
    },
    [commitDragState, nodes, seats, updateSeat, updateObject],
  );

  return {
    dragState,
    handleNodeDragPointerDown,
    handleNodeDragPointerMove,
    handleNodeDragPointerUp,
    cancelDrag: () => commitDragState(null),
  };
};
