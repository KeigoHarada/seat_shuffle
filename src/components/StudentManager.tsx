import React, { useState } from 'react';
import { useSeatStore } from '../stores/seatStore';
import { Student } from '../types';
import { 
  Upload,
  ChevronDown,
  ChevronUp,
  Trash2,
  AlertCircle,
  X
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ROLE_ICONS } from '../constants/roleIcons';

export const StudentManager: React.FC = () => {
  const { students, addStudent, removeStudent, updateStudent, roles, assignRoleToStudent, removeRoleFromStudent, currentLayout, setSelectedSeatId, clearAllStudents } = useSeatStore();
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentFurigana, setNewStudentFurigana] = useState('');
  const [newStudentGender, setNewStudentGender] = useState<'male' | 'female' | 'other'>('male');
  const [newStudentRoles, setNewStudentRoles] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingFurigana, setEditingFurigana] = useState('');
  const [editingGender, setEditingGender] = useState<'male' | 'female' | 'other'>('male');
  const [isExpanded, setIsExpanded] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // 出席番号順にソートされた生徒リストを取得
  const getSortedStudents = () => {
    return [...students].sort((a, b) => a.studentNumber - b.studentNumber);
  };

  // 生徒の行をクリックした時に座席表の対応する席を選択
  const handleStudentRowClick = (studentId: string) => {
    if (!currentLayout) return;
    
    // 生徒が座っている席を探す
    const seat = currentLayout.seats.find(s => s.studentId === studentId);
    if (seat) {
      setSelectedSeatId(seat.id);
    } else {
      // 座席に座っていない場合は選択を解除
      setSelectedSeatId(null);
    }
  };

  const handleAddStudent = () => {
    if (newStudentName.trim() && newStudentFurigana.trim()) {
      try {
        setAddError(null);
        const student: Student = {
          id: `student-${Date.now()}`,
          name: newStudentName.trim(),
          furigana: newStudentFurigana.trim(),
          gender: newStudentGender,
          studentNumber: 0,
          roleIds: newStudentRoles
        };
        addStudent(student);
        setNewStudentName('');
        setNewStudentFurigana('');
        setNewStudentGender('male');
        setNewStudentRoles([]);
      } catch (error) {
        setAddError(error instanceof Error ? error.message : "生徒の追加に失敗しました");
      }
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
    setEditingFurigana(student.furigana);
    setEditingGender(student.gender);
  };

  const handleEditSave = () => {
    if (editingId && editingName.trim() && editingFurigana.trim()) {
      updateStudent(editingId, { 
        name: editingName.trim(),
        furigana: editingFurigana.trim(),
        gender: editingGender
      });
      setEditingId(null);
      setEditingName('');
      setEditingFurigana('');
      setEditingGender('male');
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingName('');
    setEditingFurigana('');
    setEditingGender('male');
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

  // ファイル読み込み処理
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        let rows: any[][] = [];

        if (file.name.endsWith('.csv')) {
          // CSV処理
          const text = data as string;
          rows = text.split('\n').map(row => row.split(',').map(cell => cell.trim()));
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          // Excel処理
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        } else {
          alert('CSVまたはExcelファイルを選択してください');
          return;
        }

        setAddError(null);
        let successCount = 0;
        let errorCount = 0;
        let addErrorMsg: string | null = null;

        for (let index = 0; index < rows.length; index++) {
          const row = rows[index];
          if (index === 0) continue;
          if (!row || row.length < 4 || !row[1]) continue;

          const studentNumber = parseInt(String(row[0])) || 0;
          const name = String(row[1]).trim();
          const furigana = String(row[2]).trim();
          const genderStr = String(row[3]).trim();

          let gender: 'male' | 'female' | 'other' = 'other';
          if (genderStr === '男' || genderStr === '男性' || genderStr === 'male') {
            gender = 'male';
          } else if (genderStr === '女' || genderStr === '女性' || genderStr === 'female') {
            gender = 'female';
          }

          if (name && furigana) {
            try {
              const student: Student = {
                id: `student-${Date.now()}-${index}`,
                name,
                furigana,
                gender,
                studentNumber: studentNumber || (students.length + successCount + 1),
                roleIds: []
              };
              addStudent(student);
              successCount++;
            } catch (err) {
              addErrorMsg = err instanceof Error ? err.message : "生徒の追加に失敗しました";
              break;
            }
          } else {
            errorCount++;
          }
        }

        if (addErrorMsg) {
          setAddError(addErrorMsg);
        }
        if (successCount > 0 && !addErrorMsg) {
          alert(`${successCount}人の生徒を追加しました` + (errorCount > 0 ? `\n（${errorCount}行のエラーをスキップしました）` : ''));
        } else if (!addErrorMsg) {
          alert('有効なデータが見つかりませんでした');
        }
      } catch (error) {
        console.error('ファイル読み込みエラー:', error);
        alert('ファイルの読み込みに失敗しました');
      }
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }

    // inputをリセット
    event.target.value = '';
  };

  return (
    <div className="card" style={{ marginBottom: 'var(--spacing-md)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isExpanded ? 'var(--spacing-md)' : 0 }}>
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
            cursor: 'pointer',
            flex: 1
          }}
        >
          <h2 className="text-title3">生徒管理</h2>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        {isExpanded && (
          <>
            <button
              className="btn btn-secondary"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--spacing-xs)',
                cursor: students.length === 0 ? 'not-allowed' : 'pointer',
                padding: 'var(--spacing-xs) var(--spacing-sm)', 
                fontSize: '0.75rem',
                opacity: students.length === 0 ? 0.5 : 1
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (students.length > 0) {
                  setShowDeleteConfirm(true);
                }
              }}
              disabled={students.length === 0}
            >
              <Trash2 size={16} />
              全員削除
            </button>
            <label 
              htmlFor="file-upload"
              className="btn btn-secondary"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--spacing-xs)',
                cursor: 'pointer',
                padding: 'var(--spacing-xs) var(--spacing-sm)', 
                fontSize: '0.75rem'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Upload size={16} />
              CSV/Excel読み込み
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </>
        )}
      </div>
      
      {isExpanded && (
      <>
      
      {addError && (
        <div style={{
          marginBottom: 'var(--spacing-md)',
          padding: 'var(--spacing-sm)',
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-sm)'
        }}>
          <AlertCircle size={20} color="#dc2626" />
          <span style={{ fontSize: '0.875rem', color: '#991b1b', flex: 1 }}>
            {addError}
          </span>
          <button
            onClick={() => setAddError(null)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={16} color="#991b1b" />
          </button>
        </div>
      )}

      {/* ファイルフォーマットの説明 */}
      <div style={{ 
        marginBottom: 'var(--spacing-md)', 
        padding: 'var(--spacing-sm)',
        backgroundColor: 'var(--color-secondary-100)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-secondary-200)'
      }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-secondary-700)', marginBottom: 'var(--spacing-xs)' }}>
          <strong>📁 ファイル形式:</strong> CSV形式 (列の順番: 番号, 漢字, ふりがな, 性別)
        </p>
        <p style={{ fontSize: '0.7rem', color: 'var(--color-secondary-600)' }}>
          例: 1, 田中太郎, たなかたろう, 男
        </p>
      </div>

      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="ふりがな"
              value={newStudentFurigana}
              onChange={(e) => setNewStudentFurigana(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddStudent()}
              style={{
                padding: 'var(--spacing-sm)',
                border: '1px solid var(--color-secondary-300)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                flex: '1',
                minWidth: '150px'
              }}
            />
            <select
              value={newStudentGender}
              onChange={(e) => setNewStudentGender(e.target.value as 'male' | 'female' | 'other')}
              style={{
                padding: 'var(--spacing-sm)',
                border: '1px solid var(--color-secondary-300)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                minWidth: '100px'
              }}
            >
              <option value="male">男性</option>
              <option value="female">女性</option>
              <option value="other">その他</option>
            </select>
          </div>
          <div className="flex" style={{ gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
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
              disabled={!newStudentName.trim() || !newStudentFurigana.trim()}
            >
              追加
            </button>
          </div>
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
              gridTemplateColumns: '60px 1fr 80px 1fr 120px',
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
              <span style={{ textAlign: 'center' }}>性別</span>
              <span>ロール</span>
              <span style={{ textAlign: 'center' }}>操作</span>
            </div>
            
            {getSortedStudents().map((student) => (
              <div
                key={student.id}
                onClick={() => handleStudentRowClick(student.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 80px 1fr 120px',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  padding: 'var(--spacing-sm)',
                  backgroundColor: 'var(--color-secondary-100)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-secondary-200)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-secondary-200)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-secondary-100)';
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                      <input
                        type="text"
                        placeholder="ふりがな"
                        value={editingFurigana}
                        onChange={(e) => setEditingFurigana(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleEditSave();
                          if (e.key === 'Escape') handleEditCancel();
                        }}
                        style={{
                          padding: 'var(--spacing-xs)',
                          border: '1px solid var(--color-primary-300)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          width: '100%'
                        }}
                      />
                      <input
                        type="text"
                        placeholder="名前"
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
                    </div>
                    <select
                      value={editingGender}
                      onChange={(e) => setEditingGender(e.target.value as 'male' | 'female' | 'other')}
                      style={{
                        padding: 'var(--spacing-xs)',
                        border: '1px solid var(--color-primary-300)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        textAlign: 'center'
                      }}
                    >
                      <option value="male">男性</option>
                      <option value="female">女性</option>
                      <option value="other">その他</option>
                    </select>
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
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-secondary-500)' }}>
                        {student.furigana}
                      </span>
                      <span className="text-body" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {student.name}
                      </span>
                    </div>
                    <span 
                      style={{ 
                        fontSize: '0.75rem',
                        textAlign: 'center',
                        color: 'var(--color-secondary-700)'
                      }}
                    >
                      {student.gender === 'male' ? '男性' : student.gender === 'female' ? '女性' : 'その他'}
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
      </>
      )}

      {/* 全員削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 5000
        }}>
          <div style={{
            backgroundColor: 'var(--color-secondary-50)',
            border: '2px solid var(--color-error-300)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--spacing-xl)',
            boxShadow: 'var(--shadow-2xl)',
            maxWidth: '400px',
            width: '90vw'
          }}>
            <h2 className="text-title2" style={{ 
              marginBottom: 'var(--spacing-md)',
              textAlign: 'center',
              color: 'var(--color-error-800)'
            }}>
              全員削除の確認
            </h2>

            <p style={{
              marginBottom: 'var(--spacing-lg)',
              textAlign: 'center',
              color: 'var(--color-secondary-900)',
              fontSize: '0.9rem',
              lineHeight: '1.6'
            }}>
              全員の生徒を削除しますか？<br />
              この操作は取り消せません。
            </p>

            <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
                style={{ padding: 'var(--spacing-md) var(--spacing-xl)' }}
              >
                キャンセル
              </button>
              
              <button
                className="btn"
                onClick={() => {
                  clearAllStudents();
                  setShowDeleteConfirm(false);
                }}
                style={{ 
                  padding: 'var(--spacing-md) var(--spacing-xl)',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  borderColor: '#b91c1c',
                  border: '1px solid #b91c1c',
                  fontWeight: 'bold'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b91c1c';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                }}
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
