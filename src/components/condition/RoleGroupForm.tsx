import React, { useState } from 'react';
import { useSeatStore } from '../../stores/seatStore';
import { Condition } from '../../types';

interface RoleGroupFormProps {
  onAdd: (condition: Omit<Extract<Condition, { type: 'role-group' }>, 'id'>) => void;
  onCancel: () => void;
}

export const RoleGroupForm: React.FC<RoleGroupFormProps> = ({ onAdd, onCancel }) => {
  const { roles, groups } = useSeatStore();
  const [filterType, setFilterType] = useState<'role' | 'gender'>('role');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | 'other'>('male');
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [count, setCount] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGroupIds.length > 0) {
      onAdd({
        type: 'role-group',
        enabled: true,
        name: filterType === 'gender' ? '性別-グループ条件' : 'ロール-グループ条件',
        roleId: filterType === 'role' ? selectedRoleId : undefined,
        gender: filterType === 'gender' ? selectedGender : undefined,
        groupIds: selectedGroupIds,
        count
      });
    }
  };

  const handleGroupToggle = (groupId: string) => {
    setSelectedGroupIds(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 'var(--spacing-md)' }}>
      <h3 style={{ marginBottom: 'var(--spacing-md)' }}>ロール/性別-グループ条件を追加</h3>
      
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <label className="text-subheadline" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
          絞り込み条件
        </label>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
          <button
            type="button"
            onClick={() => setFilterType('role')}
            className={`btn ${filterType === 'role' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
          >
            ロール
          </button>
          <button
            type="button"
            onClick={() => setFilterType('gender')}
            className={`btn ${filterType === 'gender' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
          >
            性別
          </button>
        </div>
        
        {filterType === 'role' ? (
          <select
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            style={{
              width: '100%',
              padding: 'var(--spacing-sm)',
              border: '1px solid var(--color-secondary-300)',
              borderRadius: 'var(--radius-md)',
              fontSize: '1rem'
            }}
          >
            <option value="">ロールを選択</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
        ) : (
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value as 'male' | 'female' | 'other')}
            style={{
              width: '100%',
              padding: 'var(--spacing-sm)',
              border: '1px solid var(--color-secondary-300)',
              borderRadius: 'var(--radius-md)',
              fontSize: '1rem'
            }}
          >
            <option value="male">男性</option>
            <option value="female">女性</option>
            <option value="other">その他</option>
          </select>
        )}
      </div>

      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <label className="text-subheadline" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
          対象グループ（複数選択可）
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
          {groups.map(group => (
            <label key={group.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <input
                type="checkbox"
                checked={selectedGroupIds.includes(group.id)}
                onChange={() => handleGroupToggle(group.id)}
              />
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: group.color,
                  border: '1px solid var(--color-secondary-300)'
                }}
              />
              {group.name}
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <label className="text-subheadline" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
          配置する人数
        </label>
        <input
          type="number"
          min="1"
          value={count}
          onChange={(e) => setCount(parseInt(e.target.value) || 1)}
          style={{
            width: '100%',
            padding: 'var(--spacing-sm)',
            border: '1px solid var(--color-secondary-300)',
            borderRadius: 'var(--radius-md)',
            fontSize: '1rem'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          キャンセル
        </button>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={selectedGroupIds.length === 0 || (filterType === 'role' && !selectedRoleId)}
        >
          追加
        </button>
      </div>
    </form>
  );
};
