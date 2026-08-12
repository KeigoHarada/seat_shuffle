import React, { useState, useEffect, useRef, useCallback } from "react";
import { useStore } from "../../stores";
import SeatNode from "../SeatNode";
import { Seat } from "../../types";
import { GRID_SIZE, SEAT_COLS, SEAT_ROWS } from "../../constants/canvas";
import { usePanZoom } from "../../hooks/usePanZoom";
import { useCanvasDrag } from "../../hooks/useCanvasDrag";
import { useSelection } from "../../hooks/useSelection";
import CanvasControls from "./CanvasControls";

import CanvasToolbar from "./CanvasToolbar";
import CanvasObjectNode from "./CanvasObjectNode";
import { generateTemplate } from "../../utils/templates";

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
  );

  const {
    selectedIds,
    selectionBox,
    toggleSelection,
    selectOnly,
    clearSelection,
    startSelectionBox,
    updateSelectionBox,
    endSelectionBox,
  } = useSelection(seats, objects);

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    worldX: number;
    worldY: number;
  } | null>(null);

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

  const handleDeleteSelected = useCallback(() => {
    selectedIds.forEach((id) => {
      removeSeat(id);
      removeObject(id);
    });
    clearSelection();
    setContextMenu(null);
  }, [selectedIds, removeSeat, removeObject, clearSelection]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        )
          return;
        handleDeleteSelected();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDeleteSelected]);

  const handleAddSeatFromMenu = () => {
    if (!contextMenu) return;

    const x = Math.floor(contextMenu.worldX / GRID_SIZE);
    const y = Math.floor(contextMenu.worldY / GRID_SIZE);

    const collision = seats.find(
      (s) =>
        x < s.x + SEAT_COLS &&
        x + SEAT_COLS > s.x &&
        y < s.y + SEAT_ROWS &&
        y + SEAT_ROWS > s.y,
    );
    if (!collision) {
      const newSeat: Seat = {
        id: crypto.randomUUID(),
        studentId: null,
        groupIds: [],
        x,
        y,
        isLocked: false,
      };
      addSeat(newSeat);
    }
  };

  const getCenterGridPos = () => {
    if (!viewportRef.current) return { x: 0, y: 0 };
    const rect = viewportRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const worldX = (centerX - pan.x) / scale;
    const worldY = (centerY - pan.y) / scale;
    return {
      x: Math.max(0, Math.floor(worldX / GRID_SIZE)),
      y: Math.max(0, Math.floor(worldY / GRID_SIZE)),
    };
  };

  const handleAddSeatCentered = () => {
    const { x, y } = getCenterGridPos();
    const collision = seats.find(
      (s) =>
        x < s.x + SEAT_COLS &&
        x + SEAT_COLS > s.x &&
        y < s.y + SEAT_ROWS &&
        y + SEAT_ROWS > s.y,
    );
    if (!collision) {
      addSeat({
        id: crypto.randomUUID(),
        studentId: null,
        groupIds: [],
        x,
        y,
        isLocked: false,
      });
    }
  };

  const handleAddRectangle = () => {
    const { x, y } = getCenterGridPos();
    addObject({
      id: crypto.randomUUID(),
      type: "rectangle",
      x,
      y,
      width: 12,
      height: 6,
    });
  };

  const handleAddCircle = () => {
    const { x, y } = getCenterGridPos();
    addObject({
      id: crypto.randomUUID(),
      type: "circle",
      x,
      y,
      width: 12,
      height: 12,
    });
  };

  const handleApplyTemplate = (templateId: string) => {
    const { x, y } = getCenterGridPos();
    const { seats: newSeats, objects: newObjects } = generateTemplate(
      templateId,
      x,
      y,
    );
    newSeats.forEach(addSeat);
    newObjects.forEach(addObject);
  };

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
      const worldX = (e.clientX - rect.left - pan.x) / scale;
      const worldY = (e.clientY - rect.top - pan.y) / scale;
      startSelectionBox(worldX, worldY);
    }
  };

  const onCanvasPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    handlePointerMove(e);
    if (isMarqueeRef.current && viewportRef.current) {
      const rect = viewportRef.current.getBoundingClientRect();
      const worldX = (e.clientX - rect.left - pan.x) / scale;
      const worldY = (e.clientY - rect.top - pan.y) / scale;
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
          setContextMenu({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            worldX: (e.clientX - rect.left - pan.x) / scale,
            worldY: (e.clientY - rect.top - pan.y) / scale,
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

      {contextMenu && (
        <div
          style={{
            position: "absolute",
            left: contextMenu.x,
            top: contextMenu.y,
            backgroundColor: "var(--c-surface)",
            border: "1px solid var(--c-border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-lg)",
            padding: "4px 0",
            zIndex: 1000,
            minWidth: 150,
            display: "flex",
            flexDirection: "column",
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              handleAddSeatFromMenu();
              setContextMenu(null);
            }}
            style={{
              padding: "8px 16px",
              textAlign: "left",
              background: "none",
              border: "none",
              color: "var(--c-text-main)",
              fontSize: 14,
              cursor: "pointer",
              transition: "background-color 0.1s",
              width: "100%",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--c-surface-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            座席を新規作成
          </button>

          {selectedIds.length > 0 && (
            <button
              onClick={() => {
                handleDeleteSelected();
                setContextMenu(null);
              }}
              style={{
                padding: "8px 16px",
                textAlign: "left",
                background: "none",
                border: "none",
                color: "var(--c-danger)",
                fontSize: 14,
                cursor: "pointer",
                transition: "background-color 0.1s",
                width: "100%",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--c-surface-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              削除
            </button>
          )}
        </div>
      )}

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
          const isDragging = dragState?.id === obj.id;
          const displayObj = isDragging
            ? { ...obj, x: dragState.visualX, y: dragState.visualY }
            : obj;

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
          const isDragging = dragState?.id === seat.id;
          let displaySeat = seat;
          let isSwapTarget = false;

          if (isDragging && dragState) {
            const renderX = dragState.isSwapMode
              ? dragState.visualX
              : dragState.validX;
            const renderY = dragState.isSwapMode
              ? dragState.visualY
              : dragState.validY;
            displaySeat = { ...seat, x: renderX, y: renderY };
          } else if (dragState?.isSwapMode) {
            const cx = Math.floor(dragState.visualX + SEAT_COLS / 2);
            const cy = Math.floor(dragState.visualY + SEAT_ROWS / 2);
            if (
              cx >= seat.x &&
              cx < seat.x + SEAT_COLS &&
              cy >= seat.y &&
              cy < seat.y + SEAT_ROWS
            ) {
              isSwapTarget = true;
            }
          }

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
    </div>
  );
};

export default Canvas;
