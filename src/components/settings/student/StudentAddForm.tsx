import React, { useState } from "react";
import { useStore } from "../../../stores";
import { Plus } from "lucide-react";
import { Student } from "../../../types";
import { GENDERS, GENDER_OPTIONS, GenderType } from "../../../constants";
import MultiSelect from "../../ui/MultiSelect";
import Select from "../../ui/Select";

const StudentAddForm: React.FC = () => {
  const students = useStore((state) => state.students);
  const roles = useStore((state) => state.roles);
  const addStudent = useStore((state) => state.addStudent);

  const [newName, setNewName] = useState("");
  const [newFurigana, setNewFurigana] = useState("");
  const [newGender, setNewGender] = useState<GenderType>(GENDERS.OTHER);
  const [newRoleIds, setNewRoleIds] = useState<string[]>([]);

  const handleAdd = () => {
    if (!newName.trim()) return;
    const newStudent: Student = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      furigana: newFurigana.trim(),
      attendanceNumber: students.length + 1,
      gender: newGender,
      roleIds: newRoleIds,
    };
    addStudent(newStudent);
    // Reset form
    setNewName("");
    setNewFurigana("");
    setNewGender(GENDERS.OTHER);
    setNewRoleIds([]);
  };

  const roleOptions = roles.map((r) => ({ label: r.name, value: r.id }));

  return (
    <div
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-md)",
        padding: "var(--spacing-md)",
      }}
    >
      <h3 className="text-title3" style={{ fontSize: "14px", margin: 0 }}>
        新規生徒の追加
      </h3>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-sm)",
        }}
      >
        {/* Name & Furigana Stack */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            width: "100%",
          }}
        >
          <input
            type="text"
            value={newFurigana}
            onChange={(e) => setNewFurigana(e.target.value)}
            placeholder="ふりがな"
            style={{ width: "100%", fontSize: "11px", padding: "6px 8px" }}
          />
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="名前 (必須)"
            style={{ width: "100%", fontSize: "13px", padding: "8px" }}
          />
        </div>

        {/* Gender & Role Row */}
        <div
          style={{ display: "flex", gap: "var(--spacing-sm)", width: "100%" }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <Select
              options={GENDER_OPTIONS}
              value={newGender}
              onChange={(val) => setNewGender(val as GenderType)}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <MultiSelect
              options={roleOptions}
              selectedValues={newRoleIds}
              onChange={setNewRoleIds}
              placeholder="役割を選択..."
            />
          </div>
        </div>
      </div>

      <button
        className="btn-primary"
        onClick={handleAdd}
        disabled={!newName.trim()}
        style={{ alignSelf: "flex-end", marginTop: "4px" }}
      >
        <Plus size={16} style={{ marginRight: "4px" }} /> 追加
      </button>
    </div>
  );
};

export default StudentAddForm;
