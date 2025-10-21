import React from 'react';
import { useSeatStore } from '../stores/seatStore';
import { CheckCircle, XCircle, AlertCircle, Users, Target, UserCheck } from 'lucide-react';
import { getConditionIconId, getConditionName } from '../utils/conditionHelpers';

export const ShuffleResultFeedback: React.FC = () => {
  const { lastShuffleAnalysis, conditions } = useSeatStore();

  if (!lastShuffleAnalysis) return null;

  const { totalConditions, failedConditions } = lastShuffleAnalysis;
  const satisfiedConditions = totalConditions - failedConditions.length;
  const satisfactionRate = totalConditions > 0 ? (satisfiedConditions / totalConditions) * 100 : 100;


  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'var(--color-secondary-50)',
      border: '2px solid var(--color-primary-300)',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--spacing-xl)',
      boxShadow: 'var(--shadow-2xl)',
      zIndex: 4000,
      maxWidth: '600px',
      width: '90vw',
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          {satisfactionRate === 100 ? (
            <CheckCircle size={48} color="var(--color-success-600)" />
          ) : satisfactionRate >= 80 ? (
            <AlertCircle size={48} color="var(--color-warning-600)" />
          ) : (
            <XCircle size={48} color="var(--color-error-600)" />
          )}
        </div>
        
        <h2 className="text-title2" style={{ marginBottom: 'var(--spacing-sm)' }}>
          シャッフル結果
        </h2>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-md)'
        }}>
          <div style={{
            padding: 'var(--spacing-sm) var(--spacing-md)',
            backgroundColor: 'var(--color-primary-100)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-primary-300)'
          }}>
            <span className="text-headline" style={{ color: 'var(--color-primary-800)' }}>
              {satisfiedConditions}/{totalConditions}
            </span>
            <span className="text-callout" style={{ color: 'var(--color-primary-600)', marginLeft: 'var(--spacing-xs)' }}>
              条件を満たしました
            </span>
          </div>
          
          <div style={{
            padding: 'var(--spacing-sm) var(--spacing-md)',
            backgroundColor: satisfactionRate === 100 ? 'var(--color-success-100)' : 
                           satisfactionRate >= 80 ? 'var(--color-warning-100)' : 'var(--color-error-100)',
            borderRadius: 'var(--radius-lg)',
            border: `1px solid ${satisfactionRate === 100 ? 'var(--color-success-300)' : 
                               satisfactionRate >= 80 ? 'var(--color-warning-300)' : 'var(--color-error-300)'}`
          }}>
            <span className="text-headline" style={{ 
              color: satisfactionRate === 100 ? 'var(--color-success-800)' : 
                     satisfactionRate >= 80 ? 'var(--color-warning-800)' : 'var(--color-error-800)'
            }}>
              {satisfactionRate.toFixed(0)}%
            </span>
            <span className="text-callout" style={{ 
              color: satisfactionRate === 100 ? 'var(--color-success-600)' : 
                     satisfactionRate >= 80 ? 'var(--color-warning-600)' : 'var(--color-error-600)',
              marginLeft: 'var(--spacing-xs)'
            }}>
              満足度
            </span>
          </div>
        </div>
      </div>

      {failedConditions.length > 0 && (
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <h3 className="text-headline" style={{ 
            marginBottom: 'var(--spacing-md)',
            color: 'var(--color-error-800)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)'
          }}>
            <XCircle size={20} />
            満たされなかった条件
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {failedConditions.map((failedCondition, index) => (
              <div
                key={index}
                style={{
                  padding: 'var(--spacing-md)',
                  backgroundColor: 'var(--color-error-50)',
                  border: '1px solid var(--color-error-200)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--spacing-sm)'
                }}
              >
                <div style={{ color: 'var(--color-error-600)', marginTop: '2px' }}>
                  {(() => {
                    const iconId = getConditionIconId(failedCondition.condition.type);
                    switch (iconId) {
                      case 'users': return <Users size={16} />;
                      case 'target': return <Target size={16} />;
                      case 'user-check': return <UserCheck size={16} />;
                      default: return <AlertCircle size={16} />;
                    }
                  })()}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="text-subheadline" style={{ 
                    fontWeight: '600',
                    color: 'var(--color-error-800)',
                    marginBottom: 'var(--spacing-xs)'
                  }}>
                    {failedCondition.condition.name}
                  </div>
                  <div className="text-callout" style={{ color: 'var(--color-error-600)' }}>
                    {getConditionName(failedCondition.condition.type)}
                  </div>
                  {failedCondition.reason && (
                    <div className="text-callout" style={{ 
                      color: 'var(--color-error-700)',
                      marginTop: 'var(--spacing-xs)',
                      fontStyle: 'italic'
                    }}>
                      {failedCondition.reason}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {satisfiedConditions > 0 && (
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <h3 className="text-headline" style={{ 
            marginBottom: 'var(--spacing-md)',
            color: 'var(--color-success-800)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)'
          }}>
            <CheckCircle size={20} />
            満たされた条件
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {conditions
              .filter(c => c.enabled)
              .filter(condition => 
                !failedConditions.some(failed => failed.condition.id === condition.id)
              )
              .map((condition, index) => (
                <div
                  key={index}
                  style={{
                    padding: 'var(--spacing-md)',
                    backgroundColor: 'var(--color-success-50)',
                    border: '1px solid var(--color-success-200)',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--spacing-sm)'
                  }}
                >
                  <div style={{ color: 'var(--color-success-600)', marginTop: '2px' }}>
                    {(() => {
                      const iconId = getConditionIconId(condition.type);
                      switch (iconId) {
                        case 'users': return <Users size={16} />;
                        case 'target': return <Target size={16} />;
                        case 'user-check': return <UserCheck size={16} />;
                        default: return <AlertCircle size={16} />;
                      }
                    })()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="text-subheadline" style={{ 
                      fontWeight: '600',
                      color: 'var(--color-success-800)',
                      marginBottom: 'var(--spacing-xs)'
                    }}>
                      {condition.name}
                    </div>
                    <div className="text-callout" style={{ color: 'var(--color-success-600)' }}>
                      {getConditionName(condition.type)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center' }}>
        <button
          className="btn btn-primary"
          onClick={() => window.location.reload()}
          style={{ padding: 'var(--spacing-md) var(--spacing-xl)' }}
        >
          閉じる
        </button>
      </div>
    </div>
  );
};
