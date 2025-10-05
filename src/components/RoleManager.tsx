import React, { useState } from 'react';
import { useSeatStore } from '../stores/seatStore';
import { Role } from '../types';
import { 
  Crown, 
  Shield, 
  Utensils, 
  BookOpen, 
  Users, 
  Clipboard, 
  Calendar,
  MessageSquare,
  Settings,
  Award
} from 'lucide-react';

const ROLE_ICONS = [
  { id: 'crown', name: '王冠', component: Crown },
  { id: 'shield', name: '盾', component: Shield },
  { id: 'utensils', name: '給食', component: Utensils },
  { id: 'book', name: '学習', component: BookOpen },
  { id: 'users', name: 'グループ', component: Users },
  { id: 'clipboard', name: '記録', component: Clipboard },
  { id: 'calendar', name: '予定', component: Calendar },
  { id: 'message', name: '連絡', component: MessageSquare },
  { id: 'settings', name: '設定', component: Settings },
  { id: 'award', name: '表彰', component: Award }
];

export const RoleManager: React.FC = () => {
  const { roles, addRole, removeRole, updateRole } = useSeatStore();
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleIcon, setNewRoleIcon] = useState(ROLE_ICONS[0].id);
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingIcon, setEditingIcon] = useState('');
  const [editingDescription, setEditingDescription] = useState('');

  const handleAddRole = () => {
    if (newRoleName.trim()) {
      const role: Role = {
        id: `role-${Date.now()}`,
        name: newRoleName.trim(),
        icon: newRoleIcon,
        description: newRoleDescription.trim() || undefined
      };
      addRole(role);
      setNewRoleName('');
      setNewRoleDescription('');
      setNewRoleIcon(ROLE_ICONS[0].id);
    }
  };

  const handleEditStart = (role: Role) => {
    setEditingId(role.id);
    setEditingName(role.name);
    setEditingIcon(role.icon);
    setEditingDescription(role.description || '');
  };

  const handleEditSave = () => {
    if (editingId && editingName.trim()) {
      updateRole(editingId, { 
        name: editingName.trim(), 
        icon: editingIcon,
        description: editingDescription.trim() || undefined
      });
      setEditingId(null);
      setEditingName('');
      setEditingIcon('');
      setEditingDescription('');
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingName('');
    setEditingIcon('');
    setEditingDescription('');
  };

  return (
    <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
      <h2 className="text-title3" style={{ marginBottom: 'var(--spacing-lg)' }}>
        ロール管理
      </h2>
      
      {/* ロール追加フォーム */}
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h3 className="text-headline" style={{ marginBottom: 'var(--spacing-md)' }}>
          新しいロールを追加
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          <input
            type="text"
            placeholder="ロール名（例：班長、副班長、給食係）"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddRole()}
            style={{
              padding: 'var(--spacing-sm)',
              border: '1px solid var(--color-secondary-300)',
              borderRadius: 'var(--radius-md)',
              fontSize: '1rem',
              width: '100%'
            }}
          />
          <div style={{ display: 'flex', gap: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
            {ROLE_ICONS.map((iconData) => {
              const IconComponent = iconData.component;
              return (
                <button
                  key={iconData.id}
                  onClick={() => setNewRoleIcon(iconData.id)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-md)',
                    border: newRoleIcon === iconData.id ? '2px solid var(--color-primary-600)' : '1px solid var(--color-secondary-300)',
                    backgroundColor: newRoleIcon === iconData.id ? 'var(--color-primary-50)' : 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                  title={iconData.name}
                >
                  <IconComponent size={16} color={newRoleIcon === iconData.id ? 'var(--color-primary-600)' : 'var(--color-secondary-600)'} />
                </button>
              );
            })}
          </div>
          <input
            type="text"
            placeholder="説明（任意）"
            value={newRoleDescription}
            onChange={(e) => setNewRoleDescription(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddRole()}
            style={{
              padding: 'var(--spacing-sm)',
              border: '1px solid var(--color-secondary-300)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem'
            }}
          />
          <button
            className="btn btn-primary"
            onClick={handleAddRole}
            disabled={!newRoleName.trim()}
          >
            ロールを追加
          </button>
        </div>
      </div>

      {/* ロール一覧 */}
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {roles.length === 0 ? (
          <p className="text-callout" style={{ opacity: 0.7 }}>
            ロールを追加してください
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
              <span style={{ textAlign: 'center' }}>アイコン</span>
              <span>ロール名</span>
              <span>説明</span>
              <span style={{ textAlign: 'center' }}>操作</span>
            </div>
            
            {roles.map((role) => (
              <div
                key={role.id}
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
                {editingId === role.id ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
                        {ROLE_ICONS.slice(0, 5).map((iconData) => {
                          const IconComponent = iconData.component;
                          return (
                            <button
                              key={iconData.id}
                              onClick={() => setEditingIcon(iconData.id)}
                              style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: 'var(--radius-sm)',
                                border: editingIcon === iconData.id ? '2px solid var(--color-primary-600)' : '1px solid var(--color-secondary-300)',
                                backgroundColor: editingIcon === iconData.id ? 'var(--color-primary-50)' : 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                              title={iconData.name}
                            >
                              <IconComponent size={10} color={editingIcon === iconData.id ? 'var(--color-primary-600)' : 'var(--color-secondary-600)'} />
                            </button>
                          );
                        })}
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
                      {(() => {
                        const iconData = ROLE_ICONS.find(icon => icon.id === role.icon);
                        const IconComponent = iconData?.component;
                        return IconComponent ? (
                          <div
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: 'var(--color-secondary-100)',
                              border: '1px solid var(--color-secondary-300)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title={iconData.name}
                          >
                            <IconComponent size={14} color="var(--color-secondary-600)" />
                          </div>
                        ) : null;
                      })()}
                    </div>
                    <span className="text-body" style={{ fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {role.name}
                    </span>
                    <span className="text-callout" style={{ opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {role.description || '-'}
                    </span>
                    <div style={{ display: 'flex', gap: 'var(--spacing-xs)', justifyContent: 'center' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleEditStart(role)}
                        style={{ padding: 'var(--spacing-xs) var(--spacing-sm)', fontSize: '0.75rem' }}
                      >
                        編集
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => removeRole(role.id)}
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
