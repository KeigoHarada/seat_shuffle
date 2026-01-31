import React, { useState, useEffect } from 'react';
import { useSeatStore } from '../stores/seatStore';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { DEFAULT_LAYOUT_ROWS, DEFAULT_LAYOUT_COLS, DEFAULT_LAYOUT_NAME } from '../constants/layout';

export const LayoutSettings: React.FC = () => {
  const currentLayout = useSeatStore((s) => s.currentLayout);
  const { createLayout, updateLayoutSize } = useSeatStore();
  const [rows, setRows] = useState(DEFAULT_LAYOUT_ROWS);
  const [cols, setCols] = useState(DEFAULT_LAYOUT_COLS);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (currentLayout) {
      setRows(currentLayout.rows);
      setCols(currentLayout.cols);
    }
  }, [currentLayout?.rows, currentLayout?.cols]);

  const handleApplyLayout = () => {
    if (currentLayout) {
      updateLayoutSize(rows, cols);
    } else {
      createLayout(rows, cols, DEFAULT_LAYOUT_NAME);
    }
  };

  return (
    <div className="card" style={{ marginBottom: 'var(--spacing-md)' }}>
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          cursor: 'pointer',
          marginBottom: isExpanded ? 'var(--spacing-md)' : 0
        }}
      >
        <h2 className="text-title3">
          席配置設定
        </h2>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>
      
      {isExpanded && (
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
            onClick={handleApplyLayout}
          >
            {currentLayout ? '席配置を更新' : '席配置を作成'}
          </button>
        </div>
      </div>
      )}

    </div>
  );
};
