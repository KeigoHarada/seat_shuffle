import React, { useState } from "react";
import { useStore } from "../../../../stores";
import { Plus } from "lucide-react";
import { StudentGroupConstraint } from "../../../../types";
import Select from "../../../ui/Select";
import MultiSelect from "../../../ui/MultiSelect";

const StudentGroupForm: React.FC = () => {
  const addConstraint = useStore((state) => state.addConstraint);
  const students = useStore((state) => state.students);
  const groups = useStore((state) => state.groups);

  const [sgStudentId, setSgStudentId] = useState("");
  const [sgGroupIds, setSgGroupIds] = useState<string[]>([]);
  const [sgMatch, setSgMatch] = useState<"include" | "exclude">("include");

  const studentOptions = students.map((s) => ({ value: s.id, label: s.name }));
  const groupOptions = groups.map((g) => ({ value: g.id, label: g.name }));

  const handleAdd = () => {
    if (!sgStudentId || sgGroupIds.length === 0) return;
    const newConstraint: StudentGroupConstraint = {
      id: crypto.randomUUID(),
      isEnabled: true,
      type: "student-group",
      studentId: sgStudentId,
      groupIds: sgGroupIds,
      matchType: sgMatch,
    };
    addConstraint(newConstraint);
    setSgStudentId("");
    setSgGroupIds([]);
  };

  const isAddDisabled = !sgStudentId || sgGroupIds.length === 0;

  return (
    <>
      <div
        style={{
          fontSize: "11px",
          color: "var(--c-text-sub)",
          marginBottom: "8px",
          lineHeight: 1.4,
        }}
      >
        特定の生徒を、選択したグループ（複数可）に「所属させる」か「所属させない」か設定します。
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <Select
              value={sgStudentId}
              onChange={setSgStudentId}
              options={studentOptions}
              placeholder="生徒を選択"
              small
            />
          </div>
          <span style={{ fontSize: "12px", color: "var(--c-text-sub)" }}>
            を
          </span>
        </div>
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            zIndex: 10,
          }}
        >
          <div style={{ flex: 1 }}>
            <MultiSelect
              options={groupOptions}
              selectedValues={sgGroupIds}
              onChange={setSgGroupIds}
              placeholder="グループを選択（複数可）"
              small
            />
          </div>
          <span style={{ fontSize: "12px", color: "var(--c-text-sub)" }}>
            に
          </span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className={sgMatch === "include" ? "btn-primary" : "btn-secondary"}
            onClick={() => setSgMatch("include")}
            style={{ flex: 1, padding: "6px" }}
          >
            入れる
          </button>
          <button
            className={sgMatch === "exclude" ? "btn-primary" : "btn-secondary"}
            onClick={() => setSgMatch("exclude")}
            style={{ flex: 1, padding: "6px" }}
          >
            入れない
          </button>
        </div>
      </div>
      <button
        className="btn-primary"
        onClick={handleAdd}
        disabled={isAddDisabled}
        style={{ alignSelf: "flex-end", marginTop: "12px" }}
      >
        <Plus size={16} style={{ marginRight: "4px" }} /> ルールを追加
      </button>
    </>
  );
};

export default StudentGroupForm;
