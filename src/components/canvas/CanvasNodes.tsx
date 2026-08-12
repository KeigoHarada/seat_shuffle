import React from "react";
import CanvasObjectNode from "./CanvasObjectNode";
import SeatNode from "../SeatNode";
import { Seat, CanvasObject } from "../../types";
import {
  getSeatDragDisplayProps,
  getObjectDragDisplayProps,
} from "../../utils/canvas";

interface Props {
  seats: Seat[];
  objects: CanvasObject[];
  dragState: any;
  selectedIds: string[];
  scale: number;
  handleDragStart: (id: string, e: React.DragEvent) => void;
  handleDragEnd: () => void;
  handleNodePointerDown: (id: string, e: React.PointerEvent) => void;
  handleSeatDoubleClick: (id: string, e: React.MouseEvent) => void;
  updateObject: (id: string, updates: Partial<CanvasObject>) => void;
  selectionBox: any;
  handleSwapPointerDown: (id: string, e: React.PointerEvent) => void;
  handleSwapPointerMove: (e: React.PointerEvent) => void;
  handleSwapPointerUp: (e: React.PointerEvent) => void;
}

const CanvasNodes: React.FC<Props> = ({
  seats,
  objects,
  dragState,
  selectedIds,
  scale,
  handleDragStart,
  handleDragEnd,
  handleNodePointerDown,
  handleSeatDoubleClick,
  updateObject,
  selectionBox,
  handleSwapPointerDown,
  handleSwapPointerMove,
  handleSwapPointerUp,
}) => {
  return (
    <>
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
        const { displaySeat, isSwapTarget, isDragging, ghostSeat } =
          getSeatDragDisplayProps(seat, dragState, seats);

        return (
          <SeatNode
            key={seat.id}
            seat={displaySeat}
            isDragging={isDragging && !ghostSeat}
            isSwapTarget={isSwapTarget}
            isSelected={selectedIds.includes(seat.id)}
            onDragStart={(e) => handleDragStart(seat.id, e)}
            onDragEnd={handleDragEnd}
            onPointerDown={(e) => {
              handleNodePointerDown(seat.id, e);
              handleSwapPointerDown(seat.id, e);
            }}
            onPointerMove={handleSwapPointerMove}
            onPointerUp={handleSwapPointerUp}
            onDoubleClick={(e) => handleSeatDoubleClick(seat.id, e)}
          />
        );
      })}
      {seats.map((seat) => {
        const { ghostSeat } = getSeatDragDisplayProps(seat, dragState, seats);
        if (!ghostSeat) return null;

        return (
          <SeatNode
            key={`ghost-${seat.id}`}
            seat={ghostSeat}
            isDragging={true}
            isGhost={true}
            onDragStart={() => {}}
            onDragEnd={() => {}}
            onPointerDown={() => {}}
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
    </>
  );
};

export default CanvasNodes;
