import React, { useState, useMemo } from 'react';
import { useSeatStore } from '../stores/seatStore';
import { Condition } from '../types';
import { 
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { StudentGroupForm } from './condition/StudentGroupForm';
import { RoleGroupForm } from './condition/RoleGroupForm';
import { StudentDistanceForm } from './condition/StudentDistanceForm';
import { ConditionCard } from './condition/ConditionCard';
import { analyzeAssignment } from '../utils/condition/conditionCheck';

export const ConditionManager: React.FC = () => {
  const { 
    conditions, 
    students, 
    groups, 
    roles, 
    currentLayout,
    addCondition, 
    removeCondition, 
    toggleCondition 
  } = useSeatStore();
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [showForm, setShowForm] = useState<'student-group' | 'role-group' | 'student-distance' | null>(null);

  const conditionCheckResults = useMemo(() => {
    if (!currentLayout) return new Map<string, { satisfied: boolean }>();

    const assignment: { [seatId: string]: string } = {};
    for (const seat of currentLayout.seats) {
      if (!seat.isEmpty && seat.studentId) {
        assignment[seat.id] = seat.studentId;
      }
    }

    const analysis = analyzeAssignment(
      assignment,
      conditions,
      students,
      currentLayout.seats,
      groups,
      roles
    );

    const resultMap = new Map<string, { satisfied: boolean }>();
    
    for (const condition of conditions) {
      if (!condition.enabled) {
        continue;
      }
      const failed = analysis.failedConditions.find(fc => fc.condition.id === condition.id);
      resultMap.set(condition.id, {
        satisfied: !failed
      });
    }

    return resultMap;
  }, [currentLayout, conditions, students, groups, roles]);

  const handleAddCondition = (condition: Omit<Condition, 'id'>) => {
    const newCondition: Condition = {
      ...condition,
      id: `condition-${Date.now()}`
    };
    addCondition(newCondition);
    setShowForm(null);
  };

  const handleEditCondition = (conditionId: string) => {
    const condition = conditions.find(c => c.id === conditionId);
    if (condition && (condition.type === 'student-group' || condition.type === 'role-group' || condition.type === 'student-distance')) {
      setShowForm(condition.type);
    }
  };


  const handleDeleteCondition = (conditionId: string) => {
    removeCondition(conditionId);
  };

  const handleToggleCondition = (conditionId: string) => {
    toggleCondition(conditionId);
  };

  const handleCancelForm = () => {
    setShowForm(null);
  };

  return (
    <div style={{
      backgroundColor: 'var(--color-secondary-50)',
      border: '1px solid var(--color-secondary-200)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--spacing-md)',
      marginBottom: 'var(--spacing-md)'
    }}>
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          cursor: 'pointer',
          marginBottom: isExpanded ? 'var(--spacing-md)' : '0'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>
          条件管理
        </h2>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>

      {isExpanded && (
        <div>
          {/* 条件一覧 */}
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            {conditions.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                color: 'var(--color-secondary-600)',
                padding: 'var(--spacing-lg)',
                backgroundColor: 'var(--color-secondary-100)',
                borderRadius: 'var(--radius-md)'
              }}>
                条件が設定されていません
              </div>
            ) : (
              conditions.map(condition => {
                const checkResult = conditionCheckResults.get(condition.id);
                return (
                  <ConditionCard
                    key={condition.id}
                    condition={condition}
                    onToggle={handleToggleCondition}
                    onEdit={handleEditCondition}
                    onDelete={handleDeleteCondition}
                    students={students}
                    groups={groups}
                    roles={roles}
                    checkResult={checkResult}
                  />
                );
              })
            )}
          </div>

          {/* フォーム表示 */}
          {showForm && (
            <div style={{
              backgroundColor: 'white',
              border: '1px solid var(--color-secondary-300)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--spacing-md)'
            }}>
              {showForm === 'student-group' && (
                <StudentGroupForm
                  onAdd={handleAddCondition}
                  onCancel={handleCancelForm}
                />
              )}
              {showForm === 'role-group' && (
                <RoleGroupForm
                  onAdd={handleAddCondition}
                  onCancel={handleCancelForm}
                />
              )}
              {showForm === 'student-distance' && (
                <StudentDistanceForm
                  onAdd={handleAddCondition}
                  onCancel={handleCancelForm}
                />
              )}
            </div>
          )}

          {/* 条件追加ボタン */}
          {!showForm && (
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowForm('student-group')}
                className="btn btn-primary"
                style={{ fontSize: '0.875rem' }}
              >
                生徒-グループ条件を追加
              </button>
              <button
                onClick={() => setShowForm('role-group')}
                className="btn btn-primary"
                style={{ fontSize: '0.875rem' }}
              >
                ロール/性別-グループ条件を追加
              </button>
              <button
                onClick={() => setShowForm('student-distance')}
                className="btn btn-primary"
                style={{ fontSize: '0.875rem' }}
              >
                生徒間距離条件を追加
              </button>
            </div>
          )}

          {/* 使用例 */}
          <div style={{ 
            marginTop: 'var(--spacing-md)',
            padding: 'var(--spacing-sm)',
            backgroundColor: 'var(--color-primary-50)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: 'var(--spacing-xs)' }}>
              使用例:
            </div>
            <ul style={{ margin: 0, paddingLeft: 'var(--spacing-md)' }}>
              <li>生徒-グループ条件: 田中さんをグループAに配置する</li>
              <li>ロール/性別-グループ条件: 各班に男子を2人配置する</li>
              <li>生徒間距離条件: 田中さんと佐藤さんを近くに配置する</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};