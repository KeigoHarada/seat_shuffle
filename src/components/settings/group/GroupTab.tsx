import React from "react";
import GroupAddForm from "./GroupAddForm";
import GroupListTable from "./GroupListTable";

const GroupTab: React.FC = () => {
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
        <GroupAddForm />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
        }}
      >
        <GroupListTable />
      </div>
    </div>
  );
};

export default GroupTab;
