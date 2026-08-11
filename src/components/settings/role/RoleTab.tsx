import React from "react";
import RoleAddForm from "./RoleAddForm";
import RoleListTable from "./RoleListTable";

const RoleTab: React.FC = () => {
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
        <RoleAddForm />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
        }}
      >
        <RoleListTable />
      </div>
    </div>
  );
};

export default RoleTab;
