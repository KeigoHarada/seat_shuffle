import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useSeatStore } from '../stores/seatStore';
import { LayoutSettings } from '../components/LayoutSettings';
import { StudentManager } from '../components/StudentManager';

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
      <div className="container">
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 'var(--spacing-2xl)',
          paddingTop: 'var(--spacing-xl)'
        }}>
          <h1 className="text-display" style={{ color: 'var(--color-secondary-900)' }}>
            設定
          </h1>
          <button
            className="btn btn-secondary"
            onClick={handleClose}
            style={{ 
              padding: 'var(--spacing-sm)',
              borderRadius: '50%',
              width: '48px',
              height: '48px'
            }}
          >
            <X size={24} />
          </button>
        </header>

        <main>
          <LayoutSettings />
          <StudentManager />
          
          <div className="card">
            <h2 className="text-title3" style={{ marginBottom: 'var(--spacing-lg)' }}>
              使い方
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <div>
                <h3 className="text-headline" style={{ marginBottom: 'var(--spacing-sm)' }}>
                  1. 席配置を作成
                </h3>
                <p className="text-body">
                  行数と列数を設定して席配置を作成します。作成後は背景の席替え表で確認・編集できます。
                </p>
              </div>
              
              <div>
                <h3 className="text-headline" style={{ marginBottom: 'var(--spacing-sm)' }}>
                  2. 生徒を追加
                </h3>
                <p className="text-body">
                  生徒名を入力して追加します。追加した生徒は編集・削除が可能です。
                </p>
              </div>
              
              <div>
                <h3 className="text-headline" style={{ marginBottom: 'var(--spacing-sm)' }}>
                  3. 席替え表で編集
                </h3>
                <p className="text-body">
                  背景の席替え表で直接編集できます。ダブルクリックで名前変更、右クリックで空席設定・席交換が可能です。
                </p>
              </div>
              
              <div>
                <h3 className="text-headline" style={{ marginBottom: 'var(--spacing-sm)' }}>
                  4. パネルサイズ調整
                </h3>
                <p className="text-body">
                  設定パネルの左端をドラッグして幅を調整できます（400px〜1000px）。
                </p>
              </div>
              
              <div>
                <h3 className="text-headline" style={{ marginBottom: 'var(--spacing-sm)' }}>
                  5. 生徒表示モード
                </h3>
                <p className="text-body">
                  設定画面を閉じることで、生徒に見せる状態になります。シャッフル実行も可能です。
                </p>
              </div>
              
              <div>
                <h3 className="text-headline" style={{ marginBottom: 'var(--spacing-sm)' }}>
                  6. リアルタイム反映
                </h3>
                <p className="text-body">
                  設定を変更すると、背景の席替え表に即座に反映されます。設定画面と席替え表を同時に操作できます。
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
      </div>
    </>
  );
};
