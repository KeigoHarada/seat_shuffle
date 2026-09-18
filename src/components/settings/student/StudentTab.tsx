import React from "react";
import StudentAddForm from "./StudentAddForm";
import StudentListTable from "./StudentListTable";
import RosterImportButton from "../RosterImportButton";
import BackupControls from "../BackupControls";

const StudentTab: React.FC = () => {
  return (
    <div className="app-settings-fill" style={{ gap: "var(--spacing-md)" }}>
      <div style={{ flexShrink: 0 }}>
        <StudentAddForm />
      </div>
      <div className="settings-io-stack">
        <RosterImportButton />
        <BackupControls idPrefix="btn-prep" />
      </div>
      <div id="student-list-area" className="app-settings-fill">
        <StudentListTable />
      </div>
    </div>
  );
};

export default StudentTab;
