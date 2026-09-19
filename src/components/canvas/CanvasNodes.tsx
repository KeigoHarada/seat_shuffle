import React from "react";
import CanvasObjectNode from "./CanvasObjectNode";
import SeatNode from "../SeatNode";
import { Seat } from "../../types/seat";
import { CanvasObject } from "../../types/canvas";
import {
  getSeatDragDisplayProps,
  getObjectDragDisplayProps,
} from "../../services/canvasGeometry";

interface Props {
  seats: Seat[];
  objects: CanvasObject[];
  dragState: any;
  selectedIds: string[];
  scale: number;
  handleNodeDragPointerDown: (id: string, e: React.PointerEvent) => void;
  handleNodeDragPointerMove: (e: React.PointerEvent) => void;
  handleNodeDragPointerUp: (e: React.PointerEvent) => void;
  handleNodePointerDown: (id: string, e: React.PointerEvent) => void;
  handleNodeLongPressMove: (e: React.PointerEvent) => void;
  handleNodeLongPressUp: (id: string, e: React.PointerEvent) => void;
  handleSeatDoubleClick: (id: string, e: React.MouseEvent) => void;
  updateObject: (id: string, updates: Partial<CanvasObject>) => void;
  selectionBox: any;
}

const CanvasNodes: React.FC<Props> = ({
  seats,
  objects,
  dragState,
  selectedIds,
  scale,
  handleNodeDragPointerDown,
  handleNodeDragPointerMove,
  handleNodeDragPointerUp,
  handleNodePointerDown,
  handleNodeLongPressMove,
  handleNodeLongPressUp,
  handleSeatDoubleClick,
  updateObject,
  selectionBox,
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
            onPointerDown={(e) => {
              handleNodePointerDown(obj.id, e);
              handleNodeDragPointerDown(obj.id, e);
            }}
            onPointerMove={(e) => {
              handleNodeLongPressMove(e);
              handleNodeDragPointerMove(e);
            }}
            onPointerUp={(e) => {
              handleNodeLongPressUp(obj.id, e);
              handleNodeDragPointerUp(e);
            }}
            onPointerCancel={(e) => {
              handleNodeLongPressUp(obj.id, e);
              handleNodeDragPointerUp(e);
            }}
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
            onPointerDown={(e) => {
              handleNodePointerDown(seat.id, e);
              handleNodeDragPointerDown(seat.id, e);
            }}
            onPointerMove={(e) => {
              handleNodeLongPressMove(e);
              handleNodeDragPointerMove(e);
            }}
            onPointerUp={(e) => {
              handleNodeLongPressUp(seat.id, e);
              handleNodeDragPointerUp(e);
            }}
            onPointerCancel={(e) => {
              handleNodeLongPressUp(seat.id, e);
              handleNodeDragPointerUp(e);
            }}
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
