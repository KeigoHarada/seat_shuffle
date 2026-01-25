import React from 'react';
import { useSeatStore } from '../../stores/seatStore';

interface SeatEditorProps {
  seatId: string;
  editingName: string;
  editingFurigana: string;
  onNameChange: (name: string) => void;
  onFuriganaChange: (furigana: string) => void;
  onSubmit: (seatId: string) => void;
  onCancel: () => void;
}

export const SeatEditor: React.FC<SeatEditorProps> = ({
  seatId,
  editingName,
  editingFurigana,
  onNameChange,
  onFuriganaChange,
  onSubmit,
  onCancel
}) => {
  const { removeStudentFromSeat } = useSeatStore();

  const handleKeyDown = (e: React.KeyboardEvent, field: 'furigana' | 'name') => {
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      // 前の入力欄にフォーカス
      const targetInput = e.currentTarget.parentElement?.querySelector(
        `input[placeholder="${field === 'furigana' ? '名前' : 'ふりがな'}"]`
      ) as HTMLInputElement;
      if (targetInput) {
        targetInput.focus();
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (field === 'furigana') {
        // ふりがなから名前へ
        const nameInput = e.currentTarget.parentElement?.querySelector('input[placeholder="名前"]') as HTMLInputElement;
        if (nameInput) {
          nameInput.focus();
        }
      } else {
        // 名前から次の席へ
        e.stopPropagation();
        if (editingName.trim()) {
          onSubmit(seatId);
        } else {
          removeStudentFromSeat(seatId);
        }
        onCancel();
        
        // 次の席のフォーカスは親コンポーネントで処理
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onCancel();
    }
  };

  const handleSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit(seatId);
    }
  };

  return (
    <div 
      style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' }}
      onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
    >
      <input
        type="text"
        value={editingFurigana}
        onChange={(e) => onFuriganaChange(e.target.value)}
        placeholder="ふりがな"
        onKeyDown={(e) => handleKeyDown(e, 'furigana')}
        onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); e.currentTarget.focus(); }}
        onFocus={(e) => { e.stopPropagation(); }}
        style={{
          border: 'none',
          outline: 'none',
          background: 'transparent',
          padding: '4px',
          fontSize: '22px',
          color: 'var(--color-secondary-500)',
          width: '100%',
          textAlign: 'center',
          caretColor: 'var(--color-primary-600)'
        }}
      />
      <input
        type="text"
        value={editingName}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="名前"
        onKeyPress={handleSubmit}
        onKeyDown={(e) => handleKeyDown(e, 'name')}
        onBlur={() => onSubmit(seatId)}
        onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); e.currentTarget.focus(); }}
        onFocus={(e) => { e.stopPropagation(); }}
        ref={(input) => {
          // 編集モード開始時に名前欄にフォーカス
          if (input) {
            setTimeout(() => input.focus(), 0);
          }
        }}
        style={{
          border: 'none',
          outline: 'none',
          background: 'transparent',
          padding: '4px',
          fontSize: '22px',
          fontWeight: '600',
          width: '100%',
          textAlign: 'center',
          color: 'black',
          caretColor: 'var(--color-primary-600)'
        }}
      />
    </div>
  );
};
