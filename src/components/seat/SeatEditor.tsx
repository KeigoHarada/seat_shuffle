import React from 'react';
import { useSeatStore } from '../../stores/seatStore';
import { UI_CONSTANTS } from '../../constants/ui';

interface SeatEditorProps {
  seatId: string;
  editingName: string;
  editingFurigana: string;
  onNameChange: (name: string) => void;
  onFuriganaChange: (furigana: string) => void;
  onSubmit: (seatId: string) => void;
  onCancel: () => void;
  scale: number;
}

export const SeatEditor: React.FC<SeatEditorProps> = ({
  seatId,
  editingName,
  editingFurigana,
  onNameChange,
  onFuriganaChange,
  onSubmit,
  onCancel,
  scale
}) => {
  const { removeStudentFromSeat } = useSeatStore();
  const furiganaInputRef = React.useRef<HTMLInputElement>(null);
  const nameInputRef = React.useRef<HTMLInputElement>(null);

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
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', width: '100%' }}
      onMouseDown={(e) => { 
        console.log('[DEBUG] SeatEditor親div onMouseDown, target:', e.target, 'currentTarget:', e.currentTarget);
        if (e.target === e.currentTarget) {
          e.stopPropagation();
        }
      }}
      onClick={(e) => { 
        console.log('[DEBUG] SeatEditor親div onClick, target:', e.target, 'currentTarget:', e.currentTarget);
        if (e.target === e.currentTarget) {
          e.stopPropagation();
        }
      }}
    >
      <input
        ref={furiganaInputRef}
        type="text"
        value={editingFurigana}
        onChange={(e) => {
          console.log('[DEBUG] ふりがな onChange:', e.target.value);
          onFuriganaChange(e.target.value);
          setTimeout(() => {
            if (furiganaInputRef.current) {
              furiganaInputRef.current.focus();
            }
          }, 0);
        }}
        placeholder="ふりがな"
        onKeyDown={(e) => handleKeyDown(e, 'furigana')}
        onMouseDown={(e) => { 
          console.log('[DEBUG] ふりがな onMouseDown, target:', e.target);
        }}
        onClick={(e) => { 
          console.log('[DEBUG] ふりがな onClick, target:', e.target);
          e.stopPropagation();
        }}
        onFocus={(e) => { 
          console.log('[DEBUG] ふりがな onFocus, target:', e.target);
          e.stopPropagation();
        }}
        onMouseUp={(e) => {
          console.log('[DEBUG] ふりがな onMouseUp, target:', e.target);
          e.stopPropagation();
        }}
        onInput={(e) => {
          console.log('[DEBUG] ふりがな onInput, value:', (e.target as HTMLInputElement).value);
        }}
        onBlur={() => {
          console.log('[DEBUG] ふりがな onBlur');
        }}
        style={{
          border: 'none',
          outline: 'none',
          background: 'transparent',
          padding: 0,
          fontSize: `${UI_CONSTANTS.FONT_SIZE.TINY * scale}px`,
          color: 'var(--color-secondary-500)',
          width: '100%',
          textAlign: 'center',
          caretColor: 'var(--color-primary-600)',
          lineHeight: '1.2',
          cursor: 'text'
        }}
      />
      <input
        type="text"
        value={editingName}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="名前"
        onKeyPress={handleSubmit}
        onKeyDown={(e) => handleKeyDown(e, 'name')}
        onBlur={(e) => {
          const relatedTarget = e.relatedTarget as HTMLElement | null;
          const furiganaInput = e.currentTarget.parentElement?.querySelector('input[placeholder="ふりがな"]') as HTMLInputElement;
          if (relatedTarget === furiganaInput) {
            return;
          }
          onSubmit(seatId);
        }}
        onMouseDown={(e) => { 
          e.stopPropagation();
        }}
        onClick={(e) => { 
          e.stopPropagation();
        }}
        onFocus={(e) => { 
          e.stopPropagation();
        }}
        ref={(input) => {
          nameInputRef.current = input;
          // 編集モード開始時に名前欄にフォーカス（ふりがな欄にフォーカスがない場合のみ）
          if (input && !furiganaInputRef.current?.matches(':focus')) {
            setTimeout(() => {
              if (!furiganaInputRef.current?.matches(':focus')) {
                input.focus();
              }
            }, 0);
          }
        }}
        style={{
          border: 'none',
          outline: 'none',
          background: 'transparent',
          padding: 0,
          fontSize: `${UI_CONSTANTS.FONT_SIZE.LARGE * scale}px`,
          fontWeight: '600',
          width: '100%',
          textAlign: 'center',
          color: 'black',
          caretColor: 'var(--color-primary-600)',
          lineHeight: '1.2',
          cursor: 'text'
        }}
      />
    </div>
  );
};
