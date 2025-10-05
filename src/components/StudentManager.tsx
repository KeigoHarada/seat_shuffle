import React, { useState } from 'react';
import { useSeatStore } from '../stores/seatStore';
import { Student } from '../types';

export const StudentManager: React.FC = () => {
  const { students, addStudent, removeStudent, updateStudent } = useSeatStore();
  const [newStudentName, setNewStudentName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAddStudent = () => {
    if (newStudentName.trim()) {
      const student: Student = {
        id: `student-${Date.now()}`,
        name: newStudentName.trim()
      };
      addStudent(student);
      setNewStudentName('');
    }
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

  return (
    <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
      <h2 className="text-title3" style={{ marginBottom: 'var(--spacing-lg)' }}>
        生徒管理
      </h2>
      
      <div className="flex" style={{ marginBottom: 'var(--spacing-lg)', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
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

      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {students.length === 0 ? (
          <p className="text-callout" style={{ opacity: 0.7 }}>
            生徒を追加してください
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {/* ヘッダー */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              padding: 'var(--spacing-sm)',
              backgroundColor: 'var(--color-secondary-200)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-secondary-300)',
              fontWeight: 'bold',
              fontSize: '0.875rem'
            }}>
              <span style={{ minWidth: '30px', textAlign: 'center' }}>No.</span>
              <span style={{ flex: '1' }}>名前</span>
              <span style={{ minWidth: '120px', textAlign: 'center' }}>操作</span>
            </div>
            
            {students.map((student) => (
              <div
                key={student.id}
                style={{
                  display: 'flex',
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
                        minWidth: '30px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        color: 'var(--color-secondary-600)',
                        textAlign: 'center'
                      }}
                    >
                      {students.indexOf(student) + 1}
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
                        flex: '1'
                      }}
                      autoFocus
                    />
                    <div style={{ display: 'flex', gap: 'var(--spacing-xs)', minWidth: '120px', justifyContent: 'center' }}>
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
                        minWidth: '30px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        color: 'var(--color-secondary-600)',
                        textAlign: 'center'
                      }}
                    >
                      {students.indexOf(student) + 1}
                    </span>
                    <span className="text-body" style={{ flex: '1' }}>
                      {student.name}
                    </span>
                    <div style={{ display: 'flex', gap: 'var(--spacing-xs)', minWidth: '120px', justifyContent: 'center' }}>
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
