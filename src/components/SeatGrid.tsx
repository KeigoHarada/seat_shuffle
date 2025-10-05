import React, { useState, useEffect } from 'react';
import { useSeatStore } from '../stores/seatStore';
import { 
  Crown, 
  Shield, 
  Utensils, 
  BookOpen, 
  Users, 
  Clipboard, 
  Calendar,
  MessageSquare,
  Settings,
  Award
} from 'lucide-react';

const ROLE_ICONS = [
  { id: 'crown', name: '王冠', component: Crown },
  { id: 'shield', name: '盾', component: Shield },
  { id: 'utensils', name: '給食', component: Utensils },
  { id: 'book', name: '学習', component: BookOpen },
  { id: 'users', name: 'グループ', component: Users },
  { id: 'clipboard', name: '記録', component: Clipboard },
  { id: 'calendar', name: '予定', component: Calendar },
  { id: 'message', name: '連絡', component: MessageSquare },
  { id: 'settings', name: '設定', component: Settings },
  { id: 'award', name: '表彰', component: Award }
];

export const SeatGrid: React.FC = () => {
  const { 
    currentLayout, 
    students, 
    groups,
    roles,
    isShuffling, 
    selectedSeatId,
    setSelectedSeatId,
    swapSeats,
    assignStudentNameToSeat,
    toggleSeatEmpty,
    assignGroupToSeat,
    initializeDefaultLayout
  } = useSeatStore();
  
  const [editingSeatId, setEditingSeatId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [focusedSeatId, setFocusedSeatId] = useState<string | null>(null);
  const [showGroupMenu, setShowGroupMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [multiSelectedSeats, setMultiSelectedSeats] = useState<Set<string>>(new Set());
  const [draggedSeatId, setDraggedSeatId] = useState<string | null>(null);
  const [dragOverSeatId, setDragOverSeatId] = useState<string | null>(null);
  const [swappedSeats, setSwappedSeats] = useState<Set<string>>(new Set());

  // デフォルトレイアウトを初期化
  useEffect(() => {
    initializeDefaultLayout();
  }, [initializeDefaultLayout]);

  // グループメニューを閉じる
  useEffect(() => {
    const handleClickOutside = () => {
      setShowGroupMenu(null);
      setMenuPosition(null);
    };

    if (showGroupMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showGroupMenu]);

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

  const getGroup = (groupId?: string) => {
    if (!groupId) return null;
    return groups.find(g => g.id === groupId) || null;
  };

  const getStudentRoles = (studentId?: string) => {
    if (!studentId) return [];
    const student = students.find(s => s.id === studentId);
    if (!student) return [];
    return roles.filter(role => student.roleIds.includes(role.id));
  };

  const handleClick = (seatId: string, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // コントロールキーが押されている場合は複数選択
      setMultiSelectedSeats(prev => {
        const newSet = new Set(prev);
        // 現在フォーカスされている席も複数選択に含める
        if (focusedSeatId && focusedSeatId !== seatId) {
          newSet.add(focusedSeatId);
        }
        if (newSet.has(seatId)) {
          newSet.delete(seatId);
        } else {
          newSet.add(seatId);
        }
        return newSet;
      });
      setFocusedSeatId(seatId);
    } else {
      // 通常のクリック
      setMultiSelectedSeats(new Set());
      setFocusedSeatId(seatId);
    }
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
        const targetSeat = currentLayout.seats.find(s => s.id === seatId);
        // 空席とは交換しない
        if (targetSeat && !targetSeat.isEmpty) {
          swapSeats(selectedSeatId, seatId);
        }
      }
      setSelectedSeatId(null);
    } else {
      // 複数選択がある場合は、その席も含めてメニュー表示
      const seatsToShow = multiSelectedSeats.size > 0 ? Array.from(multiSelectedSeats) : [seatId];
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPosition({ x: rect.left, y: rect.bottom });
      setShowGroupMenu(seatsToShow.join(','));
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

  const handleGroupSelect = (seatIds: string, groupId: string | null) => {
    const seatIdArray = seatIds.split(',');
    seatIdArray.forEach(seatId => {
      assignGroupToSeat(seatId, groupId);
    });
    setShowGroupMenu(null);
    setMenuPosition(null);
    setMultiSelectedSeats(new Set());
  };

  const handleEmptyToggle = (seatIds: string) => {
    const seatIdArray = seatIds.split(',');
    seatIdArray.forEach(seatId => {
      toggleSeatEmpty(seatId);
    });
    setShowGroupMenu(null);
    setMenuPosition(null);
    setMultiSelectedSeats(new Set());
  };

  // ドラッグ&ドロップのイベントハンドラー
  const handleDragStart = (e: React.DragEvent, seatId: string) => {
    const seat = currentLayout.seats.find(s => s.id === seatId);
    if (seat && !seat.isEmpty && seat.studentId) {
      setDraggedSeatId(seatId);
      e.dataTransfer.effectAllowed = 'move';
    } else {
      e.preventDefault();
    }
  };

  const handleDragOver = (e: React.DragEvent, seatId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const targetSeat = currentLayout.seats.find(s => s.id === seatId);
    if (targetSeat && !targetSeat.isEmpty) {
      setDragOverSeatId(seatId);
    }
  };

  const handleDragLeave = () => {
    setDragOverSeatId(null);
  };

  const handleDrop = (e: React.DragEvent, targetSeatId: string) => {
    e.preventDefault();
    setDragOverSeatId(null);
    
    if (draggedSeatId && draggedSeatId !== targetSeatId) {
      const targetSeat = currentLayout.seats.find(s => s.id === targetSeatId);
      if (targetSeat && !targetSeat.isEmpty) {
        // 交換アニメーションを開始
        setSwappedSeats(new Set([draggedSeatId, targetSeatId]));
        
        // 少し遅延してから実際の交換を実行
        setTimeout(() => {
          swapSeats(draggedSeatId, targetSeatId);
          // アニメーション完了後にクリア
          setTimeout(() => {
            setSwappedSeats(new Set());
          }, 300);
        }, 50);
      }
    }
    setDraggedSeatId(null);
  };

  const handleDragEnd = () => {
    setDraggedSeatId(null);
    setDragOverSeatId(null);
  };

  // 生徒が割り当てられた席の番号を計算
  const getSeatNumber = (seatIndex: number) => {
    let seatNumber = 0;
    for (let i = 0; i <= seatIndex; i++) {
      if (!currentLayout.seats[i].isEmpty && currentLayout.seats[i].studentId) {
        seatNumber++;
      }
    }
    return seatNumber;
  };

  return (
    <div style={{ position: 'relative' }}>
      <div className="seat-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: `repeat(${currentLayout.cols}, 1fr)`,
        gap: 'var(--spacing-sm)',
        maxWidth: 'fit-content',
        margin: '0 auto',
        padding: 'var(--spacing-lg)'
      }}>
        {currentLayout.seats.map((seat, index) => {
          const group = getGroup(seat.groupId);
          return (
          <div
            key={seat.id}
            className={`seat ${seat.isEmpty ? 'empty' : seat.studentId ? 'occupied' : ''} ${isShuffling ? 'shuffling' : ''} ${selectedSeatId === seat.id ? 'selected' : ''} ${focusedSeatId === seat.id ? 'focused' : ''} ${multiSelectedSeats.has(seat.id) ? 'multi-selected' : ''} ${draggedSeatId === seat.id ? 'dragging' : ''} ${dragOverSeatId === seat.id ? 'drag-over' : ''} ${swappedSeats.has(seat.id) ? 'drag-swap' : ''}`}
            onClick={(e) => handleClick(seat.id, e)}
            onDoubleClick={() => handleDoubleClick(seat.id, getStudentName(seat.studentId))}
            onContextMenu={(e) => handleRightClick(e, seat.id)}
            draggable={!seat.isEmpty && !!seat.studentId}
            onDragStart={(e) => handleDragStart(e, seat.id)}
            onDragOver={(e) => handleDragOver(e, seat.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, seat.id)}
            onDragEnd={handleDragEnd}
            style={{
              animationDelay: `${Math.random() * 0.5}s`,
              position: 'relative',
              borderColor: group ? group.color : undefined,
              borderWidth: group ? '3px' : undefined,
              cursor: !seat.isEmpty && seat.studentId ? 'grab' : 'default'
            }}
          >
          {/* 席番号 */}
          {!seat.isEmpty && seat.studentId && (
            <div style={{
              position: 'absolute',
              top: '2px',
              left: '2px',
              fontSize: '10px',
              color: 'var(--color-secondary-500)',
              fontWeight: 'bold'
            }}>
              {getSeatNumber(index)}
            </div>
          )}

          {/* グループ表示 */}
          {group && (
            <div style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: group.color,
              border: '1px solid white',
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}
            title={group.name}
            />
          )}

          {/* ロール表示 */}
          {seat.studentId && (
            <div style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              display: 'flex',
              gap: '1px',
              flexWrap: 'wrap',
              maxWidth: '60px',
              justifyContent: 'flex-end'
            }}>
              {getStudentRoles(seat.studentId).slice(0, 2).map((role) => {
                const iconData = ROLE_ICONS.find(icon => icon.id === role.icon);
                const IconComponent = iconData?.component;
                return (
                  <div
                    key={role.id}
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-secondary-100)',
                      border: '1px solid var(--color-secondary-300)',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title={role.name}
                  >
                    {IconComponent && <IconComponent size={8} color="var(--color-secondary-600)" />}
                  </div>
                );
              })}
              {getStudentRoles(seat.studentId).length > 2 && (
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-secondary-400)',
                    border: '1px solid var(--color-secondary-300)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    fontSize: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                  title={`他${getStudentRoles(seat.studentId).length - 2}個のロール`}
                >
                  +
                </div>
              )}
            </div>
          )}
          
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
                <span style={{ opacity: 0.5, fontSize: '12px' }}>空席</span>
              )}
            </div>
          )}

        </div>
        );
      })}
      </div>

      {/* グループメニュー */}
      {showGroupMenu && menuPosition && (
        <div style={{
          position: 'fixed',
          left: menuPosition.x,
          top: menuPosition.y,
          backgroundColor: 'white',
          border: '1px solid var(--color-secondary-300)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 9999,
          padding: 'var(--spacing-sm)',
          minWidth: '150px'
        }}>
          <div style={{ 
            fontSize: '0.75rem', 
            fontWeight: 'bold', 
            marginBottom: 'var(--spacing-xs)',
            color: 'var(--color-secondary-700)'
          }}>
            {showGroupMenu.includes(',') ? `${showGroupMenu.split(',').length}席の設定` : '席の設定'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* 空席設定 */}
            {(() => {
              const seatIds = showGroupMenu.split(',');
              const firstSeat = currentLayout.seats.find(s => s.id === seatIds[0]);
              if (firstSeat) {
                const allEmpty = seatIds.every(id => {
                  const seat = currentLayout.seats.find(s => s.id === id);
                  return seat?.isEmpty;
                });
                const allNotEmpty = seatIds.every(id => {
                  const seat = currentLayout.seats.find(s => s.id === id);
                  return !seat?.isEmpty;
                });
                
                return (
                  <button
                    onClick={() => handleEmptyToggle(showGroupMenu)}
                    style={{
                      padding: 'var(--spacing-xs)',
                      border: 'none',
                      background: 'transparent',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-sm)',
                      color: allEmpty ? 'var(--color-primary-600)' : 'var(--color-secondary-600)',
                      fontWeight: allEmpty ? 'bold' : 'normal'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-secondary-100)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {allEmpty ? '✓ 空席を解除' : allNotEmpty ? '空席にする' : '空席状態を統一'}
                  </button>
                );
              }
              return null;
            })()}
            
            {/* 区切り線 */}
            <div style={{ 
              height: '1px', 
              backgroundColor: 'var(--color-secondary-200)', 
              margin: '4px 0'
            }} />
            
            <button
              onClick={() => handleGroupSelect(showGroupMenu, null)}
              style={{
                padding: 'var(--spacing-xs)',
                border: 'none',
                background: 'transparent',
                textAlign: 'left',
                fontSize: '0.75rem',
                cursor: 'pointer',
                borderRadius: 'var(--radius-sm)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-secondary-100)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              グループなし
            </button>
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => handleGroupSelect(showGroupMenu, group.id)}
                style={{
                  padding: 'var(--spacing-xs)',
                  border: 'none',
                  background: 'transparent',
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-xs)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-secondary-100)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: group.color,
                    border: '1px solid var(--color-secondary-300)'
                  }}
                />
                {group.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
