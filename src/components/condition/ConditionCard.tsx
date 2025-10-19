import React from 'react';
import { Condition, StudentGroupCondition, RoleGroupCondition, StudentDistanceCondition } from '../../types';
import { getConditionIconId, getConditionName } from '../../utils/conditionHelpers';
import { Users, Target, UserCheck, AlertCircle } from 'lucide-react';

interface ConditionCardProps {
  condition: Condition;
  onToggle: (conditionId: string) => void;
  onEdit: (conditionId: string) => void;
  onDelete: (conditionId: string) => void;
  students: any[];
  groups: any[];
  roles: any[];
}

export const ConditionCard: React.FC<ConditionCardProps> = ({
  condition,
  onToggle,
  onEdit,
  onDelete,
  students,
  groups,
  roles
}) => {
  const getConditionDescription = (condition: Condition): string => {
    switch (condition.type) {
      case 'student-group': {
        const c = condition as StudentGroupCondition;
        const studentNames = c.studentIds.map(sid => students.find(s => s.id === sid)?.name).filter(Boolean);
        const groupNames = c.groupIds.map(gid => groups.find(g => g.id === gid)?.name).filter(Boolean);
        return `${studentNames.join(', ')}を${groupNames.join(', ')}に${c.shouldPlace ? '配置' : '配置しない'}`;
      }
      case 'role-group': {
        const c = condition as RoleGroupCondition;
        const groupNames = c.groupIds.map(gid => groups.find(g => g.id === gid)?.name).filter(Boolean);
        const filterName = c.roleId 
          ? roles.find(r => r.id === c.roleId)?.name || '不明なロール'
          : c.gender === 'male' ? '男性' : c.gender === 'female' ? '女性' : 'その他';
        return `${filterName}を${groupNames.join(', ')}に${c.count}人配置`;
      }
      case 'student-distance': {
        const c = condition as StudentDistanceCondition;
        const student1 = students.find(s => s.id === c.studentId1);
        const student2 = students.find(s => s.id === c.studentId2);
        return `${student1?.name || '不明'}と${student2?.name || '不明'}を${c.shouldBeClose ? '近く' : '遠く'}に配置`;
      }
      default:
        return '不明な条件';
    }
  };

  return (
    <div style={{
      padding: 'var(--spacing-md)',
      backgroundColor: 'var(--color-secondary-50)',
      border: '1px solid var(--color-secondary-200)',
      borderRadius: 'var(--radius-md)',
      marginBottom: 'var(--spacing-sm)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
        {(() => {
          const iconId = getConditionIconId(condition.type);
          switch (iconId) {
            case 'users': return <Users size={16} />;
            case 'target': return <Target size={16} />;
            case 'user-check': return <UserCheck size={16} />;
            default: return <AlertCircle size={16} />;
          }
        })()}
        <span style={{ fontWeight: 'bold' }}>{getConditionName(condition.type)}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--spacing-xs)' }}>
          <button
            onClick={() => onToggle(condition.id)}
            className={`btn ${condition.enabled ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.75rem', padding: 'var(--spacing-xs) var(--spacing-sm)' }}
          >
            {condition.enabled ? '有効' : '無効'}
          </button>
          <button
            onClick={() => onEdit(condition.id)}
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: 'var(--spacing-xs) var(--spacing-sm)' }}
          >
            編集
          </button>
          <button
            onClick={() => onDelete(condition.id)}
            className="btn btn-danger"
            style={{ fontSize: '0.75rem', padding: 'var(--spacing-xs) var(--spacing-sm)' }}
          >
            削除
          </button>
        </div>
      </div>
      <div style={{ fontSize: '0.9rem', color: 'var(--color-secondary-700)' }}>
        {getConditionDescription(condition)}
      </div>
    </div>
  );
};
