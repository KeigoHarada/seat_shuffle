import React from "react";
import StudentAddForm from "./StudentAddForm";
import StudentListTable from "./StudentListTable";

const StudentTab: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-xl)",
      }}
    >
      <StudentAddForm />
      <StudentListTable />
    </div>
  );
};

export default StudentTab;
