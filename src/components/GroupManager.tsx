import React, { useState } from 'react';
import { useSeatStore } from '../stores/seatStore';
import { Group } from '../types';

const GROUP_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f59e0b', // amber
];

export const GroupManager: React.FC = () => {
  const { groups, addGroup, removeGroup, updateGroup } = useSeatStore();
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingColor, setEditingColor] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  
  // 利用可能な色の最初の色を選択
  const availableColors = GROUP_COLORS.filter((color) => {
    return !groups.some(group => group.color === color);
  });
  const [newGroupColor, setNewGroupColor] = useState(availableColors[0] || GROUP_COLORS[0]);

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      const group: Group = {
        id: `group-${Date.now()}`,
        name: newGroupName.trim(),
        color: newGroupColor,
        description: newGroupDescription.trim() || undefined
      };
      addGroup(group);
      setNewGroupName('');
      setNewGroupDescription('');
      
      // 次の利用可能な色を選択
      const nextAvailableColors = GROUP_COLORS.filter((color) => {
        return !groups.some(g => g.color === color) && color !== newGroupColor;
      });
      setNewGroupColor(nextAvailableColors[0] || GROUP_COLORS[0]);
    }
  };

  const handleEditStart = (group: Group) => {
    setEditingId(group.id);
    setEditingName(group.name);
    setEditingColor(group.color);
    setEditingDescription(group.description || '');
  };

  const handleEditSave = () => {
    if (editingId && editingName.trim()) {
      updateGroup(editingId, { 
        name: editingName.trim(), 
        color: editingColor,
        description: editingDescription.trim() || undefined
      });
      setEditingId(null);
      setEditingName('');
      setEditingColor('');
      setEditingDescription('');
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingName('');
    setEditingColor('');
    setEditingDescription('');
  };

  return (
    <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
      <h2 className="text-title3" style={{ marginBottom: 'var(--spacing-lg)' }}>
        グループ管理
      </h2>
      
      {/* グループ追加フォーム */}
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h3 className="text-headline" style={{ marginBottom: 'var(--spacing-md)' }}>
          新しいグループを追加
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          <input
            type="text"
            placeholder="グループ名（例：A班、目が悪い人）"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddGroup()}
            style={{
              padding: 'var(--spacing-sm)',
              border: '1px solid var(--color-secondary-300)',
              borderRadius: 'var(--radius-md)',
              fontSize: '1rem',
              width: '100%'
            }}
          />
          <div style={{ display: 'flex', gap: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
            {GROUP_COLORS.filter((color) => {
              const isColorUsed = groups.some(group => group.color === color);
              return !isColorUsed;
            }).map((color) => (
              <button
                key={color}
                onClick={() => setNewGroupColor(color)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: color,
                  border: newGroupColor === color ? '3px solid var(--color-primary-600)' : '2px solid var(--color-secondary-300)',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
                title={`色: ${color}`}
              />
            ))}
          </div>
          <input
            type="text"
            placeholder="説明（任意）"
            value={newGroupDescription}
            onChange={(e) => setNewGroupDescription(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddGroup()}
            style={{
              padding: 'var(--spacing-sm)',
              border: '1px solid var(--color-secondary-300)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem'
            }}
          />
          <button
            className="btn btn-primary"
            onClick={handleAddGroup}
            disabled={!newGroupName.trim()}
          >
            グループを追加
          </button>
        </div>
      </div>

      {/* グループ一覧 */}
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {groups.length === 0 ? (
          <p className="text-callout" style={{ opacity: 0.7 }}>
            グループを追加してください
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {/* ヘッダー */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr 1fr 120px',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              padding: 'var(--spacing-sm)',
              backgroundColor: 'var(--color-secondary-200)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-secondary-300)',
              fontWeight: 'bold',
              fontSize: '0.875rem'
            }}>
              <span style={{ textAlign: 'center' }}>色</span>
              <span>グループ名</span>
              <span>説明</span>
              <span style={{ textAlign: 'center' }}>操作</span>
            </div>
            
            {groups.map((group) => (
              <div
                key={group.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr 1fr 120px',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  padding: 'var(--spacing-sm)',
                  backgroundColor: 'var(--color-secondary-100)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-secondary-200)'
                }}
              >
                {editingId === group.id ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
                        {GROUP_COLORS.filter((color) => {
                          const isColorUsed = groups.some(group => 
                            group.color === color && group.id !== editingId
                          );
                          return !isColorUsed;
                        }).map((color) => (
                          <button
                            key={color}
                            onClick={() => setEditingColor(color)}
                            style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              backgroundColor: color,
                              border: editingColor === color ? '2px solid var(--color-primary-600)' : '1px solid var(--color-secondary-300)',
                              cursor: 'pointer',
                              flexShrink: 0
                            }}
                            title={`色: ${color}`}
                          />
                        ))}
                      </div>
                    </div>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleEditSave();
                        if (e.key === 'Escape') handleEditCancel();
                      }}
                      style={{
                        padding: 'var(--spacing-xs)',
                        border: '1px solid var(--color-primary-300)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.875rem',
                        width: '100%'
                      }}
                      autoFocus
                    />
                    <input
                      type="text"
                      value={editingDescription}
                      onChange={(e) => setEditingDescription(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleEditSave();
                        if (e.key === 'Escape') handleEditCancel();
                      }}
                      style={{
                        padding: 'var(--spacing-xs)',
                        border: '1px solid var(--color-primary-300)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.875rem',
                        width: '100%'
                      }}
                    />
                    <div style={{ display: 'flex', gap: 'var(--spacing-xs)', justifyContent: 'center' }}>
                      <button
                        className="btn btn-primary"
                        onClick={handleEditSave}
                        style={{ padding: 'var(--spacing-xs) var(--spacing-sm)', fontSize: '0.75rem' }}
                      >
                        保存
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={handleEditCancel}
                        style={{ padding: 'var(--spacing-xs) var(--spacing-sm)', fontSize: '0.75rem' }}
                      >
                        取消
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: group.color,
                          border: '2px solid var(--color-secondary-300)'
                        }}
                        title={`色: ${group.color}`}
                      />
                    </div>
                    <span className="text-body" style={{ fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {group.name}
                    </span>
                    <span className="text-callout" style={{ opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {group.description || '-'}
                    </span>
                    <div style={{ display: 'flex', gap: 'var(--spacing-xs)', justifyContent: 'center' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleEditStart(group)}
                        style={{ padding: 'var(--spacing-xs) var(--spacing-sm)', fontSize: '0.75rem' }}
                      >
                        編集
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => removeGroup(group.id)}
                        style={{ 
                          padding: 'var(--spacing-xs) var(--spacing-sm)', 
                          fontSize: '0.75rem',
                          backgroundColor: 'var(--color-error-100)',
                          color: 'var(--color-error-800)',
                          borderColor: 'var(--color-error-300)'
                        }}
                      >
                        削除
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
