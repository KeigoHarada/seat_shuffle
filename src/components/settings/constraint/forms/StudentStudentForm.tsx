import React, { useState } from "react";
import { useStore } from "../../../../stores/appStore";
import { Plus } from "lucide-react";
import { StudentStudentConstraint } from "../../../../types/constraint";
import Select from "../../../ui/Select";

const StudentStudentForm: React.FC = () => {
  const addConstraint = useStore((state) => state.addConstraint);
  const students = useStore((state) => state.students);

  const [ssStudent1, setSsStudent1] = useState("");
  const [ssStudent2, setSsStudent2] = useState("");
  const [ssMatch, setSsMatch] = useState<"close" | "far">("close");

  const studentOptions = students.map((s) => ({ value: s.id, label: s.name }));

  const handleAdd = () => {
    if (!ssStudent1 || !ssStudent2 || ssStudent1 === ssStudent2) return;
    const newConstraint: StudentStudentConstraint = {
      id: crypto.randomUUID(),
      isEnabled: true,
      type: "student-student",
      studentId1: ssStudent1,
      studentId2: ssStudent2,
      matchType: ssMatch,
    };
    addConstraint(newConstraint);
    setSsStudent1("");
    setSsStudent2("");
  };

  const isAddDisabled = !ssStudent1 || !ssStudent2 || ssStudent1 === ssStudent2;

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
        特定の2人の生徒を同じグループにするか、別のグループにするか設定します。
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <Select
              value={ssStudent1}
              onChange={setSsStudent1}
              options={studentOptions}
              placeholder="生徒を選択"
              small
            />
          </div>
          <span style={{ fontSize: "12px", color: "var(--c-text-sub)" }}>
            と
          </span>
          <div style={{ flex: 1 }}>
            <Select
              value={ssStudent2}
              onChange={setSsStudent2}
              options={studentOptions}
              placeholder="生徒を選択"
              small
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className={ssMatch === "close" ? "btn-primary" : "btn-secondary"}
            onClick={() => setSsMatch("close")}
            style={{ flex: 1, padding: "6px" }}
          >
            近づける
          </button>
          <button
            className={ssMatch === "far" ? "btn-primary" : "btn-secondary"}
            onClick={() => setSsMatch("far")}
            style={{ flex: 1, padding: "6px" }}
          >
            離す
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

export default StudentStudentForm;
