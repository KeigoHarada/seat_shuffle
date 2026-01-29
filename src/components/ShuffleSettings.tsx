import React from 'react';
import { Music } from 'lucide-react';
import { useSeatStore } from '../stores/seatStore';

export const ShuffleSettings: React.FC = () => {
  const { bgmEnabled, setBgmEnabled } = useSeatStore();

  return (
    <div style={{
      marginBottom: 'var(--spacing-xl)',
      padding: 'var(--spacing-lg)',
      backgroundColor: 'var(--color-secondary-100)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-secondary-200)'
    }}>
      <h2 className="text-headline" style={{ 
        marginBottom: 'var(--spacing-md)',
        color: 'var(--color-secondary-900)'
      }}>
        シャッフル設定
      </h2>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--spacing-md)',
        backgroundColor: 'var(--color-secondary-50)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-secondary-300)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-sm)'
        }}>
          <Music 
            size={20} 
            color={bgmEnabled ? "var(--color-primary-600)" : "var(--color-secondary-500)"}
            style={{
              opacity: bgmEnabled ? 1 : 0.5
            }}
          />
          <label className="text-body" style={{ 
            color: 'var(--color-secondary-900)',
            cursor: 'pointer',
            userSelect: 'none'
          }}>
            シャッフルBGM
          </label>
        </div>

        <button
          onClick={() => setBgmEnabled(!bgmEnabled)}
          style={{
            position: 'relative',
            width: '48px',
            height: '28px',
            borderRadius: '14px',
            backgroundColor: bgmEnabled ? 'var(--color-primary-500)' : 'var(--color-secondary-400)',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            padding: 0
          }}
          aria-label={bgmEnabled ? 'BGMをOFFにする' : 'BGMをONにする'}
        >
          <div
            style={{
              position: 'absolute',
              top: '2px',
              left: bgmEnabled ? '22px' : '2px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'white',
              transition: 'left 0.2s ease',
              boxShadow: 'var(--shadow-sm)'
            }}
          />
        </button>
      </div>
    </div>
  );
};
