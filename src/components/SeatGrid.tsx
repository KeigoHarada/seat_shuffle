import React, { useState, useEffect } from 'react';
import { useSeatStore } from '../stores/seatStore';
import { ROLE_ICONS } from '../constants/roleIcons';
import { GroupMenu } from './seat/GroupMenu';
import { SeatEditor } from './seat/SeatEditor';
import { useSeatDragDrop } from '../hooks/useSeatDragDrop';

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
    removeStudentFromSeat,
    initializeDefaultLayout,
    settingsPanelWidth,
    showSettings,
  } = useSeatStore();
  
  const [editingSeatId, setEditingSeatId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingFurigana, setEditingFurigana] = useState('');
  const [focusedSeatId, setFocusedSeatId] = useState<string | null>(null);
  const [showGroupMenu, setShowGroupMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [multiSelectedSeats, setMultiSelectedSeats] = useState<Set<string>>(new Set());
  const {
    draggedSeatId,
    dragOverSeatId,
    swappedSeats,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd
  } = useSeatDragDrop();

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
      // 名前が入力されている場合は生徒を割り当て
      assignStudentNameToSeat(seatId, editingName.trim());
    } else {
      // 名前が空の場合は席から生徒を削除
      removeStudentFromSeat(seatId);
    }
    setEditingSeatId(null);
    setEditingName('');
  };

  const handleNameCancel = () => {
    setEditingSeatId(null);
    setEditingName('');
  };



  // 生徒の出席番号を取得
  const getAttendanceNumber = (studentId?: string) => {
    if (!studentId) return null;
    const student = students.find(s => s.id === studentId);
    return student?.studentNumber;
  };

  // 設定画面の幅と高さに応じて座席のスケールを調整
  const availableWidth = showSettings ? window.innerWidth - settingsPanelWidth - 10 : window.innerWidth - 10;
  const availableHeight = window.innerHeight - 150; // ヘッダー、ボタン、教壇、マージンを最小限に
  
  const idealSeatWidth = 220; // 座席幅をさらに大きく
  const idealSeatHeight = 160; // 座席高さをさらに大きく
  const seatGap = 8; // 座席間ギャップを適度に設定
  const teacherDeskHeight = 80; // 教壇の高さ（スケール適用前、さらに大きく）
  const teacherDeskMargin = 8; // 教壇のマージン（スケール適用前、適度な隙間）
  
  const totalGridWidth = idealSeatWidth * currentLayout.cols + seatGap * (currentLayout.cols - 1);
  const totalGridHeight = idealSeatHeight * currentLayout.rows + seatGap * (currentLayout.rows - 1);
  
  const scaleByWidth = availableWidth / totalGridWidth;
  const scaleByHeight = (availableHeight - (teacherDeskHeight + teacherDeskMargin) * 2) / totalGridHeight; // 教壇分を除いて計算
  const scale = Math.min(scaleByWidth, scaleByHeight); // 最大サイズまで活用

  const isTeacherDeskBottom = currentLayout.teacherDeskPosition === 'bottom';

  return (
    <div style={{ 
      position: 'relative', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      width: '100%', 
      height: '100%',
      maxWidth: `${availableWidth}px`,
      maxHeight: `${availableHeight}px`,
      overflow: 'hidden'
    }}>
      {/* 教壇（上） */}
      {!isTeacherDeskBottom && (
        <div 
          style={{ 
            width: `${350 * scale}px`,
            height: `${80 * scale}px`,
            backgroundColor: 'var(--color-secondary-700)',
            border: `${3 * scale}px solid var(--color-secondary-500)`,
            borderRadius: `calc(var(--radius-lg) * ${scale})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: `${8 * scale}px`,
            transition: 'all 0.2s ease'
          }}
        >
          <span style={{ 
            color: 'var(--color-chalk-primary)', 
            fontWeight: 'bold',
            fontSize: `${32 * scale}px`
          }}>
            教壇
          </span>
        </div>
      )}
      
      <div className="seat-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: `repeat(${currentLayout.cols}, 1fr)`,
        gap: `${8 * scale}px`,
        maxWidth: 'fit-content',
        margin: '0',
        padding: 0,
        transform: `${isTeacherDeskBottom ? 'rotate(180deg)' : ''}`,
        transformOrigin: 'center center',
        width: `${(220 * currentLayout.cols + 8 * (currentLayout.cols - 1)) * scale}px`,
        height: `${(160 * currentLayout.rows + 8 * (currentLayout.rows - 1)) * scale}px`
      }}>
        {currentLayout.seats.map((seat) => {
          const seatGroups = seat.groupIds.map(gid => groups.find(g => g.id === gid)).filter(Boolean);
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
              borderColor: seatGroups.length > 0 ? seatGroups[0]?.color : undefined,
              borderWidth: seatGroups.length > 0 ? '3px' : undefined,
              cursor: !seat.isEmpty && seat.studentId ? 'grab' : 'default',
              transform: isTeacherDeskBottom ? 'rotate(180deg)' : 'none',
              width: `${220 * scale}px`,
              height: `${160 * scale}px`,
              fontSize: `${36 * scale}px`
            }}
          >
          {/* 出席番号 */}
          {!seat.isEmpty && seat.studentId && getAttendanceNumber(seat.studentId) && (
            <div style={{
              position: 'absolute',
              top: `${4 * scale}px`,
              left: `${6 * scale}px`,
              fontSize: `${30 * scale}px`,
              color: 'var(--color-secondary-500)',
              fontWeight: 'bold',
              zIndex: 1
            }}>
              {getAttendanceNumber(seat.studentId)}
            </div>
          )}

          {/* グループ表示（複数対応） */}
          {seatGroups.length > 0 && (
            <div style={{
              position: 'absolute',
              top: `${4 * scale}px`,
              right: `${6 * scale}px`,
              display: 'flex',
              gap: `${3 * scale}px`,
              zIndex: 1
            }}>
              {seatGroups.map((group) => {
                if (!group) return null;
                return (
                  <div 
                    key={group.id}
                    style={{
                      width: `${16 * scale}px`,
                      height: `${16 * scale}px`,
                      borderRadius: '50%',
                      backgroundColor: group.color,
                      border: `${2 * scale}px solid white`,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                    }}
                    title={group.name}
                  />
                );
              })}
            </div>
          )}

          {/* ロール表示 */}
          {seat.studentId && (
            <div style={{
              position: 'absolute',
              bottom: `${4 * scale}px`,
              right: `${6 * scale}px`,
              display: 'flex',
              gap: `${2 * scale}px`,
              flexWrap: 'wrap',
              maxWidth: `${80 * scale}px`,
              justifyContent: 'flex-end'
            }}>
              {getStudentRoles(seat.studentId).slice(0, 3).map((role) => {
                const iconData = ROLE_ICONS.find(icon => icon.id === role.icon);
                const IconComponent = iconData?.component;
                return (
                  <div
                    key={role.id}
                    style={{
                      width: `${18 * scale}px`,
                      height: `${18 * scale}px`,
                      borderRadius: `calc(var(--radius-sm) * ${scale})`,
                      backgroundColor: 'var(--color-secondary-100)',
                      border: `${1 * scale}px solid var(--color-secondary-300)`,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title={role.name}
                  >
                    {IconComponent && <IconComponent size={12 * scale} color="var(--color-secondary-600)" />}
                  </div>
                );
              })}
              {getStudentRoles(seat.studentId).length > 3 && (
                <div
                  style={{
                    width: `${18 * scale}px`,
                    height: `${18 * scale}px`,
                    borderRadius: `calc(var(--radius-sm) * ${scale})`,
                    backgroundColor: 'var(--color-secondary-400)',
                    border: `${1 * scale}px solid var(--color-secondary-300)`,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    fontSize: `${9 * scale}px`,
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
            <SeatEditor
              seatId={seat.id}
              editingName={editingName}
              editingFurigana={editingFurigana}
              onNameChange={setEditingName}
              onFuriganaChange={setEditingFurigana}
              onSubmit={handleNameSubmit}
              onCancel={handleNameCancel}
            />
          ) : (
            /* 通常表示 */
            <div style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              {seat.isEmpty ? (
                <span style={{ opacity: 0.5, fontSize: `${32 * scale}px` }}>空席</span>
              ) : seat.studentId ? (
                <>
                  {(() => {
                    const student = students.find(s => s.id === seat.studentId);
                    return student ? (
                      <>
                        <span style={{ fontSize: `${22 * scale}px`, color: 'var(--color-secondary-500)', lineHeight: '1.2' }}>
                          {student.furigana}
                        </span>
                        <span style={{ fontSize: `${36 * scale}px`, fontWeight: '600', lineHeight: '1.2' }}>
                          {student.name}
                        </span>
                      </>
                    ) : (
                      <span style={{ fontSize: `${36 * scale}px`, fontWeight: '600' }}>
                        {getStudentName(seat.studentId)}
                      </span>
                    );
                  })()}
                </>
              ) : (
                <span style={{ opacity: 0.5, fontSize: `${32 * scale}px` }}>空席</span>
              )}
            </div>
          )}

        </div>
        );
      })}
      </div>

      {/* 教壇（下） */}
      {isTeacherDeskBottom && (
        <div 
          style={{ 
            width: `${350 * scale}px`,
            height: `${80 * scale}px`,
            backgroundColor: 'var(--color-secondary-700)',
            border: `${3 * scale}px solid var(--color-secondary-500)`,
            borderRadius: `calc(var(--radius-lg) * ${scale})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: `${8 * scale}px`,
            transition: 'all 0.2s ease'
          }}
        >
          <span style={{ 
            color: 'var(--color-chalk-primary)', 
            fontWeight: 'bold',
            fontSize: `${32 * scale}px`
          }}>
            教壇
          </span>
        </div>
      )}

      {/* グループメニュー */}
      <GroupMenu
        showGroupMenu={showGroupMenu}
        menuPosition={menuPosition}
        onClose={() => {
          setShowGroupMenu(null);
          setMenuPosition(null);
        }}
      />
    </div>
  );
};
