import React, { useState, useRef, useCallback } from "react";
import { useStore } from "../../stores";
import SeatNode from "../SeatNode";
import { GRID_SIZE } from "../../constants/canvas";
import { usePanZoom } from "../../hooks/usePanZoom";
import { useCanvasDrag } from "../../hooks/useCanvasDrag";
import { useSelection } from "../../hooks/useSelection";
import CanvasControls from "./CanvasControls";

import CanvasToolbar from "./CanvasToolbar";
import CanvasObjectNode from "./CanvasObjectNode";
import { useCanvasActions } from "../../hooks/useCanvasActions";
import CanvasContextMenu from "./CanvasContextMenu";
import SeatAssignPopover from "./SeatAssignPopover";
import {
  screenToWorld,
  getSeatDragDisplayProps,
  getObjectDragDisplayProps,
} from "../../utils/canvas";

const Canvas: React.FC = () => {
  const seats = useStore((state) => state.seats);
  const objects = useStore((state) => state.objects);
  const addSeat = useStore((state) => state.addSeat);
  const updateSeat = useStore((state) => state.updateSeat);
  const removeSeat = useStore((state) => state.removeSeat);
  const addObject = useStore((state) => state.addObject);
  const updateObject = useStore((state) => state.updateObject);
  const removeObject = useStore((state) => state.removeObject);
  const canvasTool = useStore((state) => state.canvasTool);
  const setIsSettingsOpen = useStore((state) => state.setIsSettingsOpen);
  const setActiveSettingsTab = useStore((state) => state.setActiveSettingsTab);
  const setHighlightedStudentId = useStore(
    (state) => state.setHighlightedStudentId,
  );

  const {
    pan,
    scale,
    isPanning,
    isZoomMode,
    isSpaceMode,
    viewportRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    resetView,
  } = usePanZoom();

  const {
    selectedIds,
    setSelectedIds,
    selectionBox,
    toggleSelection,
    selectOnly,
    clearSelection,
    startSelectionBox,
    updateSelectionBox,
    endSelectionBox,
  } = useSelection(seats, objects);

  const {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  } = useCanvasDrag(
    seats,
    objects,
    updateSeat,
    updateObject,
    pan,
    scale,
    viewportRef,
    selectedIds,
  );

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    worldX: number;
    worldY: number;
  } | null>(null);

  const [assignPopoverSeatId, setAssignPopoverSeatId] = useState<string | null>(
    null,
  );
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const pointerDownPosRef = useRef({ x: 0, y: 0 });

  const viewportStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    backgroundColor: "var(--c-bg-main)",
    backgroundImage:
      GRID_SIZE * scale > 8
        ? `linear-gradient(to right, var(--c-surface-disabled) 1px, transparent 1px),
           linear-gradient(to bottom, var(--c-surface-disabled) 1px, transparent 1px)`
        : "none",
    backgroundSize: `${GRID_SIZE * scale}px ${GRID_SIZE * scale}px`,
    backgroundPosition: `${pan.x}px ${pan.y}px`,
    position: "relative",
    overflow: "hidden",
    touchAction: "none",
    cursor: isPanning
      ? "grabbing"
      : isZoomMode
        ? "zoom-in"
        : isSpaceMode || canvasTool === "hand"
          ? "grab"
          : "default",
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleNodePointerDown = useCallback(
    (id: string, e: React.PointerEvent) => {
      e.stopPropagation();
      pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
      if (e.ctrlKey || e.metaKey) {
        toggleSelection(id);
      } else if (!selectedIds.includes(id)) {
        selectOnly(id);
      }
    },
    [selectedIds, toggleSelection, selectOnly],
  );

  const handleSeatDoubleClick = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const seat = seats.find((s) => s.id === id);
      if (seat && !seat.studentId) {
        const rect = viewportRef.current?.getBoundingClientRect();
        if (rect) {
          setPopoverPos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
        }
        setAssignPopoverSeatId(id);
      } else if (seat && seat.studentId) {
        setIsSettingsOpen(true);
        setActiveSettingsTab("students");
        setHighlightedStudentId(seat.studentId);
      }
    },
    [seats, setIsSettingsOpen, setActiveSettingsTab, setHighlightedStudentId],
  );

  const {
    handleDeleteSelected,
    handleUnassignSelected,
    handleDuplicate,
    handleAddSeatFromMenu,
    handleAddSeatCentered,
    handleAddRectangle,
    handleAddCircle,
    handleApplyTemplate,
  } = useCanvasActions(
    seats,
    objects,
    addSeat,
    updateSeat,
    removeSeat,
    addObject,
    removeObject,
    selectedIds,
    setSelectedIds,
    clearSelection,
    contextMenu,
    setContextMenu,
    viewportRef,
    pan,
    scale,
  );

  const isMarqueeRef = useRef(false);
  const initialCtrlPressedRef = useRef(false);
  const initialSelectedIdsRef = useRef<string[]>([]);

  const onCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
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
  };

  const onCanvasPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
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
  };

  const onCanvasPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
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
  };

  return (
    <div
      ref={viewportRef}
      style={viewportStyle}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onPointerDown={onCanvasPointerDown}
      onPointerMove={onCanvasPointerMove}
      onPointerUp={onCanvasPointerUp}
      onPointerCancel={onCanvasPointerUp}
      onContextMenu={handleContextMenu}
    >
      <CanvasToolbar
        onAddSeat={handleAddSeatCentered}
        onAddRectangle={handleAddRectangle}
        onAddCircle={handleAddCircle}
        onApplyTemplate={handleApplyTemplate}
      />
      <CanvasControls scale={scale} onResetView={resetView} />

      <CanvasContextMenu
        contextMenu={contextMenu}
        onClose={() => setContextMenu(null)}
        onAddSeat={handleAddSeatFromMenu}
        hasSelection={selectedIds.length > 0}
        onDeleteSelected={handleDeleteSelected}
        onDuplicateSelected={handleDuplicate}
        onUnassignSelected={handleUnassignSelected}
      />

      <div
        style={{
          position: "absolute",
          left: pan.x,
          top: pan.y,
          transform: `scale(${scale})`,
          transformOrigin: "0 0",
          width: 0,
          height: 0,
          overflow: "visible",
        }}
      >
        {objects.map((obj) => {
          const { displayObj, isDragging } = getObjectDragDisplayProps(
            obj,
            dragState,
          );

          return (
            <CanvasObjectNode
              key={obj.id}
              obj={displayObj}
              isDragging={isDragging}
              isSelected={selectedIds.includes(obj.id)}
              scale={scale}
              onDragStart={(e) => handleDragStart(obj.id, e)}
              onDragEnd={handleDragEnd}
              onPointerDown={(e) => handleNodePointerDown(obj.id, e)}
              updateObject={updateObject}
            />
          );
        })}
        {seats.map((seat) => {
          const { displaySeat, isSwapTarget, isDragging } =
            getSeatDragDisplayProps(seat, dragState, seats);

          return (
            <SeatNode
              key={seat.id}
              seat={displaySeat}
              isDragging={isDragging}
              isSwapTarget={isSwapTarget}
              isSelected={selectedIds.includes(seat.id)}
              onDragStart={(e) => handleDragStart(seat.id, e)}
              onDragEnd={handleDragEnd}
              onPointerDown={(e) => handleNodePointerDown(seat.id, e)}
              onDoubleClick={(e) => handleSeatDoubleClick(seat.id, e)}
            />
          );
        })}

        {selectionBox && (
          <div
            style={{
              position: "absolute",
              left: Math.min(selectionBox.startX, selectionBox.currentX),
              top: Math.min(selectionBox.startY, selectionBox.currentY),
              width: Math.abs(selectionBox.currentX - selectionBox.startX),
              height: Math.abs(selectionBox.currentY - selectionBox.startY),
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              border: "1px solid rgba(59, 130, 246, 0.5)",
              pointerEvents: "none",
              zIndex: 9999,
            }}
          />
        )}
      </div>

      <SeatAssignPopover
        isOpen={assignPopoverSeatId !== null}
        onClose={() => setAssignPopoverSeatId(null)}
        targetSeatId={assignPopoverSeatId}
        x={popoverPos.x}
        y={popoverPos.y}
      />
    </div>
  );
};

export default Canvas;
