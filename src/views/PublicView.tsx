import React, { useState } from 'react';
import { Shuffle, Settings, Printer, HelpCircle, X, RotateCw } from 'lucide-react';
import { useSeatStore } from '../stores/seatStore';
import { SeatGrid } from '../components/SeatGrid';

export const PublicView: React.FC = () => {
  const { shuffleSeats, toggleSettings, isShuffling, currentLayout, students, showSettings, settingsPanelWidth, toggleTeacherDeskPosition } = useSeatStore();
  const [showHelp, setShowHelp] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const canShuffle = currentLayout && students.length > 0 && !isShuffling;

  return (
    <div 
      style={{
        opacity: showSettings ? 0.9 : 1,
        transition: 'opacity 0.3s ease',
        pointerEvents: 'auto',
        marginRight: showSettings ? `${settingsPanelWidth}px` : '0',
        maxWidth: showSettings ? `calc(100vw - ${settingsPanelWidth}px)` : '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        padding: 'var(--spacing-lg)'
      }}
    >
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 'var(--spacing-lg)',
        flexShrink: 0
      }}>
        <h1 className="text-display">席替えアプリ</h1>
        <div style={{
          position: 'fixed',
          top: 'var(--spacing-lg)',
          right: 'var(--spacing-lg)',
          zIndex: 1000,
          display: 'flex',
          gap: 'var(--spacing-sm)'
        }}>
          <div 
            onClick={toggleTeacherDeskPosition}
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
              padding: 'var(--spacing-xs) var(--spacing-sm)',
              backgroundColor: 'white',
              border: '2px solid var(--color-secondary-300)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-md)',
              opacity: 0.9,
              transition: 'all 0.2s ease'
            }}
            title="教壇の位置を切り替え"
          >
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-secondary-700)' }}>
              教壇:
            </span>
            <div style={{
              position: 'relative',
              width: '60px',
              height: '28px',
              backgroundColor: currentLayout?.teacherDeskPosition === 'top' ? 'var(--color-primary-500)' : 'var(--color-secondary-400)',
              borderRadius: '14px',
              transition: 'background-color 0.2s ease'
            }}>
              <div style={{
                position: 'absolute',
                top: '2px',
                left: currentLayout?.teacherDeskPosition === 'top' ? '2px' : '32px',
                width: '24px',
                height: '24px',
                backgroundColor: 'white',
                borderRadius: '50%',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                transition: 'left 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
                color: 'var(--color-secondary-700)'
              }}>
                {currentLayout?.teacherDeskPosition === 'top' ? '↑' : '↓'}
              </div>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-secondary-600)', minWidth: '20px' }}>
              {currentLayout?.teacherDeskPosition === 'top' ? '上' : '下'}
            </span>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => setShowHelp(true)}
            style={{ 
              opacity: 0.8,
              padding: 'var(--spacing-sm)',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              boxShadow: 'var(--shadow-md)'
            }}
            title="使い方"
          >
            <HelpCircle size={20} />
          </button>
          <button
            className="btn btn-secondary"
            onClick={toggleSettings}
            style={{ 
              opacity: 0.8,
              padding: 'var(--spacing-sm)',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              boxShadow: 'var(--shadow-md)'
            }}
            title="設定"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
          <SeatGrid />
        </div>
        
        <div className="flex-center" style={{ marginTop: 'var(--spacing-lg)', flexShrink: 0 }}>
          <button
            className="btn btn-primary"
            onClick={shuffleSeats}
            disabled={!canShuffle}
            style={{
              fontSize: '1.25rem',
              padding: 'var(--spacing-lg) var(--spacing-2xl)',
              opacity: canShuffle ? 1 : 0.5,
              cursor: canShuffle ? 'pointer' : 'not-allowed'
            }}
          >
            <Shuffle size={24} style={{ marginRight: 'var(--spacing-sm)' }} />
            {isShuffling ? 'シャッフル中...' : 'シャッフル実行'}
          </button>
          
          <button
            className="btn btn-secondary"
            onClick={handlePrint}
            style={{
              fontSize: '1rem',
              padding: 'var(--spacing-md) var(--spacing-xl)'
            }}
          >
            <Printer size={20} style={{ marginRight: 'var(--spacing-sm)' }} />
            印刷
          </button>
        </div>

      </main>

      <style jsx>{`
        @media print {
          .btn {
            display: none !important;
          }
          
          .container {
            max-width: none !important;
            padding: 0 !important;
          }
          
          .seat {
            background-color: white !important;
            color: black !important;
            border: 2px solid black !important;
            box-shadow: none !important;
          }
          
          .seat.occupied {
            background-color: #f0f0f0 !important;
            color: black !important;
            border: 2px solid black !important;
          }
          
          .seat.empty {
            background-color: white !important;
            color: #999 !important;
            border: 2px solid #ccc !important;
          }
        }
      `}</style>

      {/* 使い方モーダル */}
      {showHelp && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 4000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--spacing-lg)'
          }}
          onClick={() => setShowHelp(false)}
        >
          <div 
            style={{
              backgroundColor: 'var(--color-secondary-50)',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-lg)',
              padding: 'var(--spacing-xl)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
              <h2 className="text-title2" style={{ color: 'var(--color-secondary-900)' }}>
                使い方
              </h2>
              <button
                className="btn btn-secondary"
                onClick={() => setShowHelp(false)}
                style={{ 
                  padding: 'var(--spacing-xs)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px'
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', color: 'var(--color-secondary-900)' }}>
              <div>
                <h3 className="text-headline" style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-secondary-900)' }}>
                  1. 席配置を作成
                </h3>
                <p className="text-body">
                  行数と列数を設定して席配置を作成します。作成後は背景の席替え表で確認・編集できます。
                </p>
              </div>
              
              <div>
                <h3 className="text-headline" style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-secondary-900)' }}>
                  2. 生徒を追加
                </h3>
                <p className="text-body">
                  生徒名、ふりがな、性別を入力して追加します。CSV/Excelファイルから一括読み込みも可能です。
                </p>
              </div>
              
              <div>
                <h3 className="text-headline" style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-secondary-900)' }}>
                  3. グループ・ロール設定
                </h3>
                <p className="text-body">
                  グループを作成して席に割り当て（複数可）、ロールを作成して生徒に付与できます。
                </p>
              </div>
              
              <div>
                <h3 className="text-headline" style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-secondary-900)' }}>
                  4. 条件設定
                </h3>
                <p className="text-body">
                  席配置の条件を設定できます。生徒のグループ配置、ロール/性別の配置人数、生徒間の距離などを指定できます。
                </p>
              </div>
              
              <div>
                <h3 className="text-headline" style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-secondary-900)' }}>
                  5. 席替え表で編集
                </h3>
                <p className="text-body">
                  背景の席替え表で直接編集できます。ダブルクリックで名前変更、右クリックでグループ設定・空席設定が可能です。
                </p>
              </div>
              
              <div>
                <h3 className="text-headline" style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-secondary-900)' }}>
                  6. パネルサイズ調整
                </h3>
                <p className="text-body">
                  設定パネルの左端をドラッグして幅を調整できます（400px〜1000px）。座席表も自動的にリサイズされます。
                </p>
              </div>
              
              <div>
                <h3 className="text-headline" style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-secondary-900)' }}>
                  7. 生徒表示モード
                </h3>
                <p className="text-body">
                  設定画面を閉じることで、生徒に見せる状態になります。シャッフル実行も可能です。
                </p>
              </div>
              
              <div>
                <h3 className="text-headline" style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-secondary-900)' }}>
                  8. リアルタイム反映
                </h3>
                <p className="text-body">
                  設定を変更すると、背景の席替え表に即座に反映されます。設定画面と席替え表を同時に操作できます。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
