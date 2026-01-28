import React, { useState } from 'react';
import { useSeatStore } from '../../stores/seatStore';
import { Condition } from '../../types';

interface StudentDistanceFormProps {
  onAdd: (condition: Omit<Extract<Condition, { type: 'student-distance' }>, 'id'>) => void;
  onCancel: () => void;
}

export const StudentDistanceForm: React.FC<StudentDistanceFormProps> = ({ onAdd, onCancel }) => {
  const { students } = useSeatStore();
  const [studentId1, setStudentId1] = useState('');
  const [studentId2, setStudentId2] = useState('');
  const [shouldBeClose, setShouldBeClose] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentId1 && studentId2 && studentId1 !== studentId2) {
      onAdd({
        type: 'student-distance',
        enabled: true,
        name: '生徒間距離条件',
        studentId1,
        studentId2,
        shouldBeClose
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 'var(--spacing-md)' }}>
      <h3 style={{ marginBottom: 'var(--spacing-md)' }}>生徒間距離条件を追加</h3>
      
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <label className="text-subheadline" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
          生徒1を選択
        </label>
        <select
          value={studentId1}
          onChange={(e) => setStudentId1(e.target.value)}
          style={{
            width: '100%',
            padding: 'var(--spacing-sm)',
            border: '1px solid var(--color-secondary-300)',
            borderRadius: 'var(--radius-md)',
            fontSize: '1rem'
          }}
        >
          <option value="">生徒1を選択</option>
          {students.map(student => (
            <option key={student.id} value={student.id}>
              {student.name} ({student.furigana})
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <label className="text-subheadline" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
          生徒2を選択
        </label>
        <select
          value={studentId2}
          onChange={(e) => setStudentId2(e.target.value)}
          style={{
            width: '100%',
            padding: 'var(--spacing-sm)',
            border: '1px solid var(--color-secondary-300)',
            borderRadius: 'var(--radius-md)',
            fontSize: '1rem'
          }}
        >
          <option value="">生徒2を選択</option>
          {students.map(student => (
            <option key={student.id} value={student.id}>
              {student.name} ({student.furigana})
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <label className="text-subheadline" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
          条件の種類
        </label>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <button
            type="button"
            onClick={() => setShouldBeClose(true)}
            className={`btn ${shouldBeClose ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
          >
            近くに配置
          </button>
          <button
            type="button"
            onClick={() => setShouldBeClose(false)}
            className={`btn ${!shouldBeClose ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
          >
            遠くに配置
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          キャンセル
        </button>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={!studentId1 || !studentId2 || studentId1 === studentId2}
        >
          追加
        </button>
      </div>
    </form>
  );
};
