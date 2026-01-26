import React, { useState, useEffect } from 'react';
import { useSeatStore } from '../stores/seatStore';
import { ROLE_ICONS } from '../constants/roleIcons';
import { UI_CONSTANTS } from '../constants/ui';
import { GroupMenu } from './seat/GroupMenu';
import { SeatEditor } from './seat/SeatEditor';
import { useSeatDragDrop } from '../hooks/useSeatDragDrop';

function lightenColor(hex: string, targetLightness: number): string {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return hex;
  let r = parseInt(m[1], 16) / 255;
  let g = parseInt(m[2], 16) / 255;
  let b = parseInt(m[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const currentL = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = currentL > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  const l = targetLightness;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = (x: number) => Math.round(Math.max(0, Math.min(1, x)) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

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

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target instanceof Element && !e.target.closest('.seat')) {
      setSelectedSeatId(null);
      setFocusedSeatId(null);
      setMultiSelectedSeats(new Set());
    }
  };

  const handleClick = (seatId: string, e: React.MouseEvent) => {
    if (editingSeatId === seatId) {
      return;
    }
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
    const seat = currentLayout.seats.find(s => s.id === seatId);
    let currentFurigana = '';
    if (seat && seat.studentId) {
      const student = students.find(s => s.id === seat.studentId);
      if (student) {
        currentFurigana = student.furigana || '';
      }
    }
    setEditingSeatId(seatId);
    setEditingName(currentName);
    setEditingFurigana(currentFurigana);
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
      assignStudentNameToSeat(seatId, editingName.trim(), editingFurigana.trim() || undefined);
    } else {
      // 名前が空の場合は席から生徒を削除
      removeStudentFromSeat(seatId);
    }
    setEditingSeatId(null);
    setEditingName('');
    setEditingFurigana('');
  };

  const handleNameCancel = () => {
    setEditingSeatId(null);
    setEditingName('');
    setEditingFurigana('');
  };



  // 生徒の出席番号を取得
  const getAttendanceNumber = (studentId?: string) => {
    if (!studentId) return null;
    const student = students.find(s => s.id === studentId);
    return student?.studentNumber;
  };

  // 設定画面の幅と高さに応じて座席のスケールを調整
  const availableWidth = showSettings ? window.innerWidth - settingsPanelWidth - UI_CONSTANTS.LAYOUT.WINDOW_MARGIN : window.innerWidth - UI_CONSTANTS.LAYOUT.WINDOW_MARGIN;
  const availableHeight = window.innerHeight - UI_CONSTANTS.LAYOUT.HEADER_HEIGHT; // ヘッダー、ボタン、教壇、マージンを最小限に
  
  const idealSeatWidth = UI_CONSTANTS.SEAT_WIDTH; // 座席幅をさらに大きく
  const idealSeatHeight = UI_CONSTANTS.SEAT_HEIGHT; // 座席高さをさらに大きく
  const seatGap = UI_CONSTANTS.SEAT_GAP; // 座席間ギャップを適度に設定
  const teacherDeskHeight = UI_CONSTANTS.TEACHER_DESK_HEIGHT; // 教壇の高さ（スケール適用前、さらに大きく）
  const teacherDeskMargin = UI_CONSTANTS.TEACHER_DESK_MARGIN; // 教壇のマージン（スケール適用前、適度な隙間）
  
  const totalGridWidth = idealSeatWidth * currentLayout.cols + seatGap * (currentLayout.cols - 1);
  const totalGridHeight = idealSeatHeight * currentLayout.rows + seatGap * (currentLayout.rows - 1);
  
  const scaleByWidth = totalGridWidth > 0 ? availableWidth / totalGridWidth : 1;
  const scaleByHeight = totalGridHeight > 0 ? (availableHeight - (teacherDeskHeight + teacherDeskMargin) * 2) / totalGridHeight : 1;
  const scale = Math.max(0.1, Math.min(scaleByWidth, scaleByHeight)); // 最小0.1、最大サイズまで活用

  const isTeacherDeskBottom = currentLayout.teacherDeskPosition === 'bottom';

  return (
    <div
      role="presentation"
      onClick={handleBackgroundClick}
      style={{ 
        position: 'relative', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        width: '100%', 
        height: '100%',
        maxWidth: `${availableWidth}px`,
        maxHeight: `${availableHeight}px`,
        overflow: 'hidden'
      }}
    >
      {/* 教壇（上） */}
      {!isTeacherDeskBottom && (
        <div 
          style={{ 
            width: `${UI_CONSTANTS.TEACHER_DESK_WIDTH * scale}px`,
            height: `${UI_CONSTANTS.TEACHER_DESK_HEIGHT * scale}px`,
            backgroundColor: 'var(--color-secondary-700)',
            border: `${3 * scale}px solid var(--color-secondary-500)`,
            borderRadius: `calc(var(--radius-lg) * ${scale})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: `${UI_CONSTANTS.TEACHER_DESK_MARGIN * scale}px`,
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
        gap: `${UI_CONSTANTS.SEAT_GAP * scale}px`,
        maxWidth: 'fit-content',
        margin: '0',
        padding: 0,
        transform: `${isTeacherDeskBottom ? 'rotate(180deg)' : ''}`,
        transformOrigin: 'center center',
        width: `${(UI_CONSTANTS.SEAT_WIDTH * currentLayout.cols + UI_CONSTANTS.SEAT_GAP * (currentLayout.cols - 1)) * scale}px`,
        height: `${(UI_CONSTANTS.SEAT_HEIGHT * currentLayout.rows + UI_CONSTANTS.SEAT_GAP * (currentLayout.rows - 1)) * scale}px`
      }}>
        {currentLayout.seats.map((seat) => {
          const seatGroups = seat.groupIds.map(gid => groups.find(g => g.id === gid)).filter(Boolean);
          const primaryGroup = seatGroups[0];
          const stateRings: string[] = [];
          if (selectedSeatId === seat.id) stateRings.push('0 0 0 2px var(--color-primary-200)');
          if (focusedSeatId === seat.id || dragOverSeatId === seat.id) stateRings.push('0 0 0 3px var(--color-accent-200)');
          const boxShadow = stateRings.length ? stateRings.join(', ') : undefined;
          return (
          <div
            key={seat.id}
            className={`seat ${seat.isEmpty ? 'empty' : seat.studentId ? 'occupied' : ''} ${isShuffling ? 'shuffling' : ''} ${selectedSeatId === seat.id ? 'selected' : ''} ${focusedSeatId === seat.id ? 'focused' : ''} ${multiSelectedSeats.has(seat.id) ? 'multi-selected' : ''} ${draggedSeatId === seat.id ? 'dragging' : ''} ${dragOverSeatId === seat.id ? 'drag-over' : ''} ${swappedSeats.has(seat.id) ? 'drag-swap' : ''}`}
            onMouseDown={editingSeatId === seat.id ? undefined : undefined}
            onClick={editingSeatId === seat.id ? (e) => {
              e.stopPropagation();
              e.preventDefault();
            } : (e) => {
              handleClick(seat.id, e);
            }}
            onDoubleClick={editingSeatId === seat.id ? undefined : () => {
              handleDoubleClick(seat.id, getStudentName(seat.studentId));
            }}
            onContextMenu={editingSeatId === seat.id ? (e) => {
              e.preventDefault();
              e.stopPropagation();
            } : (e) => handleRightClick(e, seat.id)}
            draggable={editingSeatId !== seat.id}
            onDragStart={editingSeatId === seat.id ? undefined : (e) => handleDragStart(e, seat.id)}
            onDragOver={editingSeatId === seat.id ? undefined : (e) => handleDragOver(e, seat.id)}
            onDragLeave={editingSeatId === seat.id ? undefined : handleDragLeave}
            onDrop={editingSeatId === seat.id ? undefined : (e) => handleDrop(e, seat.id)}
            onDragEnd={editingSeatId === seat.id ? undefined : handleDragEnd}
            style={{
              animationDelay: `${Math.random() * UI_CONSTANTS.ANIMATION.MAX_DELAY}s`,
              position: 'relative',
              backgroundColor: primaryGroup?.color ? lightenColor(primaryGroup.color, 0.95) : undefined,
              border: primaryGroup?.color ? `2px solid ${primaryGroup.color}` : undefined,
              boxShadow,
              cursor: !seat.isEmpty && seat.studentId ? 'grab' : 'default',
              transform: isTeacherDeskBottom ? 'rotate(180deg)' : 'none',
              width: `${UI_CONSTANTS.SEAT_WIDTH * scale}px`,
              height: `${UI_CONSTANTS.SEAT_HEIGHT * scale}px`,
              fontSize: `${UI_CONSTANTS.FONT_SIZE.LARGE * scale}px`
            }}
          >
          {/* 出席番号 */}
          {!seat.isEmpty && seat.studentId && getAttendanceNumber(seat.studentId) && (
            <div style={{
              position: 'absolute',
              top: `${UI_CONSTANTS.MARGIN.MEDIUM * scale}px`,
              left: `${UI_CONSTANTS.MARGIN.LARGE * scale}px`,
              fontSize: `${UI_CONSTANTS.FONT_SIZE.SMALL * scale}px`,
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
              top: `${UI_CONSTANTS.MARGIN.MEDIUM * scale}px`,
              right: `${UI_CONSTANTS.MARGIN.LARGE * scale}px`,
              display: 'flex',
              gap: `${UI_CONSTANTS.MARGIN.SMALL * scale}px`,
              zIndex: 1
            }}>
              {seatGroups.map((group) => {
                if (!group) return null;
                return (
                  <div 
                    key={group.id}
                    style={{
                      width: `${UI_CONSTANTS.ICON_SIZE.MEDIUM * scale}px`,
                      height: `${UI_CONSTANTS.ICON_SIZE.MEDIUM * scale}px`,
                      borderRadius: '50%',
                      backgroundColor: group.color,
                      border: `${UI_CONSTANTS.MARGIN.SMALL * scale}px solid white`,
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
              bottom: `${UI_CONSTANTS.MARGIN.MEDIUM * scale}px`,
              right: `${UI_CONSTANTS.MARGIN.LARGE * scale}px`,
              display: 'flex',
              gap: `${UI_CONSTANTS.MARGIN.SMALL * scale}px`,
              flexWrap: 'wrap',
              maxWidth: `${80 * scale}px`,
              justifyContent: 'flex-end'
            }}>
              {getStudentRoles(seat.studentId).slice(0, UI_CONSTANTS.LAYOUT.MAX_ROLES_DISPLAY).map((role) => {
                const iconData = ROLE_ICONS.find(icon => icon.id === role.icon);
                const IconComponent = iconData?.component;
                return (
                  <div
                    key={role.id}
                    style={{
                      width: `${UI_CONSTANTS.ICON_SIZE.LARGE * scale}px`,
                      height: `${UI_CONSTANTS.ICON_SIZE.LARGE * scale}px`,
                      borderRadius: `calc(var(--radius-sm) * ${scale})`,
                      backgroundColor: 'var(--color-secondary-100)',
                      border: `${UI_CONSTANTS.MARGIN.SMALL * scale}px solid var(--color-secondary-300)`,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title={role.name}
                  >
                    {IconComponent && <IconComponent size={UI_CONSTANTS.ICON_SIZE.SMALL * scale} color="var(--color-secondary-600)" />}
                  </div>
                );
              })}
              {getStudentRoles(seat.studentId).length > UI_CONSTANTS.LAYOUT.MAX_ROLES_DISPLAY && (
                <div
                  style={{
                    width: `${UI_CONSTANTS.ICON_SIZE.LARGE * scale}px`,
                    height: `${UI_CONSTANTS.ICON_SIZE.LARGE * scale}px`,
                    borderRadius: `calc(var(--radius-sm) * ${scale})`,
                    backgroundColor: 'var(--color-secondary-400)',
                    border: `${UI_CONSTANTS.MARGIN.SMALL * scale}px solid var(--color-secondary-300)`,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    fontSize: `${UI_CONSTANTS.FONT_SIZE.PICO * scale}px`,
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
              scale={scale}
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
                        <span style={{ fontSize: `${UI_CONSTANTS.FONT_SIZE.TINY * scale}px`, color: 'var(--color-secondary-500)', lineHeight: '1.2' }}>
                          {student.furigana}
                        </span>
                        <span style={{ fontSize: `${UI_CONSTANTS.FONT_SIZE.LARGE * scale}px`, fontWeight: '600', lineHeight: '1.2' }}>
                          {student.name}
                        </span>
                      </>
                    ) : (
                      <span style={{ fontSize: `${UI_CONSTANTS.FONT_SIZE.LARGE * scale}px`, fontWeight: '600' }}>
                        {getStudentName(seat.studentId)}
                      </span>
                    );
                  })()}
                </>
              ) : (
                <span style={{ fontSize: `${UI_CONSTANTS.FONT_SIZE.LARGE * scale}px`, fontWeight: '600', lineHeight: '1.2' }}>名無し</span>
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
