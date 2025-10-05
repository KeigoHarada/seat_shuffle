import React, { useState } from 'react';
import { useSeatStore } from '../stores/seatStore';

export const LayoutSettings: React.FC = () => {
  const { createLayout, currentLayout } = useSeatStore();
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(6);

  const handleCreateLayout = () => {
    createLayout(rows, cols, '教室レイアウト');
  };

  return (
    <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
      <h2 className="text-title3" style={{ marginBottom: 'var(--spacing-lg)' }}>
        席配置設定
      </h2>
      
      <div className="flex" style={{ marginBottom: 'var(--spacing-lg)', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
        <div>
          <label className="text-callout" style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>
            行数
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={rows}
            onChange={(e) => setRows(parseInt(e.target.value) || 1)}
            style={{
              padding: 'var(--spacing-sm)',
              border: '1px solid var(--color-secondary-300)',
              borderRadius: 'var(--radius-md)',
              fontSize: '1rem',
              width: '80px'
            }}
          />
        </div>
        
        <div>
          <label className="text-callout" style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>
            列数
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={cols}
            onChange={(e) => setCols(parseInt(e.target.value) || 1)}
            style={{
              padding: 'var(--spacing-sm)',
              border: '1px solid var(--color-secondary-300)',
              borderRadius: 'var(--radius-md)',
              fontSize: '1rem',
              width: '80px'
            }}
          />
        </div>
        
        <div style={{ alignSelf: 'end' }}>
          <button
            className="btn btn-primary"
            onClick={handleCreateLayout}
          >
            席配置を作成
          </button>
        </div>
      </div>

      {currentLayout && (
        <div>
          <p className="text-callout" style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-primary-600)' }}>
            ✅ 席配置が作成されました。背景の席替え表で確認・編集できます。
          </p>
          <div style={{ 
            backgroundColor: 'var(--color-secondary-100)',
            padding: 'var(--spacing-md)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-secondary-200)'
          }}>
            <p className="text-callout" style={{ marginBottom: 'var(--spacing-sm)' }}>
              <strong>現在の設定:</strong>
            </p>
            <p className="text-callout">
              サイズ: {currentLayout.rows}行 × {currentLayout.cols}列
            </p>
            <p className="text-callout">
              総席数: {currentLayout.seats.length}席
            </p>
            <p className="text-callout">
              空席数: {currentLayout.seats.filter(seat => seat.isEmpty).length}席
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
