import { useState } from 'react';
import { useSeatStore } from '../stores/seatStore';

export const useSeatDragDrop = () => {
  const { 
    currentLayout, 
    swapSeats
  } = useSeatStore();

  const [draggedSeatId, setDraggedSeatId] = useState<string | null>(null);
  const [dragOverSeatId, setDragOverSeatId] = useState<string | null>(null);
  const [swappedSeats, setSwappedSeats] = useState<Set<string>>(new Set());

  const handleDragStart = (e: React.DragEvent, seatId: string) => {
    if (!currentLayout) return;
    
    const seat = currentLayout.seats.find(s => s.id === seatId);
    if (!seat) return;

    setDraggedSeatId(seatId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', seatId);
  };

  const handleDragOver = (e: React.DragEvent, seatId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSeatId(seatId);
  };

  const handleDragLeave = () => {
    setDragOverSeatId(null);
  };

  const handleDrop = (e: React.DragEvent, targetSeatId: string) => {
    e.preventDefault();
    setDragOverSeatId(null);

    if (!draggedSeatId || draggedSeatId === targetSeatId || !currentLayout) {
      setDraggedSeatId(null);
      return;
    }

    const draggedSeat = currentLayout.seats.find(s => s.id === draggedSeatId);
    const targetSeat = currentLayout.seats.find(s => s.id === targetSeatId);

    if (!draggedSeat || !targetSeat) {
      setDraggedSeatId(null);
      return;
    }

    // 全ての席の組み合わせで交換を実行
    swapSeats(draggedSeatId, targetSeatId);
    setSwappedSeats(new Set([draggedSeatId, targetSeatId]));
    setTimeout(() => setSwappedSeats(new Set()), 1000);

    setDraggedSeatId(null);
  };

  const handleDragEnd = () => {
    setDraggedSeatId(null);
    setDragOverSeatId(null);
  };

  return {
    draggedSeatId,
    dragOverSeatId,
    swappedSeats,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd
  };
};
