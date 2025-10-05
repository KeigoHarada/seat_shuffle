import React from 'react';
import { Shuffle, Settings, Printer } from 'lucide-react';
import { useSeatStore } from '../stores/seatStore';
import { SeatGrid } from '../components/SeatGrid';

export const PublicView: React.FC = () => {
  const { shuffleSeats, toggleSettings, isShuffling, currentLayout, students, showSettings, settingsPanelWidth } = useSeatStore();

  const handlePrint = () => {
    window.print();
  };

  const canShuffle = currentLayout && students.length > 0 && !isShuffling;

  return (
    <div 
      className="container"
      style={{
        opacity: showSettings ? 0.9 : 1,
        transition: 'opacity 0.3s ease',
        pointerEvents: 'auto',
        marginRight: showSettings ? `${settingsPanelWidth}px` : '0',
        maxWidth: showSettings ? `calc(100vw - ${settingsPanelWidth}px)` : '100%'
      }}
    >
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 'var(--spacing-2xl)'
      }}>
        <h1 className="text-display">席替えアプリ</h1>
        <button
          className="btn btn-secondary"
          onClick={toggleSettings}
          style={{ 
            position: 'fixed',
            top: 'var(--spacing-lg)',
            right: 'var(--spacing-lg)',
            zIndex: 1000,
            opacity: 0.8,
            padding: 'var(--spacing-sm)',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <Settings size={20} />
        </button>
      </header>

      <main>
        <SeatGrid />
        
        <div className="flex-center" style={{ marginTop: 'var(--spacing-2xl)' }}>
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

        {!currentLayout && (
          <div className="flex-center" style={{ marginTop: 'var(--spacing-2xl)' }}>
            <p className="text-body" style={{ opacity: 0.7 }}>
              デフォルトレイアウトを読み込み中...
            </p>
          </div>
        )}

        {currentLayout && students.length === 0 && (
          <div className="flex-center" style={{ marginTop: 'var(--spacing-2xl)' }}>
            <p className="text-body" style={{ opacity: 0.7 }}>
              設定画面で生徒を追加してください
            </p>
          </div>
        )}
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
    </div>
  );
};
