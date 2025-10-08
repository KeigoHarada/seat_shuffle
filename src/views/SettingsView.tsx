import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useSeatStore } from '../stores/seatStore';
import { LayoutSettings } from '../components/LayoutSettings';
import { StudentManager } from '../components/StudentManager';
import { GroupManager } from '../components/GroupManager';
import { RoleManager } from '../components/RoleManager';
import { ConditionManager } from '../components/ConditionManager';

export const SettingsView: React.FC = () => {
  const { toggleSettings, settingsPanelWidth, setSettingsPanelWidth } = useSeatStore();
  const [isClosing, setIsClosing] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      toggleSettings();
    }, 300); // アニメーション時間に合わせる
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    const newWidth = window.innerWidth - e.clientX;
    setSettingsPanelWidth(Math.max(400, Math.min(1000, newWidth)));
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  return (
    <>
      {/* 設定パネル */}
      <div 
        className={`settings-panel ${isClosing ? 'closing' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: `${settingsPanelWidth}px`,
          height: '100vh',
          backgroundColor: 'var(--color-secondary-50)',
          color: 'var(--color-secondary-900)',
          zIndex: 3000,
          overflowY: 'auto',
          boxShadow: 'var(--shadow-xl)',
          borderLeft: '1px solid var(--color-secondary-200)'
        }}
      >
        {/* リサイズハンドル */}
        <div
          onMouseDown={handleMouseDown}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            cursor: 'col-resize',
            backgroundColor: isResizing ? 'var(--color-primary-500)' : 'transparent',
            transition: 'background-color 0.2s ease'
          }}
        />
      <div style={{ padding: 'var(--spacing-md)' }}>
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 'var(--spacing-lg)',
          paddingTop: 'var(--spacing-md)'
        }}>
          <h1 className="text-title2" style={{ color: 'var(--color-secondary-900)' }}>
            設定
          </h1>
          <button
            className="btn btn-secondary"
            onClick={handleClose}
            style={{ 
              padding: 'var(--spacing-xs)',
              borderRadius: '50%',
              width: '40px',
              height: '40px'
            }}
          >
            <X size={20} />
          </button>
        </header>

        <main>
          <LayoutSettings />
          <StudentManager />
          <GroupManager />
          <RoleManager />
          <ConditionManager />
        </main>
      </div>
      </div>
    </>
  );
};
