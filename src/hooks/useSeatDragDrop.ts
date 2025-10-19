import { useState } from 'react';
import { useSeatStore } from '../stores/seatStore';

export const useSeatDragDrop = () => {
  const { 
    currentLayout, 
    swapSeats, 
    assignStudentToSeat, 
    removeStudentFromSeat 
  } = useSeatStore();

  const [draggedSeatId, setDraggedSeatId] = useState<string | null>(null);
  const [dragOverSeatId, setDragOverSeatId] = useState<string | null>(null);
  const [swappedSeats, setSwappedSeats] = useState<Set<string>>(new Set());

  const handleDragStart = (e: React.DragEvent, seatId: string) => {
    if (!currentLayout) return;
    
    const seat = currentLayout.seats.find(s => s.id === seatId);
    if (!seat || seat.isEmpty || !seat.studentId) return;

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

    // 両方の席に生徒がいる場合は交換
    if (draggedSeat.studentId && targetSeat.studentId) {
      swapSeats(draggedSeatId, targetSeatId);
      setSwappedSeats(new Set([draggedSeatId, targetSeatId]));
      setTimeout(() => setSwappedSeats(new Set()), 1000);
    }
    // ドラッグ元に生徒がいて、ターゲットが空席の場合は移動
    else if (draggedSeat.studentId && !targetSeat.studentId && !targetSeat.isEmpty) {
      assignStudentToSeat(draggedSeat.studentId, targetSeatId);
      removeStudentFromSeat(draggedSeatId);
    }

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
