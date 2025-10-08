import React, { useState } from 'react';
import { useSeatStore } from '../stores/seatStore';
import { 
  StudentGroupCondition, 
  RoleGroupCondition, 
  StudentDistanceCondition,
  Student,
  Group,
  Role
} from '../types';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Target, 
  Minus, 
  Plus,
  Edit3,
  Trash2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export const ConditionManager: React.FC = () => {
  const { 
    conditions, 
    students, 
    groups, 
    roles, 
    addCondition, 
    removeCondition, 
    updateCondition, 
    toggleCondition 
  } = useSeatStore();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [conditionType, setConditionType] = useState<'student-group' | 'role-group' | 'student-distance'>('student-group');
  const [editingId, setEditingId] = useState<string | null>(null);

  // 生徒-グループ条件のフォーム状態
  const [studentGroupForm, setStudentGroupForm] = useState({
    name: '',
    studentIds: [] as string[],
    groupIds: [] as string[],
    shouldPlace: true
  });

  // ロール/性別-グループ条件のフォーム状態
  const [roleGroupForm, setRoleGroupForm] = useState({
    name: '',
    filterType: 'role' as 'role' | 'gender',
    roleId: '',
    gender: 'male' as 'male' | 'female' | 'other',
    groupIds: [] as string[],
    count: 1
  });

  // 生徒間距離条件のフォーム状態
  const [studentDistanceForm, setStudentDistanceForm] = useState({
    name: '',
    studentId1: '',
    studentId2: '',
    shouldBeClose: true
  });

  const resetForms = () => {
    setStudentGroupForm({ name: '', studentIds: [], groupIds: [], shouldPlace: true });
    setRoleGroupForm({ name: '', filterType: 'role', roleId: '', gender: 'male', groupIds: [], count: 1 });
    setStudentDistanceForm({ name: '', studentId1: '', studentId2: '', shouldBeClose: true });
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleAddCondition = () => {
    let newCondition: StudentGroupCondition | RoleGroupCondition | StudentDistanceCondition;

    switch (conditionType) {
      case 'student-group':
        newCondition = {
          id: `condition-${Date.now()}`,
          name: studentGroupForm.name || '生徒-グループ条件',
          type: 'student-group',
          enabled: true,
          studentIds: studentGroupForm.studentIds,
          groupIds: studentGroupForm.groupIds,
          shouldPlace: studentGroupForm.shouldPlace
        };
        break;
      case 'role-group':
        newCondition = {
          id: `condition-${Date.now()}`,
          name: roleGroupForm.name || (roleGroupForm.filterType === 'gender' ? '性別-グループ条件' : 'ロール/性別-グループ条件'),
          type: 'role-group',
          enabled: true,
          ...(roleGroupForm.filterType === 'role' 
            ? { roleId: roleGroupForm.roleId } 
            : { gender: roleGroupForm.gender }),
          groupIds: roleGroupForm.groupIds,
          count: roleGroupForm.count
        };
        break;
      case 'student-distance':
        newCondition = {
          id: `condition-${Date.now()}`,
          name: studentDistanceForm.name || '生徒間距離条件',
          type: 'student-distance',
          enabled: true,
          studentId1: studentDistanceForm.studentId1,
          studentId2: studentDistanceForm.studentId2,
          shouldBeClose: studentDistanceForm.shouldBeClose
        };
        break;
    }

    addCondition(newCondition);
    resetForms();
  };

  const handleEditCondition = (condition: StudentGroupCondition | RoleGroupCondition | StudentDistanceCondition) => {
    setEditingId(condition.id);
    setConditionType(condition.type);
    
    if (condition.type === 'student-group') {
      setStudentGroupForm({
        name: condition.name,
        studentIds: condition.studentIds,
        groupIds: condition.groupIds,
        shouldPlace: condition.shouldPlace
      });
    } else if (condition.type === 'role-group') {
      setRoleGroupForm({
        name: condition.name,
        filterType: condition.roleId ? 'role' : 'gender',
        roleId: condition.roleId || '',
        gender: condition.gender || 'male',
        groupIds: condition.groupIds,
        count: condition.count
      });
    } else if (condition.type === 'student-distance') {
      setStudentDistanceForm({
        name: condition.name,
        studentId1: condition.studentId1,
        studentId2: condition.studentId2,
        shouldBeClose: condition.shouldBeClose
      });
    }
    setShowAddForm(true);
  };

  const handleUpdateCondition = () => {
    if (!editingId) return;

    let updates: Partial<StudentGroupCondition | RoleGroupCondition | StudentDistanceCondition> = {};

    switch (conditionType) {
      case 'student-group':
        updates = {
          name: studentGroupForm.name,
          studentIds: studentGroupForm.studentIds,
          groupIds: studentGroupForm.groupIds,
          shouldPlace: studentGroupForm.shouldPlace
        };
        break;
      case 'role-group':
        updates = {
          name: roleGroupForm.name,
          ...(roleGroupForm.filterType === 'role' 
            ? { roleId: roleGroupForm.roleId, gender: undefined } 
            : { gender: roleGroupForm.gender, roleId: undefined }),
          groupIds: roleGroupForm.groupIds,
          count: roleGroupForm.count
        };
        break;
      case 'student-distance':
        updates = {
          name: studentDistanceForm.name,
          studentId1: studentDistanceForm.studentId1,
          studentId2: studentDistanceForm.studentId2,
          shouldBeClose: studentDistanceForm.shouldBeClose
        };
        break;
    }

    updateCondition(editingId, updates);
    resetForms();
  };

  const getStudentName = (studentId: string) => {
    return students.find(s => s.id === studentId)?.name || '不明な生徒';
  };

  const getGroupName = (groupId: string) => {
    return groups.find(g => g.id === groupId)?.name || '不明なグループ';
  };

  const getRoleName = (roleId: string) => {
    return roles.find(r => r.id === roleId)?.name || '不明なロール';
  };

  const renderConditionCard = (condition: StudentGroupCondition | RoleGroupCondition | StudentDistanceCondition) => {
    const isEnabled = condition.enabled;
    
    return (
      <div
        key={condition.id}
        style={{
          padding: 'var(--spacing-md)',
          backgroundColor: isEnabled ? 'var(--color-secondary-50)' : 'var(--color-secondary-100)',
          border: `1px solid ${isEnabled ? 'var(--color-primary-300)' : 'var(--color-secondary-300)'}`,
          borderRadius: 'var(--radius-lg)',
          opacity: isEnabled ? 1 : 0.7,
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-sm)' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
              {condition.type === 'student-group' && <Users size={16} />}
              {condition.type === 'role-group' && <Target size={16} />}
              {condition.type === 'student-distance' && <UserCheck size={16} />}
              <h3 className="text-subheadline" style={{ margin: 0, fontWeight: '600' }}>
                {condition.name}
              </h3>
              <button
                onClick={() => toggleCondition(condition.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {isEnabled ? (
                  <ToggleRight size={20} color="var(--color-primary-600)" />
                ) : (
                  <ToggleLeft size={20} color="var(--color-secondary-400)" />
                )}
              </button>
            </div>
            
            <div style={{ fontSize: '0.875rem', color: 'var(--color-secondary-600)' }}>
              {condition.type === 'student-group' && (
                <div>
                  <span style={{ fontWeight: '500' }}>
                    {condition.studentIds.map(getStudentName).join(', ')}
                  </span>
                  <span style={{ margin: '0 var(--spacing-xs)' }}>
                    {condition.shouldPlace ? 'を' : 'を'}
                  </span>
                  <span style={{ fontWeight: '500' }}>
                    {condition.groupIds.map(getGroupName).join(', ')}
                  </span>
                  <span style={{ margin: '0 var(--spacing-xs)' }}>
                    {condition.shouldPlace ? 'に配置する' : 'に配置しない'}
                  </span>
                </div>
              )}
              
              {condition.type === 'role-group' && (
                <div>
                  <span style={{ fontWeight: '500' }}>{getRoleName(condition.roleId)}</span>
                  <span style={{ margin: '0 var(--spacing-xs)' }}>を</span>
                  <span style={{ fontWeight: '500' }}>
                    {condition.groupIds.map(getGroupName).join(', ')}
                  </span>
                  <span style={{ margin: '0 var(--spacing-xs)' }}>に</span>
                  <span style={{ fontWeight: '500' }}>{condition.count}人</span>
                  <span style={{ margin: '0 var(--spacing-xs)' }}>配置する</span>
                </div>
              )}
              
              {condition.type === 'student-distance' && (
                <div>
                  <span style={{ fontWeight: '500' }}>{getStudentName(condition.studentId1)}</span>
                  <span style={{ margin: '0 var(--spacing-xs)' }}>と</span>
                  <span style={{ fontWeight: '500' }}>{getStudentName(condition.studentId2)}</span>
                  <span style={{ margin: '0 var(--spacing-xs)' }}>
                    {condition.shouldBeClose ? 'を近くに配置する' : 'を遠くに配置する'}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
            <button
              className="btn btn-secondary"
              onClick={() => handleEditCondition(condition)}
              style={{ padding: 'var(--spacing-xs)', fontSize: '0.75rem' }}
            >
              <Edit3 size={14} />
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => removeCondition(condition.id)}
              style={{ 
                padding: 'var(--spacing-xs)', 
                fontSize: '0.75rem',
                backgroundColor: 'var(--color-error-100)',
                color: 'var(--color-error-800)',
                borderColor: 'var(--color-error-300)'
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderAddForm = () => {
    if (!showAddForm) return null;

    return (
      <div style={{
        padding: 'var(--spacing-lg)',
        backgroundColor: 'var(--color-primary-50)',
        border: '1px solid var(--color-primary-200)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: 'var(--spacing-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
          <h3 className="text-headline">
            {editingId ? '条件を編集' : '新しい条件を追加'}
          </h3>
          <button
            className="btn btn-secondary"
            onClick={resetForms}
            style={{ padding: 'var(--spacing-xs) var(--spacing-sm)' }}
          >
            キャンセル
          </button>
        </div>

        {/* 条件タイプ選択 */}
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <label className="text-subheadline" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
            条件タイプ
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {[
              { 
                type: 'student-group', 
                label: '生徒-グループ', 
                icon: Users,
                example: '例: 田中さんを前方グループに配置する'
              },
              { 
                type: 'role-group', 
                label: 'ロール/性別-グループ', 
                icon: Target,
                example: '例: 班長を各グループに1人配置する / 各班に男子を2人配置する'
              },
              { 
                type: 'student-distance', 
                label: '生徒間距離', 
                icon: UserCheck,
                example: '例: 仲の良い2人を隣に配置する'
              }
            ].map(({ type, label, icon: Icon, example }) => (
              <div key={type} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                <button
                  onClick={() => setConditionType(type as any)}
                  className={`btn ${conditionType === type ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 'var(--spacing-xs)',
                    justifyContent: 'flex-start',
                    textAlign: 'left'
                  }}
                >
                  <Icon size={16} />
                  {label}
                </button>
                {conditionType === type && (
                  <p className="text-callout" style={{ 
                    color: 'var(--color-primary-600)', 
                    fontStyle: 'italic',
                    marginLeft: '24px'
                  }}>
                    {example}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 条件名入力 */}
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <label className="text-subheadline" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
            条件名
          </label>
          <input
            type="text"
            placeholder="条件名を入力"
            value={
              conditionType === 'student-group' ? studentGroupForm.name :
              conditionType === 'role-group' ? roleGroupForm.name :
              studentDistanceForm.name
            }
            onChange={(e) => {
              if (conditionType === 'student-group') {
                setStudentGroupForm(prev => ({ ...prev, name: e.target.value }));
              } else if (conditionType === 'role-group') {
                setRoleGroupForm(prev => ({ ...prev, name: e.target.value }));
              } else {
                setStudentDistanceForm(prev => ({ ...prev, name: e.target.value }));
              }
            }}
            style={{
              width: '100%',
              padding: 'var(--spacing-sm)',
              border: '1px solid var(--color-secondary-300)',
              borderRadius: 'var(--radius-md)',
              fontSize: '1rem'
            }}
          />
        </div>

        {/* 生徒-グループ条件フォーム */}
        {conditionType === 'student-group' && (
          <div>
            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <label className="text-subheadline" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                対象生徒（複数選択可）
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
                {students.map(student => (
                  <button
                    key={student.id}
                    onClick={() => {
                      setStudentGroupForm(prev => ({
                        ...prev,
                        studentIds: prev.studentIds.includes(student.id)
                          ? prev.studentIds.filter(id => id !== student.id)
                          : [...prev.studentIds, student.id]
                      }));
                    }}
                    style={{
                      padding: 'var(--spacing-xs) var(--spacing-sm)',
                      fontSize: '0.875rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-secondary-300)',
                      backgroundColor: studentGroupForm.studentIds.includes(student.id) 
                        ? 'var(--color-primary-100)' 
                        : 'transparent',
                      color: studentGroupForm.studentIds.includes(student.id) 
                        ? 'var(--color-primary-800)' 
                        : 'var(--color-secondary-600)',
                      cursor: 'pointer'
                    }}
                  >
                    {student.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <label className="text-subheadline" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                対象グループ（複数選択可）
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
                {groups.map(group => (
                  <button
                    key={group.id}
                    onClick={() => {
                      setStudentGroupForm(prev => ({
                        ...prev,
                        groupIds: prev.groupIds.includes(group.id)
                          ? prev.groupIds.filter(id => id !== group.id)
                          : [...prev.groupIds, group.id]
                      }));
                    }}
                    style={{
                      padding: 'var(--spacing-xs) var(--spacing-sm)',
                      fontSize: '0.875rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-secondary-300)',
                      backgroundColor: studentGroupForm.groupIds.includes(group.id) 
                        ? 'var(--color-primary-100)' 
                        : 'transparent',
                      color: studentGroupForm.groupIds.includes(group.id) 
                        ? 'var(--color-primary-800)' 
                        : 'var(--color-secondary-600)',
                      cursor: 'pointer'
                    }}
                  >
                    {group.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <label className="text-subheadline" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                配置設定
              </label>
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                <button
                  onClick={() => setStudentGroupForm(prev => ({ ...prev, shouldPlace: true }))}
                  className={`btn ${studentGroupForm.shouldPlace ? 'btn-primary' : 'btn-secondary'}`}
                >
                  <UserCheck size={16} />
                  配置する
                </button>
                <button
                  onClick={() => setStudentGroupForm(prev => ({ ...prev, shouldPlace: false }))}
                  className={`btn ${!studentGroupForm.shouldPlace ? 'btn-primary' : 'btn-secondary'}`}
                >
                  <UserX size={16} />
                  配置しない
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ロール/性別-グループ条件フォーム */}
        {conditionType === 'role-group' && (
          <div>
            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <label className="text-subheadline" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                絞り込み条件
              </label>
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                <button
                  onClick={() => setRoleGroupForm(prev => ({ ...prev, filterType: 'role' }))}
                  className={`btn ${roleGroupForm.filterType === 'role' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                >
                  ロール
                </button>
                <button
                  onClick={() => setRoleGroupForm(prev => ({ ...prev, filterType: 'gender' }))}
                  className={`btn ${roleGroupForm.filterType === 'gender' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                >
                  性別
                </button>
              </div>
              
              {roleGroupForm.filterType === 'role' ? (
                <select
                  value={roleGroupForm.roleId}
                  onChange={(e) => setRoleGroupForm(prev => ({ ...prev, roleId: e.target.value }))}
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
                  value={roleGroupForm.gender}
                  onChange={(e) => setRoleGroupForm(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' | 'other' }))}
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
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
                {groups.map(group => (
                  <button
                    key={group.id}
                    onClick={() => {
                      setRoleGroupForm(prev => ({
                        ...prev,
                        groupIds: prev.groupIds.includes(group.id)
                          ? prev.groupIds.filter(id => id !== group.id)
                          : [...prev.groupIds, group.id]
                      }));
                    }}
                    style={{
                      padding: 'var(--spacing-xs) var(--spacing-sm)',
                      fontSize: '0.875rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-secondary-300)',
                      backgroundColor: roleGroupForm.groupIds.includes(group.id) 
                        ? 'var(--color-primary-100)' 
                        : 'transparent',
                      color: roleGroupForm.groupIds.includes(group.id) 
                        ? 'var(--color-primary-800)' 
                        : 'var(--color-secondary-600)',
                      cursor: 'pointer'
                    }}
                  >
                    {group.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <label className="text-subheadline" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                配置人数
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <button
                  onClick={() => setRoleGroupForm(prev => ({ ...prev, count: Math.max(1, prev.count - 1) }))}
                  className="btn btn-secondary"
                  style={{ padding: 'var(--spacing-xs)' }}
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  min="1"
                  value={roleGroupForm.count}
                  onChange={(e) => setRoleGroupForm(prev => ({ ...prev, count: parseInt(e.target.value) || 1 }))}
                  style={{
                    width: '80px',
                    padding: 'var(--spacing-sm)',
                    border: '1px solid var(--color-secondary-300)',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center',
                    fontSize: '1rem'
                  }}
                />
                <button
                  onClick={() => setRoleGroupForm(prev => ({ ...prev, count: prev.count + 1 }))}
                  className="btn btn-secondary"
                  style={{ padding: 'var(--spacing-xs)' }}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 生徒間距離条件フォーム */}
        {conditionType === 'student-distance' && (
          <div>
            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <label className="text-subheadline" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                生徒1
              </label>
              <select
                value={studentDistanceForm.studentId1}
                onChange={(e) => setStudentDistanceForm(prev => ({ ...prev, studentId1: e.target.value }))}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-sm)',
                  border: '1px solid var(--color-secondary-300)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '1rem'
                }}
              >
                <option value="">生徒を選択</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>{student.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <label className="text-subheadline" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                生徒2
              </label>
              <select
                value={studentDistanceForm.studentId2}
                onChange={(e) => setStudentDistanceForm(prev => ({ ...prev, studentId2: e.target.value }))}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-sm)',
                  border: '1px solid var(--color-secondary-300)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '1rem'
                }}
              >
                <option value="">生徒を選択</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>{student.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <label className="text-subheadline" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                距離設定
              </label>
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                <button
                  onClick={() => setStudentDistanceForm(prev => ({ ...prev, shouldBeClose: true }))}
                  className={`btn ${studentDistanceForm.shouldBeClose ? 'btn-primary' : 'btn-secondary'}`}
                >
                  <UserCheck size={16} />
                  近くに配置
                </button>
                <button
                  onClick={() => setStudentDistanceForm(prev => ({ ...prev, shouldBeClose: false }))}
                  className={`btn ${!studentDistanceForm.shouldBeClose ? 'btn-primary' : 'btn-secondary'}`}
                >
                  <UserX size={16} />
                  遠くに配置
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 保存ボタン */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)' }}>
          <button
            className="btn btn-primary"
            onClick={editingId ? handleUpdateCondition : handleAddCondition}
            disabled={
              (conditionType === 'student-group' && (studentGroupForm.studentIds.length === 0 || studentGroupForm.groupIds.length === 0)) ||
              (conditionType === 'role-group' && ((roleGroupForm.filterType === 'role' && !roleGroupForm.roleId) || roleGroupForm.groupIds.length === 0)) ||
              (conditionType === 'student-distance' && (!studentDistanceForm.studentId1 || !studentDistanceForm.studentId2))
            }
          >
            {editingId ? '更新' : '追加'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <h2 className="text-title3">条件管理</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm}
        >
          <Plus size={16} />
          条件を追加
        </button>
      </div>

      {/* 使用例の説明 */}
      <div style={{
        padding: 'var(--spacing-md)',
        backgroundColor: 'var(--color-primary-50)',
        border: '1px solid var(--color-primary-200)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: 'var(--spacing-lg)'
      }}>
        <h3 className="text-headline" style={{ marginBottom: 'var(--spacing-md)', color: 'var(--color-primary-800)' }}>
          条件の使用例
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
              <Users size={16} color="var(--color-primary-600)" />
              <span className="text-subheadline" style={{ fontWeight: '600', color: 'var(--color-primary-800)' }}>
                生徒-グループ条件
              </span>
            </div>
            <p className="text-callout" style={{ color: 'var(--color-primary-700)', marginLeft: '28px' }}>
              「田中さんと佐藤さんを前方グループに配置する」「特定の生徒を後方グループに配置しない」など
            </p>
          </div>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
              <Target size={16} color="var(--color-primary-600)" />
              <span className="text-subheadline" style={{ fontWeight: '600', color: 'var(--color-primary-800)' }}>
                ロール/性別-グループ条件
              </span>
            </div>
            <p className="text-callout" style={{ color: 'var(--color-primary-700)', marginLeft: '28px' }}>
              「班長を各グループに1人ずつ配置する」「各班に男子を2人配置する」など
            </p>
          </div>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
              <UserCheck size={16} color="var(--color-primary-600)" />
              <span className="text-subheadline" style={{ fontWeight: '600', color: 'var(--color-primary-800)' }}>
                生徒間距離条件
              </span>
            </div>
            <p className="text-callout" style={{ color: 'var(--color-primary-700)', marginLeft: '28px' }}>
              「仲の良い2人を隣に配置する」「喧嘩した2人を遠くに配置する」など
            </p>
          </div>
        </div>
      </div>

      {renderAddForm()}

      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {conditions.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 'var(--spacing-xl)',
            backgroundColor: 'var(--color-secondary-100)',
            borderRadius: 'var(--radius-lg)',
            border: '2px dashed var(--color-secondary-300)'
          }}>
            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <Users size={48} color="var(--color-secondary-400)" />
            </div>
            <h3 className="text-headline" style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-secondary-600)' }}>
              条件が設定されていません
            </h3>
            <p className="text-body" style={{ color: 'var(--color-secondary-500)', marginBottom: 'var(--spacing-md)' }}>
              席配置の条件を追加して、より細かい席替え制御を行えます
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', textAlign: 'left', maxWidth: '300px', margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--color-primary-500)', borderRadius: '50%' }}></div>
                <span className="text-callout" style={{ color: 'var(--color-secondary-600)' }}>
                  特定の生徒の配置場所を制御
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--color-primary-500)', borderRadius: '50%' }}></div>
                <span className="text-callout" style={{ color: 'var(--color-secondary-600)' }}>
                  ロール別の配置人数を調整
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--color-primary-500)', borderRadius: '50%' }}></div>
                <span className="text-callout" style={{ color: 'var(--color-secondary-600)' }}>
                  生徒間の距離関係を設定
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {conditions.map(renderConditionCard)}
          </div>
        )}
      </div>
    </div>
  );
};
