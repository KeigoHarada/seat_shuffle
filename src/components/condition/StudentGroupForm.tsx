import React, { useState } from 'react';
import { useSeatStore } from '../../stores/seatStore';
import { StudentGroupCondition } from '../../types';

interface StudentGroupFormProps {
  onAdd: (condition: Omit<StudentGroupCondition, 'id'>) => void;
  onCancel: () => void;
}

export const StudentGroupForm: React.FC<StudentGroupFormProps> = ({ onAdd, onCancel }) => {
  const { students, groups } = useSeatStore();
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [shouldPlace, setShouldPlace] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentIds.length > 0 && selectedGroupIds.length > 0) {
      onAdd({
        type: 'student-group',
        enabled: true,
        name: '生徒-グループ条件',
        studentIds: selectedStudentIds,
        groupIds: selectedGroupIds,
        shouldPlace
      });
    }
  };

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
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
      <h3 style={{ marginBottom: 'var(--spacing-md)' }}>生徒-グループ条件を追加</h3>

      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <label className="text-subheadline" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
          生徒を選択（複数選択可）
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
          {students.map(student => (
            <label key={student.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <input
                type="checkbox"
                checked={selectedStudentIds.includes(student.id)}
                onChange={() => handleStudentToggle(student.id)}
              />
              {student.name} ({student.furigana})
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <label className="text-subheadline" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
          条件の種類
        </label>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <button
            type="button"
            onClick={() => setShouldPlace(true)}
            className={`btn ${shouldPlace ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
          >
            配置する
          </button>
          <button
            type="button"
            onClick={() => setShouldPlace(false)}
            className={`btn ${!shouldPlace ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
          >
            配置しない
          </button>
        </div>
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

      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          キャンセル
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={selectedStudentIds.length === 0 || selectedGroupIds.length === 0}
        >
          追加
        </button>
      </div>
    </form>
  );
};
