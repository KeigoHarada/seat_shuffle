import React from "react";
import StudentAddForm from "./StudentAddForm";
import StudentListTable from "./StudentListTable";

const StudentTab: React.FC = () => {
  return (
    <div className="app-settings-fill" style={{ gap: "var(--spacing-md)" }}>
      <div style={{ flexShrink: 0 }}>
        <StudentAddForm />
      </div>
      <div id="student-list-area" className="app-settings-fill">
        <StudentListTable />
      </div>
    </div>
  );
};

export default StudentTab;
