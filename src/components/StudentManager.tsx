import React, { useState } from 'react';
import { useSeatStore } from '../stores/seatStore';
import { Student } from '../types';
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

export const StudentManager: React.FC = () => {
  const { students, addStudent, removeStudent, updateStudent, currentLayout, roles, assignRoleToStudent, removeRoleFromStudent } = useSeatStore();
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentRoles, setNewStudentRoles] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [sortBy, setSortBy] = useState<'attendanceNo' | 'seat'>('attendanceNo');
  const [showRoleMenu, setShowRoleMenu] = useState<string | null>(null);

  // 生徒の席番号を取得
  const getStudentSeatNumber = (studentId: string) => {
    if (!currentLayout) return 0;
    
    const seatIndex = currentLayout.seats.findIndex(seat => seat.studentId === studentId);
    if (seatIndex === -1) return 0;
    
    // 生徒が割り当てられた席の番号を計算
    let seatNumber = 0;
    for (let i = 0; i <= seatIndex; i++) {
      if (!currentLayout.seats[i].isEmpty && currentLayout.seats[i].studentId) {
        seatNumber++;
      }
    }
    return seatNumber;
  };

  // ソートされた生徒リストを取得
  const getSortedStudents = () => {
    const studentsWithSeatNumbers = students.map(student => ({
      ...student,
      seatNumber: getStudentSeatNumber(student.id)
    }));

    if (sortBy === 'seat') {
      return studentsWithSeatNumbers.sort((a, b) => {
        if (a.seatNumber === 0 && b.seatNumber === 0) return 0;
        if (a.seatNumber === 0) return 1;
        if (b.seatNumber === 0) return -1;
        return a.seatNumber - b.seatNumber;
      });
    } else {
      return studentsWithSeatNumbers.sort((a, b) => a.studentNumber - b.studentNumber);
    }
  };

  const handleAddStudent = () => {
    if (newStudentName.trim()) {
      const student: Student = {
        id: `student-${Date.now()}`,
        name: newStudentName.trim(),
        studentNumber: 0, // ストアで自動割り当てされる
        roleIds: newStudentRoles
      };
      addStudent(student);
      setNewStudentName('');
      setNewStudentRoles([]);
    }
  };

  const handleNewStudentRoleToggle = (roleId: string) => {
    setNewStudentRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleEditStart = (student: Student) => {
    setEditingId(student.id);
    setEditingName(student.name);
  };

  const handleEditSave = () => {
    if (editingId && editingName.trim()) {
      updateStudent(editingId, { name: editingName.trim() });
      setEditingId(null);
      setEditingName('');
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleRoleToggle = (studentId: string, roleId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      if (student.roleIds.includes(roleId)) {
        removeRoleFromStudent(studentId, roleId);
      } else {
        assignRoleToStudent(studentId, roleId);
      }
    }
  };

  const getStudentRoles = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return [];
    return roles.filter(role => student.roleIds.includes(role.id));
  };

  return (
    <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <h2 className="text-title3">生徒管理</h2>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <button
            className={`btn ${sortBy === 'attendanceNo' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSortBy('attendanceNo')}
            style={{ padding: 'var(--spacing-xs) var(--spacing-sm)', fontSize: '0.75rem' }}
          >
            出席番号順
          </button>
          <button
            className={`btn ${sortBy === 'seat' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSortBy('seat')}
            style={{ padding: 'var(--spacing-xs) var(--spacing-sm)', fontSize: '0.75rem' }}
          >
            座席順
          </button>
        </div>
      </div>
      
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div className="flex" style={{ marginBottom: 'var(--spacing-sm)', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
          <input
            type="text"
            placeholder="生徒名を入力"
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddStudent()}
            style={{
              padding: 'var(--spacing-sm)',
              border: '1px solid var(--color-secondary-300)',
              borderRadius: 'var(--radius-md)',
              fontSize: '1rem',
              flex: '1',
              minWidth: '200px'
            }}
          />
          <button
            className="btn btn-primary"
            onClick={handleAddStudent}
            disabled={!newStudentName.trim()}
          >
            追加
          </button>
        </div>
        
        {/* ロール選択 */}
        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: 'var(--spacing-xs)', color: 'var(--color-secondary-700)' }}>
            ロールを選択（任意）
          </div>
          {roles.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
              {roles.map((role) => {
                const iconData = ROLE_ICONS.find(icon => icon.id === role.icon);
                const IconComponent = iconData?.component;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleNewStudentRoleToggle(role.id)}
                    style={{
                      padding: 'var(--spacing-xs) var(--spacing-sm)',
                      fontSize: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-secondary-300)',
                      backgroundColor: newStudentRoles.includes(role.id) ? 'var(--color-primary-100)' : 'transparent',
                      color: newStudentRoles.includes(role.id) ? 'var(--color-primary-800)' : 'var(--color-secondary-600)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {IconComponent && <IconComponent size={12} />}
                    {role.name}
                  </button>
                );
              })}
            </div>
          ) : (
            <p style={{ fontSize: '0.75rem', color: 'var(--color-secondary-500)', fontStyle: 'italic' }}>
              ロール管理でロールを作成してください
            </p>
          )}
        </div>
      </div>

      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {students.length === 0 ? (
          <p className="text-callout" style={{ opacity: 0.7 }}>
            生徒を追加してください
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {/* ヘッダー */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '60px 1fr 1fr 120px',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              padding: 'var(--spacing-sm)',
              backgroundColor: 'var(--color-secondary-200)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-secondary-300)',
              fontWeight: 'bold',
              fontSize: '0.875rem'
            }}>
              <span style={{ textAlign: 'center' }}>出席番号</span>
              <span>名前</span>
              <span>ロール</span>
              <span style={{ textAlign: 'center' }}>操作</span>
            </div>
            
            {getSortedStudents().map((student, index) => (
              <div
                key={student.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 1fr 120px',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  padding: 'var(--spacing-sm)',
                  backgroundColor: 'var(--color-secondary-100)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-secondary-200)'
                }}
              >
                {editingId === student.id ? (
                  <>
                    <span 
                      style={{ 
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        color: 'var(--color-secondary-600)',
                        textAlign: 'center'
                      }}
                    >
                      {student.studentNumber}
                    </span>
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
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                      {roles.map((role) => {
                        const iconData = ROLE_ICONS.find(icon => icon.id === role.icon);
                        const IconComponent = iconData?.component;
                        return (
                          <button
                            key={role.id}
                            onClick={() => handleRoleToggle(student.id, role.id)}
                            style={{
                              padding: '2px 6px',
                              fontSize: '0.7rem',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--color-secondary-300)',
                              backgroundColor: student.roleIds.includes(role.id) ? 'var(--color-primary-100)' : 'transparent',
                              color: student.roleIds.includes(role.id) ? 'var(--color-primary-800)' : 'var(--color-secondary-600)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px'
                            }}
                          >
                            {IconComponent && <IconComponent size={10} />}
                            {role.name}
                          </button>
                        );
                      })}
                    </div>
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
                    <span 
                      style={{ 
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        color: 'var(--color-secondary-600)',
                        textAlign: 'center'
                      }}
                    >
                      {student.studentNumber}
                    </span>
                    <span className="text-body" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {student.name}
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                      {getStudentRoles(student.id).map((role) => {
                        const iconData = ROLE_ICONS.find(icon => icon.id === role.icon);
                        const IconComponent = iconData?.component;
                        return (
                          <span
                            key={role.id}
                            style={{
                              padding: '2px 6px',
                              fontSize: '0.7rem',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'var(--color-primary-100)',
                              color: 'var(--color-primary-800)',
                              fontWeight: '500',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px'
                            }}
                          >
                            {IconComponent && <IconComponent size={10} />}
                            {role.name}
                          </span>
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--spacing-xs)', justifyContent: 'center' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleEditStart(student)}
                        style={{ padding: 'var(--spacing-xs) var(--spacing-sm)', fontSize: '0.75rem' }}
                      >
                        編集
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => removeStudent(student.id)}
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
