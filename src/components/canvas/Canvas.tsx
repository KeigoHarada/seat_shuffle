import React, { useState, useRef, useCallback } from "react";
import { useStore } from "../../stores";
import { GRID_SIZE } from "../../constants/canvas";
import { usePanZoom } from "../../hooks/usePanZoom";
import { useCanvasDrag } from "../../hooks/useCanvasDrag";
import { useSelection } from "../../hooks/useSelection";
import CanvasControls from "./CanvasControls";

import CanvasToolbar from "./CanvasToolbar";
import CanvasNodes from "./CanvasNodes";
import { useCanvasActions } from "../../hooks/useCanvasActions";
import CanvasContextMenu from "./CanvasContextMenu";
import SeatAssignPopover from "./SeatAssignPopover";
import GroupAssignPopover from "./GroupAssignPopover";
import { screenToWorld } from "../../utils/canvas";
import { showToast } from "../../stores/toast";

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
  const students = useStore((state) => state.students);

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
    handleSwapPointerDown,
    handleSwapPointerMove,
    handleSwapPointerUp,
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

  const [showGroupPopover, setShowGroupPopover] = useState(false);
  const [groupPopoverPos, setGroupPopoverPos] = useState({ x: 0, y: 0 });

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
    handleToggleLockSelected,
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

  const handleAutoAssign = useCallback(() => {
    const assignedStudentIds = new Set(
      seats.map((s) => s.studentId).filter(Boolean),
    );
    const unassignedStudents = students.filter(
      (s) => !assignedStudentIds.has(s.id),
    );

    const availableSeats = seats.filter((s) => !s.studentId && !s.isLocked);

    if (unassignedStudents.length === 0) {
      showToast.info("割り当て待ちの生徒がいません。");
      return;
    }

    if (availableSeats.length === 0) {
      showToast.error("空席がありません。座席を追加してください。");
      return;
    }

    const shuffledStudents = [...unassignedStudents].sort(
      () => Math.random() - 0.5,
    );
    const shuffledSeats = [...availableSeats].sort(() => Math.random() - 0.5);

    const assignCount = Math.min(shuffledStudents.length, shuffledSeats.length);
    for (let i = 0; i < assignCount; i++) {
      updateSeat(shuffledSeats[i].id, { studentId: shuffledStudents[i].id });
    }
    showToast.success(`${assignCount}人の生徒を自動割り当てしました！`);
  }, [seats, students, updateSeat]);

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
        onAutoAssign={handleAutoAssign}
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
        onAssignGroupSelected={() => {
          if (contextMenu) {
            setGroupPopoverPos({ x: contextMenu.x, y: contextMenu.y });
            setShowGroupPopover(true);
          }
        }}
        isAllSelectedLocked={selectedIds
          .map((id) => seats.find((s) => s.id === id))
          .filter((seat) => seat && seat.studentId)
          .every((seat) => seat?.isLocked)}
        hasSelectedSeats={selectedIds.some((id) =>
          seats.some((s) => s.id === id),
        )}
        hasOccupiedSeats={selectedIds.some((id) => {
          const seat = seats.find((s) => s.id === id);
          return seat && seat.studentId;
        })}
        hasSingleEmptySeat={
          selectedIds.length === 1 &&
          seats.some((s) => s.id === selectedIds[0] && !s.studentId)
        }
        onAssignStudentSelected={() => {
          if (contextMenu && selectedIds.length === 1) {
            setPopoverPos({ x: contextMenu.x, y: contextMenu.y });
            setAssignPopoverSeatId(selectedIds[0]);
          }
        }}
        onToggleLockSelected={handleToggleLockSelected}
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
        <CanvasNodes
          seats={seats}
          objects={objects}
          dragState={dragState}
          selectedIds={selectedIds}
          scale={scale}
          handleDragStart={handleDragStart}
          handleDragEnd={handleDragEnd}
          handleNodePointerDown={handleNodePointerDown}
          handleSeatDoubleClick={handleSeatDoubleClick}
          updateObject={updateObject}
          selectionBox={selectionBox}
          handleSwapPointerDown={handleSwapPointerDown}
          handleSwapPointerMove={handleSwapPointerMove}
          handleSwapPointerUp={handleSwapPointerUp}
        />
      </div>

      <SeatAssignPopover
        isOpen={assignPopoverSeatId !== null}
        onClose={() => setAssignPopoverSeatId(null)}
        targetSeatId={assignPopoverSeatId}
        x={popoverPos.x}
        y={popoverPos.y}
      />

      <GroupAssignPopover
        isOpen={showGroupPopover}
        onClose={() => setShowGroupPopover(false)}
        targetSeatIds={selectedIds}
        x={groupPopoverPos.x}
        y={groupPopoverPos.y}
      />
    </div>
  );
};

export default Canvas;
