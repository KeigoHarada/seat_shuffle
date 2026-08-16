import React, { useState } from "react";
import Select from "../../ui/Select";
import StudentStudentForm from "./forms/StudentStudentForm";
import StudentGroupForm from "./forms/StudentGroupForm";
import GroupMatchForm from "./forms/GroupMatchForm";

const CONSTRAINT_TYPES = [
  { value: "student-student", label: "生徒-生徒条件" },
  { value: "student-group", label: "生徒-グループ条件" },
  { value: "group-match", label: "役割/性別のグループ条件" },
];

const ConstraintAddForm: React.FC = () => {
  const [activeType, setActiveType] = useState<string>("student-student");

  return (
    <div
      id="constraint-add-form"
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-md)",
        padding: "var(--spacing-md)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <h3 className="text-title3" style={{ fontSize: "14px", margin: 0 }}>
          ルールの追加
        </h3>

        <Select
          value={activeType}
          onChange={setActiveType}
          options={CONSTRAINT_TYPES}
          small
        />
      </div>

      <div
        style={{
          padding: "12px",
          backgroundColor: "var(--c-surface-hover)",
          borderRadius: "var(--radius-md)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {activeType === "student-student" && <StudentStudentForm />}
        {activeType === "student-group" && <StudentGroupForm />}
        {activeType === "group-match" && <GroupMatchForm />}
      </div>
    </div>
  );
};

export default ConstraintAddForm;
