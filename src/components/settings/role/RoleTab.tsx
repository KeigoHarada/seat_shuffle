import React from "react";
import RoleAddForm from "./RoleAddForm";
import RoleListTable from "./RoleListTable";

const RoleTab: React.FC = () => {
  return (
    <div className="app-settings-fill" style={{ gap: "var(--spacing-md)" }}>
      <div style={{ flexShrink: 0 }}>
        <RoleAddForm />
      </div>
      <div className="app-settings-fill">
        <RoleListTable />
      </div>
    </div>
  );
};

export default RoleTab;
