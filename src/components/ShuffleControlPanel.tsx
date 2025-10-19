import React, { useState } from 'react';
import { useSeatStore } from '../stores/seatStore';
import { Shuffle, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { getConditionName } from '../utils/conditionHelpers';

export const ShuffleControlPanel: React.FC = () => {
  const { 
    shuffleSeats, 
    isShuffling, 
    currentLayout, 
    students, 
    conditions,
    validateConditions,
    checkConditionConflicts
  } = useSeatStore();
  
  const [showValidation, setShowValidation] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [conflictResult, setConflictResult] = useState<any>(null);

  const canShuffle = currentLayout && students.length > 0 && !isShuffling;
  const enabledConditions = conditions.filter(c => c.enabled);

  const handlePreShuffleCheck = () => {
    const validation = validateConditions();
    const conflicts = checkConditionConflicts();
    
    setValidationResult(validation);
    setConflictResult(conflicts);
    setShowValidation(true);
  };

  const handleShuffleWithCheck = () => {
    if (enabledConditions.length > 0) {
      handlePreShuffleCheck();
    } else {
      shuffleSeats();
    }
  };

  const handleShuffleConfirm = () => {
    setShowValidation(false);
    shuffleSeats();
  };


  return (
    <>
      <div className="flex-center" style={{ marginTop: 'var(--spacing-2xl)' }}>
        {/* 条件表示 */}
        {enabledConditions.length > 0 && (
          <div style={{
            marginBottom: 'var(--spacing-lg)',
            padding: 'var(--spacing-md)',
            backgroundColor: 'var(--color-primary-50)',
            border: '1px solid var(--color-primary-200)',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '600px',
            width: '100%'
          }}>
            <h3 className="text-headline" style={{ 
              marginBottom: 'var(--spacing-sm)',
              color: 'var(--color-primary-800)',
              textAlign: 'center'
            }}>
              設定中の条件 ({enabledConditions.length}件)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
              {enabledConditions.map((condition, index) => (
                <div
                  key={condition.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-sm)',
                    padding: 'var(--spacing-xs) var(--spacing-sm)',
                    backgroundColor: 'var(--color-primary-100)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem'
                  }}
                >
                  <span style={{ color: 'var(--color-primary-800)', fontWeight: '500' }}>
                    {condition.name}
                  </span>
                  <span style={{ color: 'var(--color-primary-600)', fontSize: '0.75rem' }}>
                    ({getConditionName(condition.type)})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* シャッフルボタン */}
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
          <button
            className="btn btn-primary"
            onClick={handleShuffleWithCheck}
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
        </div>
      </div>

      {/* 条件検証結果モーダル */}
      {showValidation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 5000
        }}>
          <div style={{
            backgroundColor: 'var(--color-secondary-50)',
            border: '2px solid var(--color-primary-300)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--spacing-xl)',
            boxShadow: 'var(--shadow-2xl)',
            maxWidth: '600px',
            width: '90vw',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h2 className="text-title2" style={{ 
              marginBottom: 'var(--spacing-lg)',
              textAlign: 'center'
            }}>
              シャッフル前チェック
            </h2>

            {/* 検証結果 */}
            {validationResult && (
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h3 className="text-headline" style={{ 
                  marginBottom: 'var(--spacing-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)'
                }}>
                  {validationResult.isValid ? (
                    <CheckCircle size={20} color="var(--color-success-600)" />
                  ) : (
                    <XCircle size={20} color="var(--color-error-600)" />
                  )}
                  条件検証結果
                </h3>

                {validationResult.errors.length > 0 && (
                  <div style={{ marginBottom: 'var(--spacing-md)' }}>
                    <h4 className="text-subheadline" style={{ 
                      color: 'var(--color-error-800)',
                      marginBottom: 'var(--spacing-sm)'
                    }}>
                      エラー
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                      {validationResult.errors.map((error: string, index: number) => (
                        <div
                          key={index}
                          style={{
                            padding: 'var(--spacing-sm)',
                            backgroundColor: 'var(--color-error-50)',
                            border: '1px solid var(--color-error-200)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.875rem',
                            color: 'var(--color-error-800)'
                          }}
                        >
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {validationResult.warnings.length > 0 && (
                  <div style={{ marginBottom: 'var(--spacing-md)' }}>
                    <h4 className="text-subheadline" style={{ 
                      color: 'var(--color-warning-800)',
                      marginBottom: 'var(--spacing-sm)'
                    }}>
                      警告
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                      {validationResult.warnings.map((warning: string, index: number) => (
                        <div
                          key={index}
                          style={{
                            padding: 'var(--spacing-sm)',
                            backgroundColor: 'var(--color-warning-50)',
                            border: '1px solid var(--color-warning-200)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.875rem',
                            color: 'var(--color-warning-800)'
                          }}
                        >
                          {warning}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 競合チェック結果 */}
            {conflictResult && (
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h3 className="text-headline" style={{ 
                  marginBottom: 'var(--spacing-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)'
                }}>
                  {conflictResult.isValid ? (
                    <CheckCircle size={20} color="var(--color-success-600)" />
                  ) : (
                    <AlertTriangle size={20} color="var(--color-warning-600)" />
                  )}
                  条件競合チェック
                </h3>

                {conflictResult.errors.length > 0 && (
                  <div style={{ marginBottom: 'var(--spacing-md)' }}>
                    <h4 className="text-subheadline" style={{ 
                      color: 'var(--color-error-800)',
                      marginBottom: 'var(--spacing-sm)'
                    }}>
                      競合エラー
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                      {conflictResult.errors.map((error: string, index: number) => (
                        <div
                          key={index}
                          style={{
                            padding: 'var(--spacing-sm)',
                            backgroundColor: 'var(--color-error-50)',
                            border: '1px solid var(--color-error-200)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.875rem',
                            color: 'var(--color-error-800)'
                          }}
                        >
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {conflictResult.warnings.length > 0 && (
                  <div style={{ marginBottom: 'var(--spacing-md)' }}>
                    <h4 className="text-subheadline" style={{ 
                      color: 'var(--color-warning-800)',
                      marginBottom: 'var(--spacing-sm)'
                    }}>
                      競合警告
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                      {conflictResult.warnings.map((warning: string, index: number) => (
                        <div
                          key={index}
                          style={{
                            padding: 'var(--spacing-sm)',
                            backgroundColor: 'var(--color-warning-50)',
                            border: '1px solid var(--color-warning-200)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.875rem',
                            color: 'var(--color-warning-800)'
                          }}
                        >
                          {warning}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* アクションボタン */}
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowValidation(false)}
                style={{ padding: 'var(--spacing-md) var(--spacing-xl)' }}
              >
                キャンセル
              </button>
              
              {validationResult?.isValid && (
                <button
                  className="btn btn-primary"
                  onClick={handleShuffleConfirm}
                  style={{ padding: 'var(--spacing-md) var(--spacing-xl)' }}
                >
                  シャッフル実行
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
