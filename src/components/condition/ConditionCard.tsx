import React from 'react';
import { Condition } from '../../types';
import { getConditionIconId, getConditionName } from '../../utils/condition/helpers';
import { Users, Target, UserCheck, AlertCircle } from 'lucide-react';

interface ConditionCardProps {
  condition: Condition;
  onToggle: (conditionId: string) => void;
  onEdit: (conditionId: string) => void;
  onDelete: (conditionId: string) => void;
  students: any[];
  groups: any[];
  roles: any[];
  checkResult?: { satisfied: boolean };
}

export const ConditionCard: React.FC<ConditionCardProps> = ({
  condition,
  onToggle,
  onEdit,
  onDelete,
  students,
  groups,
  roles,
  checkResult
}) => {
  const getConditionDescription = (condition: Condition): string => {
    switch (condition.type) {
      case "student-group": {
        const studentNames = condition.studentIds.map(sid => students.find(s => s.id === sid)?.name).filter(Boolean);
        const groupNames = condition.groupIds.map(gid => groups.find(g => g.id === gid)?.name).filter(Boolean);
        return `${studentNames.join(', ')}を${groupNames.join(', ')}に${condition.shouldPlace ? '配置' : '配置しない'}`;
      }
      case "role-group": {
        const groupNames = condition.groupIds.map(gid => groups.find(g => g.id === gid)?.name).filter(Boolean);
        const filterName = condition.roleId 
          ? roles.find(r => r.id === condition.roleId)?.name || '不明なロール'
          : condition.gender === 'male' ? '男性' : condition.gender === 'female' ? '女性' : 'その他';
        return `${filterName}を${groupNames.join(', ')}に${condition.count}人配置`;
      }
      case "student-distance": {
        const student1 = students.find(s => s.id === condition.studentId1);
        const student2 = students.find(s => s.id === condition.studentId2);
        return `${student1?.name || '不明'}と${student2?.name || '不明'}を${condition.shouldBeClose ? '近く' : '遠く'}に配置`;
      }
      default:
        return '不明な条件';
    }
  };

  const getCardStyle = () => {
    if (!checkResult) {
      return {
        backgroundColor: '#f7fafc',
        border: '1px solid #e2e8f0'
      };
    }
    if (checkResult.satisfied) {
      return {
        backgroundColor: '#d1fae5',
        border: '2px solid #10b981'
      };
    } else {
      return {
        backgroundColor: '#fee2e2',
        border: '2px solid #ef4444'
      };
    }
  };

  const cardStyle = getCardStyle();

  return (
    <div style={{
      padding: 'var(--spacing-md)',
      backgroundColor: cardStyle.backgroundColor,
      border: cardStyle.border,
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
