import React from 'react';
import { useSeatStore } from '../../stores/seatStore';

interface GroupMenuProps {
  showGroupMenu: string | null;
  menuPosition: { x: number; y: number } | null;
  onClose: () => void;
}

export const GroupMenu: React.FC<GroupMenuProps> = ({ 
  showGroupMenu, 
  menuPosition, 
  onClose 
}) => {
  const { 
    currentLayout, 
    groups, 
    toggleSeatEmpty, 
    toggleGroupOnSeat 
  } = useSeatStore();

  if (!showGroupMenu || !menuPosition || !currentLayout) return null;

  const seatIds = showGroupMenu.split(',');
  const selectedSeats = seatIds.map(id => currentLayout.seats.find(s => s.id === id)).filter(Boolean) as NonNullable<typeof currentLayout.seats[0]>[];

  return (
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
                onClick={() => {
                  seatIds.forEach(seatId => toggleSeatEmpty(seatId));
                  onClose();
                }}
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
        
        <div style={{ 
          fontSize: '0.7rem', 
          color: 'var(--color-secondary-600)',
          marginBottom: 'var(--spacing-xs)',
          paddingLeft: 'var(--spacing-xs)'
        }}>
          グループ（クリックで追加/削除）
        </div>
        
        {groups.map((group) => {
          const hasGroup = selectedSeats.some(seat => seat.groupIds.includes(group.id));
          
          return (
            <button
              key={group.id}
              onClick={() => {
                seatIds.forEach(seatId => toggleGroupOnSeat(seatId, group.id));
                onClose();
              }}
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
                gap: 'var(--spacing-xs)',
                fontWeight: hasGroup ? 'bold' : 'normal'
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
              {hasGroup && <span>✓</span>}
              {group.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
