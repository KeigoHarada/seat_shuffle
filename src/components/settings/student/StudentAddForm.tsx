import React, { useState } from "react";
import { useStore } from "../../../stores/appStore";
import { Plus } from "lucide-react";
import type { Student, GenderType } from "../../../types/student";
import { GENDERS, GENDER_OPTIONS } from "../../../constants/gender";
import MultiSelect from "../../ui/MultiSelect";
import Select from "../../ui/Select";
import Input from "../../ui/Input";
import { AVAILABLE_ICONS, IconName } from "../../ui/IconPicker";

const StudentAddForm: React.FC = () => {
  const students = useStore((state) => state.students);
  const roles = useStore((state) => state.roles);
  const addStudent = useStore((state) => state.addStudent);

  const [newName, setNewName] = useState("");
  const [newFurigana, setNewFurigana] = useState("");
  const [newGender, setNewGender] = useState<GenderType | "">("");
  const [newRoleIds, setNewRoleIds] = useState<string[]>([]);

  const handleAdd = () => {
    if (!newName.trim()) return;
    const newStudent: Student = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      furigana: newFurigana.trim(),
      attendanceNumber: students.length + 1,
      gender: newGender === "" ? GENDERS.OTHER : newGender,
      roleIds: newRoleIds,
    };
    addStudent(newStudent);
    setNewName("");
    setNewFurigana("");
    setNewGender("");
    setNewRoleIds([]);
  };

  const roleOptions = roles.map((r) => {
    const IconComp =
      AVAILABLE_ICONS[r.iconName as IconName] || AVAILABLE_ICONS.Star;
    return {
      label: r.name,
      value: r.id,
      icon: <IconComp size={14} />,
    };
  });

  return (
    <div
      id="student-add-form"
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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            width: "100%",
          }}
        >
          <Input
            type="text"
            value={newFurigana}
            onChange={(e) => setNewFurigana(e.target.value)}
            placeholder="ふりがな"
            style={{ width: "100%", fontSize: "11px", padding: "6px 8px" }}
          />
          <Input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="名前 (必須)"
            style={{ width: "100%", fontSize: "13px", padding: "8px" }}
          />
        </div>

        <div
          style={{ display: "flex", gap: "var(--spacing-sm)", width: "100%" }}
        >
          <div style={{ flex: 3, minWidth: 0 }}>
            <MultiSelect
              options={roleOptions}
              selectedValues={newRoleIds}
              onChange={setNewRoleIds}
              placeholder="役割を選択（複数可）"
            />
          </div>

          <div style={{ flex: 2, minWidth: 0 }}>
            <Select
              options={GENDER_OPTIONS}
              value={newGender}
              onChange={(val) => setNewGender(val as GenderType)}
              placeholder="性別を選択"
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
