import React from 'react';
import { X } from 'lucide-react';
import { useSeatStore } from '../stores/seatStore';
import { LayoutSettings } from '../components/LayoutSettings';
import { StudentManager } from '../components/StudentManager';

export const SettingsView: React.FC = () => {
  const { toggleSettings } = useSeatStore();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'var(--color-secondary-50)',
      color: 'var(--color-secondary-900)',
      zIndex: 2000,
      overflowY: 'auto'
    }}>
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
            onClick={toggleSettings}
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
                  行数と列数を設定して席配置を作成します。席をクリックすると空席に設定できます。
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
                  3. シャッフル実行
                </h3>
                <p className="text-body">
                  公開画面で「シャッフル実行」ボタンを押すと、生徒がランダムに席に配置されます。
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
