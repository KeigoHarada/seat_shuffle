import { useState, useCallback, useMemo } from "react";
import { Seat, CanvasObject } from "../types";
import { GRID_SIZE, SEAT_COLS, SEAT_ROWS } from "../constants/canvas";

import { DragNode, checkCollision, screenToWorld } from "../utils/canvas";
import { showToast } from "../stores/toast";

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
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleNodeDragPointerDown = useCallback(
    (id: string, e: React.PointerEvent) => {
      const isRightClick = e.button === 2;
      if (e.button !== 0 && !isRightClick) return;

      const node = nodes.find((n) => n.id === id);
      if (!node) return;

      if (isRightClick && !node.isSeat) return; // Right click swap only for seats

      const draggedIds =
        !isRightClick && selectedIds.includes(id) ? selectedIds : [id];

      setDragState({
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
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [nodes, selectedIds],
  );

  const handleNodeDragPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState) return;
      if (!viewportRef.current) return;

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

      const visualDeltaX = newBaseX - dragState.startX;
      const visualDeltaY = newBaseY - dragState.startY;

      const checkGroupCollision = (dx: number, dy: number) => {
        for (const dragId of dragState.draggedIds) {
          const n = nodes.find((no) => no.id === dragId);
          if (!n || !n.isSeat) continue;

          const hit = checkCollision(
            n.x + dx,
            n.y + dy,
            n.width,
            n.height,
            dragState.draggedIds,
            nodes,
          );
          if (hit) return true;
        }
        return false;
      };

      let nextValidDeltaX = dragState.validDeltaX;
      let nextValidDeltaY = dragState.validDeltaY;

      if (!checkGroupCollision(visualDeltaX, visualDeltaY)) {
        nextValidDeltaX = visualDeltaX;
        nextValidDeltaY = visualDeltaY;
      } else if (!checkGroupCollision(visualDeltaX, dragState.validDeltaY)) {
        nextValidDeltaX = visualDeltaX;
      } else if (!checkGroupCollision(dragState.validDeltaX, visualDeltaY)) {
        nextValidDeltaY = visualDeltaY;
      }

      if (
        visualDeltaX !== dragState.visualDeltaX ||
        visualDeltaY !== dragState.visualDeltaY ||
        nextValidDeltaX !== dragState.validDeltaX ||
        nextValidDeltaY !== dragState.validDeltaY
      ) {
        setDragState({
          ...dragState,
          visualDeltaX,
          visualDeltaY,
          validDeltaX: nextValidDeltaX,
          validDeltaY: nextValidDeltaY,
        });
      }
    },
    [dragState, dragOffset, pan, scale, nodes, viewportRef],
  );

  const handleNodeDragPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState) return;

      const draggingNode = nodes.find((n) => n.id === dragState.baseId);
      if (!draggingNode) {
        setDragState(null);
        return;
      }

      if (dragState.isSwapMode && draggingNode.isSeat) {
        const cx = Math.floor(
          draggingNode.x + dragState.visualDeltaX + draggingNode.width / 2,
        );
        const cy = Math.floor(
          draggingNode.y + dragState.visualDeltaY + draggingNode.height / 2,
        );
        const targetNode = nodes.find(
          (n) =>
            cx >= n.x &&
            cx < n.x + n.width &&
            cy >= n.y &&
            cy < n.y + n.height &&
            n.id !== dragState.baseId,
        );

        if (targetNode && targetNode.isSeat) {
          if (draggingNode.isLocked || targetNode.isLocked) {
            showToast.error("ロックされた座席はスワップできません。");
          } else {
            const s1 = seats.find((s) => s.id === draggingNode.id);
            const s2 = seats.find((s) => s.id === targetNode.id);
            if (s1 && s2) {
              updateSeat(s1.id, { studentId: s2.studentId });
              updateSeat(s2.id, { studentId: s1.studentId });
            }
          }
        }
      } else {
        dragState.draggedIds.forEach((id) => {
          const node = nodes.find((n) => n.id === id);
          if (node) {
            const finalX = node.x + dragState.validDeltaX;
            const finalY = node.y + dragState.validDeltaY;
            if (node.isSeat) {
              updateSeat(id, { x: finalX, y: finalY });
            } else {
              updateObject(id, { x: finalX, y: finalY });
            }
          }
        });
      }

      setDragState(null);
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    },
    [dragState, nodes, seats, updateSeat, updateObject],
  );

  const handleSwapPointerDown = useCallback(
    (id: string, e: React.PointerEvent) => {
      if (e.button !== 2) return;
      const node = nodes.find((n) => n.id === id);
      if (!node || !node.isSeat) return;

      setDragState({
        baseId: id,
        draggedIds: [id],
        startX: node.x,
        startY: node.y,
        visualDeltaX: 0,
        visualDeltaY: 0,
        validDeltaX: 0,
        validDeltaY: 0,
        isSwapMode: true,
      });

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [nodes],
  );

  const handleSwapPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState || !dragState.isSwapMode) return;
      if (!viewportRef.current) return;

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

      const visualDeltaX = newBaseX - dragState.startX;
      const visualDeltaY = newBaseY - dragState.startY;

      if (
        visualDeltaX !== dragState.visualDeltaX ||
        visualDeltaY !== dragState.visualDeltaY
      ) {
        setDragState({
          ...dragState,
          visualDeltaX,
          visualDeltaY,
        });
      }
    },
    [dragState, dragOffset, pan, scale, viewportRef],
  );

  const handleSwapPointerUp = useCallback(() => {
    if (!dragState || !dragState.isSwapMode) return;

    const draggingNode = nodes.find((n) => n.id === dragState.baseId);
    if (!draggingNode || !draggingNode.isSeat) {
      setDragState(null);
      return;
    }

    const cx = Math.floor(
      draggingNode.x + dragState.visualDeltaX + draggingNode.width / 2,
    );
    const cy = Math.floor(
      draggingNode.y + dragState.visualDeltaY + draggingNode.height / 2,
    );
    const targetNode = nodes.find(
      (n) =>
        cx >= n.x &&
        cx < n.x + n.width &&
        cy >= n.y &&
        cy < n.y + n.height &&
        n.id !== dragState.baseId,
    );

    if (targetNode && targetNode.isSeat) {
      if (draggingNode.isLocked || targetNode.isLocked) {
        showToast.error("ロックされた座席はスワップできません。");
      } else {
        const s1 = seats.find((s) => s.id === draggingNode.id);
        const s2 = seats.find((s) => s.id === targetNode.id);
        if (s1 && s2) {
          updateSeat(s1.id, { studentId: s2.studentId });
          updateSeat(s2.id, { studentId: s1.studentId });
        }
      }
    }

    setDragState(null);
  }, [dragState, nodes, seats, updateSeat]);

  return {
    dragState,
    handleNodeDragPointerDown,
    handleNodeDragPointerMove,
    handleNodeDragPointerUp,
  };
};
