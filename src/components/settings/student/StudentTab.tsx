import React from "react";
import StudentAddForm from "./StudentAddForm";
import StudentListTable from "./StudentListTable";

const StudentTab: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-md)",
        flex: 1,
        minHeight: 0,
      }}
    >
      <div style={{ flexShrink: 0 }}>
        <StudentAddForm />
      </div>
      <div
        id="student-list-area"
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
        }}
      >
        <StudentListTable />
      </div>
    </div>
  );
};

export default StudentTab;
