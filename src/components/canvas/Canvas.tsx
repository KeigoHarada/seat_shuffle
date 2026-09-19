import React, { useRef } from "react";
import { useStore } from "../../stores/appStore";
import { GRID_SIZE } from "../../constants/canvas";
import { usePanZoom } from "./hooks/usePanZoom";
import { useCanvasDrag } from "./hooks/useCanvasDrag";
import { useSelection } from "./hooks/useSelection";
import CanvasControls from "./CanvasControls";
import CanvasToolbar from "./CanvasToolbar";
import CanvasNodes from "./CanvasNodes";
import { useCanvasActions } from "./hooks/useCanvasActions";
import CanvasContextMenu from "./CanvasContextMenu";
import SeatAssignPopover from "./SeatAssignPopover";
import GroupAssignPopover from "./GroupAssignPopover";
import { useCanvasPointerEvents } from "./hooks/useCanvasPointerEvents";
import { useNodeEvents } from "./hooks/useNodeEvents";
import { useAutoAssignAction } from "./hooks/useAutoAssignAction";
import { useCanvasOverlayStore } from "../../stores/canvasOverlay";

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
  const isViewMode = useStore((state) => state.isViewMode);

  const assignPopoverSeatId = useCanvasOverlayStore(
    (state) => state.assignPopoverSeatId,
  );
  const popoverPos = useCanvasOverlayStore((state) => state.popoverPos);
  const showGroupPopover = useCanvasOverlayStore(
    (state) => state.showGroupPopover,
  );
  const groupPopoverPos = useCanvasOverlayStore(
    (state) => state.groupPopoverPos,
  );
  const closeSeatAssignPopover = useCanvasOverlayStore(
    (state) => state.closeSeatAssignPopover,
  );
  const closeGroupAssignPopover = useCanvasOverlayStore(
    (state) => state.closeGroupAssignPopover,
  );
  const openSeatAssignPopover = useCanvasOverlayStore(
    (state) => state.openSeatAssignPopover,
  );
  const openGroupAssignPopover = useCanvasOverlayStore(
    (state) => state.openGroupAssignPopover,
  );

  const {
    pan,
    scale,
    isPanning,
    isZoomMode,
    isSpaceMode,
    viewportRef,
    trackPointer,
    getPointerCount,
    promoteToPinch,
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
    cancelDrag,
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

  const cancelNodeLongPressRef = useRef(() => {});

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
    onCanvasPointerDownCapture,
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
    trackPointer,
    getPointerCount,
    promoteToPinch,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    cancelDrag,
    cancelNodeLongPress: () => cancelNodeLongPressRef.current(),
  });

  const {
    handleNodePointerDown,
    handleNodeLongPressMove,
    handleNodeLongPressUp,
    handleSeatDoubleClick,
    cancelNodeLongPress,
  } = useNodeEvents({
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
    updatePointerDownPos,
  });
  cancelNodeLongPressRef.current = cancelNodeLongPress;

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
    viewportRef,
    pan,
    scale,
  );

  const { handleAutoAssign } = useAutoAssignAction();

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
      data-selected-count={selectedIds.length}
      style={viewportStyle}
      onPointerDownCapture={onCanvasPointerDownCapture}
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
        onAddSeat={handleAddSeatFromMenu}
        hasSelection={selectedIds.length > 0}
        onDeleteSelected={handleDeleteSelected}
        onDuplicateSelected={handleDuplicate}
        onUnassignSelected={handleUnassignSelected}
        onAssignGroupSelected={() => {
          const menu = useCanvasOverlayStore.getState().contextMenu;
          if (menu) {
            openGroupAssignPopover({ x: menu.x, y: menu.y });
          }
        }}
        isAllSelectedLocked={isAllSelectedLocked}
        hasSelectedSeats={hasSelectedSeats}
        hasOccupiedSeats={hasOccupiedSeats}
        hasSingleEmptySeat={hasSingleEmptySeat}
        onAssignStudentSelected={() => {
          const menu = useCanvasOverlayStore.getState().contextMenu;
          if (menu && selectedIds.length === 1) {
            openSeatAssignPopover(selectedIds[0], { x: menu.x, y: menu.y });
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
          zIndex: 1,
        }}
      >
        <CanvasNodes
          seats={seats}
          objects={objects}
          dragState={dragState}
          selectedIds={selectedIds}
          scale={scale}
          handleNodePointerDown={isViewMode ? () => {} : handleNodePointerDown}
          handleNodeLongPressMove={
            isViewMode ? () => {} : handleNodeLongPressMove
          }
          handleNodeLongPressUp={isViewMode ? () => {} : handleNodeLongPressUp}
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
        onClose={closeSeatAssignPopover}
        targetSeatId={assignPopoverSeatId}
        x={popoverPos.x}
        y={popoverPos.y}
      />

      <GroupAssignPopover
        isOpen={showGroupPopover}
        onClose={closeGroupAssignPopover}
        targetSeatIds={selectedIds}
        x={groupPopoverPos.x}
        y={groupPopoverPos.y}
      />
    </div>
  );
};

export default Canvas;
