import React, { useState, useEffect } from 'react';
import { useSeatStore } from '../stores/seatStore';

export const SeatGrid: React.FC = () => {
  const { 
    currentLayout, 
    students, 
    isShuffling, 
    selectedSeatId,
    setSelectedSeatId,
    swapSeats,
    assignStudentNameToSeat,
    toggleSeatEmpty,
    initializeDefaultLayout
  } = useSeatStore();
  
  const [editingSeatId, setEditingSeatId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [focusedSeatId, setFocusedSeatId] = useState<string | null>(null);

  // デフォルトレイアウトを初期化
  useEffect(() => {
    initializeDefaultLayout();
  }, [initializeDefaultLayout]);

  // キーボードイベントハンドラー
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentLayout) return;

      // 編集中は入力フィールド内で処理するため、グローバルでは処理しない
      if (e.key === 'Tab' && focusedSeatId && !editingSeatId) {
        e.preventDefault();
        e.stopPropagation();
        const currentIndex = currentLayout.seats.findIndex(seat => seat.id === focusedSeatId);
        const nextIndex = (currentIndex + 1) % currentLayout.seats.length;
        const nextSeat = currentLayout.seats[nextIndex];
        setFocusedSeatId(nextSeat.id);
      } else if (e.key === 'Enter' && focusedSeatId && !editingSeatId) {
        e.preventDefault();
        const seat = currentLayout.seats.find(s => s.id === focusedSeatId);
        if (seat) {
          handleDoubleClick(focusedSeatId, getStudentName(seat.studentId));
        }
      } else if (e.key === 'Escape' && !editingSeatId) {
        setFocusedSeatId(null);
      }
    };

    // 編集中でない場合のみイベントリスナーを追加
    if (!editingSeatId) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentLayout, focusedSeatId, editingSeatId]);

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

  const handleClick = (seatId: string) => {
    setFocusedSeatId(seatId);
  };

  const handleDoubleClick = (seatId: string, currentName: string) => {
    setEditingSeatId(seatId);
    setEditingName(currentName);
    setFocusedSeatId(null);
  };

  const handleRightClick = (e: React.MouseEvent, seatId: string) => {
    e.preventDefault();
    
    if (selectedSeatId) {
      // 席交換
      if (selectedSeatId !== seatId) {
        swapSeats(selectedSeatId, seatId);
      }
      setSelectedSeatId(null);
    } else {
      // 空席設定または選択
      const seat = currentLayout.seats.find(s => s.id === seatId);
      if (seat && !seat.studentId) {
        // 名前が入っていない場合は空席に変更
        toggleSeatEmpty(seatId);
      } else if (seat && seat.studentId) {
        // 名前が入っている場合は選択
        setSelectedSeatId(seatId);
      }
    }
  };

  const handleNameSubmit = (seatId: string) => {
    if (editingName.trim()) {
      assignStudentNameToSeat(seatId, editingName.trim());
    }
    setEditingSeatId(null);
    setEditingName('');
  };

  const handleNameCancel = () => {
    setEditingSeatId(null);
    setEditingName('');
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
      {currentLayout.seats.map((seat, index) => (
        <div
          key={seat.id}
          className={`seat ${seat.isEmpty ? 'empty' : seat.studentId ? 'occupied' : ''} ${isShuffling ? 'shuffling' : ''} ${selectedSeatId === seat.id ? 'selected' : ''} ${focusedSeatId === seat.id ? 'focused' : ''}`}
          onClick={() => handleClick(seat.id)}
          onDoubleClick={() => handleDoubleClick(seat.id, getStudentName(seat.studentId))}
          onContextMenu={(e) => handleRightClick(e, seat.id)}
          style={{
            animationDelay: `${Math.random() * 0.5}s`,
            position: 'relative'
          }}
        >
          {/* 席番号 */}
          <div style={{
            position: 'absolute',
            top: '2px',
            left: '2px',
            fontSize: '10px',
            color: 'var(--color-secondary-500)',
            fontWeight: 'bold'
          }}>
            {index + 1}
          </div>
          
          {/* 編集モード */}
          {editingSeatId === seat.id ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' }}>
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleNameSubmit(seat.id);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Tab') {
                    e.preventDefault();
                    e.stopPropagation();
                    // 名前を登録して次の席に移動
                    if (editingName.trim()) {
                      assignStudentNameToSeat(seat.id, editingName.trim());
                    }
                    setEditingSeatId(null);
                    setEditingName('');
                    
                    // 次の席にフォーカス
                    const currentIndex = currentLayout.seats.findIndex(s => s.id === seat.id);
                    const nextIndex = (currentIndex + 1) % currentLayout.seats.length;
                    const nextSeat = currentLayout.seats[nextIndex];
                    setFocusedSeatId(nextSeat.id);
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNameCancel();
                  }
                }}
                onBlur={() => handleNameSubmit(seat.id)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  padding: '2px',
                  fontSize: '14px',
                  width: '100%',
                  textAlign: 'center',
                  color: 'black',
                  caretColor: 'var(--color-primary-600)'
                }}
                autoFocus
              />
            </div>
          ) : (
            /* 通常表示 */
            <div style={{ textAlign: 'center', width: '100%' }}>
              {seat.isEmpty ? (
                <span style={{ opacity: 0.5, fontSize: '12px' }}>空席</span>
              ) : seat.studentId ? (
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  {getStudentName(seat.studentId)}
                </span>
              ) : (
                <span style={{ opacity: 0.3, fontSize: '12px' }}>
                  {seat.row + 1}-{seat.col + 1}
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
