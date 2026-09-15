import React, { useState, useCallback } from "react";
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
import { showToast } from "../../stores/toast";
import { autoAssignStudents } from "../../utils/algorithm";
import { useCanvasPointerEvents } from "../../hooks/useCanvasPointerEvents";
import { useNodeEvents } from "../../hooks/useNodeEvents";

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
  const isViewMode = useStore((state) => state.isViewMode);

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
  } = usePanZoom(seats, objects);

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
    handleNodeDragPointerDown,
    handleNodeDragPointerMove,
    handleNodeDragPointerUp,
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
    userSelect: "none",
    WebkitUserSelect: "none",
    cursor: isPanning
      ? "grabbing"
      : isZoomMode
        ? "zoom-in"
        : isSpaceMode || canvasTool === "hand" || isViewMode
          ? "grab"
          : "default",
  };

  const {
    handleContextMenu,
    onCanvasPointerDown,
    onCanvasPointerMove,
    onCanvasPointerUp,
    updatePointerDownPos,
  } = useCanvasPointerEvents({
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
  });

  const { handleNodePointerDown, handleSeatDoubleClick } = useNodeEvents({
    seats,
    selectedIds,
    toggleSelection,
    selectOnly,
    viewportRef,
    setPopoverPos,
    setAssignPopoverSeatId,
    setIsSettingsOpen,
    setActiveSettingsTab,
    setHighlightedStudentId,
    updatePointerDownPos,
  });

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
    const algorithm = useStore.getState().appSettings.autoAssignAlgorithm;
    const { assignments, error } = autoAssignStudents(
      seats,
      students,
      algorithm,
    );

    if (error) {
      if (error.includes("空席")) {
        showToast.error(error);
      } else {
        showToast.info(error);
      }
      return;
    }

    assignments.forEach(({ seatId, studentId }) => {
      updateSeat(seatId, { studentId });
    });

    showToast.success(`${assignments.length}人の生徒を自動割り当てしました！`);
  }, [seats, students, updateSeat]);

  const selectedSeats = selectedIds
    .map((id) => seats.find((s) => s.id === id))
    .filter((s): s is typeof s & {} => s !== undefined);

  const hasSelectedSeats = selectedSeats.length > 0;
  const occupiedSelectedSeats = selectedSeats.filter((s) => s.studentId);
  const hasOccupiedSeats = occupiedSelectedSeats.length > 0;
  const isAllSelectedLocked =
    hasOccupiedSeats && occupiedSelectedSeats.every((s) => s.isLocked);
  const hasSingleEmptySeat =
    selectedIds.length === 1 &&
    selectedSeats.length === 1 &&
    !selectedSeats[0].studentId;

  return (
    <div
      id="canvas-main-area"
      ref={viewportRef}
      style={viewportStyle}
      onPointerDown={onCanvasPointerDown}
      onPointerMove={onCanvasPointerMove}
      onPointerUp={onCanvasPointerUp}
      onPointerCancel={onCanvasPointerUp}
      onContextMenu={handleContextMenu}
    >
      {!isViewMode && (
        <CanvasToolbar
          onAddSeat={handleAddSeatCentered}
          onAddRectangle={handleAddRectangle}
          onAddCircle={handleAddCircle}
          onApplyTemplate={handleApplyTemplate}
          onAutoAssign={handleAutoAssign}
        />
      )}
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
        isAllSelectedLocked={isAllSelectedLocked}
        hasSelectedSeats={hasSelectedSeats}
        hasOccupiedSeats={hasOccupiedSeats}
        hasSingleEmptySeat={hasSingleEmptySeat}
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
          handleNodePointerDown={isViewMode ? () => {} : handleNodePointerDown}
          handleSeatDoubleClick={isViewMode ? () => {} : handleSeatDoubleClick}
          updateObject={updateObject}
          selectionBox={selectionBox}
          handleNodeDragPointerDown={
            isViewMode ? () => {} : handleNodeDragPointerDown
          }
          handleNodeDragPointerMove={
            isViewMode ? () => {} : handleNodeDragPointerMove
          }
          handleNodeDragPointerUp={
            isViewMode ? () => {} : handleNodeDragPointerUp
          }
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
