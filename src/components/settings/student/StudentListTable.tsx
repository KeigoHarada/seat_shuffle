import React, { useState } from "react";
import { useStore } from "../../../stores";
import { Trash2 } from "lucide-react";
import ConfirmDialog from "../../ui/ConfirmDialog";
import Select from "../../ui/Select";
import { GENDER_OPTIONS, GenderType } from "../../../constants";

const StudentListTable: React.FC = () => {
  const students = useStore((state) => state.students);
  const roles = useStore((state) => state.roles);
  const updateStudent = useStore((state) => state.updateStudent);
  const removeStudent = useStore((state) => state.removeStudent);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Table Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "24px 1fr 76px 32px",
          gap: "8px",
          padding: "0 8px 8px 8px",
          fontSize: "12px",
          fontWeight: 700,
          color: "var(--c-text-sub)",
          borderBottom: "2px solid var(--c-surface-disabled)",
          marginBottom: "8px",
        }}
      >
        <div style={{ textAlign: "center" }}>No.</div>
        <div>ふりがな / 名前</div>
        <div style={{ textAlign: "center" }}>性別</div>
        <div></div>
      </div>

      {/* Table Rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {students.map((student) => (
          <div
            key={student.id}
            style={{
              display: "grid",
              gridTemplateColumns: "24px 1fr 76px 32px",
              gap: "8px",
              alignItems: "center",
              padding: "8px",
              borderBottom: "1px solid var(--c-surface-disabled)",
            }}
          >
            {/* 1. No */}
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--c-text-sub)",
                textAlign: "center",
              }}
            >
              {student.attendanceNumber}
            </div>

            {/* 2. Name & Furigana */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                minWidth: 0,
              }}
            >
              <input
                type="text"
                value={student.furigana || ""}
                onChange={(e) =>
                  updateStudent(student.id, { furigana: e.target.value })
                }
                placeholder="ふりがな"
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "10px",
                  color: "var(--c-text-sub)",
                  padding: 0,
                  outline: "none",
                  width: "100%",
                  textOverflow: "ellipsis",
                }}
              />
              <input
                type="text"
                value={student.name}
                onChange={(e) =>
                  updateStudent(student.id, { name: e.target.value })
                }
                placeholder="名前"
                style={{
                  border: "none",
                  background: "transparent",
                  fontWeight: 700,
                  color: "var(--c-text-main)",
                  padding: 0,
                  fontSize: "14px",
                  outline: "none",
                  width: "100%",
                  textOverflow: "ellipsis",
                }}
              />
              {/* Roles Tags */}
              {student.roleIds.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: "4px",
                    flexWrap: "wrap",
                    marginTop: "4px",
                  }}
                >
                  {student.roleIds.map((rid) => {
                    const r = roles.find((role) => role.id === rid);
                    return r ? (
                      <span
                        key={r.id}
                        style={{
                          fontSize: "10px",
                          padding: "2px 4px",
                          background: "var(--c-primary-pale)",
                          color: "var(--c-primary-hover)",
                          borderRadius: "var(--radius-sm)",
                          fontWeight: 700,
                        }}
                      >
                        {r.name}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* 3. Gender */}
            <div
              style={{ display: "flex", justifyContent: "center", minWidth: 0 }}
            >
              <Select
                options={GENDER_OPTIONS}
                value={student.gender}
                onChange={(val) =>
                  updateStudent(student.id, { gender: val as GenderType })
                }
                small
              />
            </div>

            {/* 4. Action */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                className="btn-danger"
                style={{ padding: "6px" }}
                title="削除"
                onClick={() => setDeleteTargetId(student.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {students.length === 0 && (
          <div
            style={{
              padding: "var(--spacing-xl)",
              textAlign: "center",
              color: "var(--c-text-sub)",
              fontSize: "13px",
            }}
          >
            生徒が登録されていません
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        title="生徒の削除"
        message="本当にこの生徒を削除しますか？この操作は取り消せません。"
        confirmText="削除する"
        onConfirm={() => {
          if (deleteTargetId) removeStudent(deleteTargetId);
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};

export default StudentListTable;
