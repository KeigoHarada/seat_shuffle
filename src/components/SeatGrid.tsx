import React from 'react';
import { useSeatStore } from '../stores/seatStore';

export const SeatGrid: React.FC = () => {
  const { currentLayout, students, isShuffling, removeStudentFromSeat } = useSeatStore();

  if (!currentLayout) {
    return (
      <div className="flex-center" style={{ minHeight: '400px' }}>
        <p className="text-body">席配置を作成してください</p>
      </div>
    );
  }

  const getStudentName = (studentId?: string) => {
    if (!studentId) return '';
    const student = students.find(s => s.id === studentId);
    return student?.name || '';
  };

  return (
    <div className="seat-grid" style={{ 
      display: 'grid', 
      gridTemplateColumns: `repeat(${currentLayout.cols}, 1fr)`,
      gap: 'var(--spacing-sm)',
      maxWidth: 'fit-content',
      margin: '0 auto',
      padding: 'var(--spacing-lg)'
    }}>
      {currentLayout.seats.map((seat) => (
        <div
          key={seat.id}
          className={`seat ${seat.isEmpty ? 'empty' : seat.studentId ? 'occupied' : ''} ${isShuffling ? 'shuffling' : ''}`}
          onClick={() => {
            if (seat.studentId) {
              removeStudentFromSeat(seat.id);
            }
          }}
          style={{
            animationDelay: `${Math.random() * 0.5}s`
          }}
        >
          {seat.isEmpty ? (
            <span style={{ opacity: 0.5 }}>空席</span>
          ) : seat.studentId ? (
            <span>{getStudentName(seat.studentId)}</span>
          ) : (
            <span style={{ opacity: 0.3 }}>{seat.row + 1}-{seat.col + 1}</span>
          )}
        </div>
      ))}
    </div>
  );
};
