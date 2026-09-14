import React from "react";
import GroupAddForm from "./GroupAddForm";
import GroupListTable from "./GroupListTable";

const GroupTab: React.FC = () => {
  return (
    <div className="app-settings-fill" style={{ gap: "var(--spacing-md)" }}>
      <div style={{ flexShrink: 0 }}>
        <GroupAddForm />
      </div>
      <div id="group-list-area" className="app-settings-fill">
        <GroupListTable />
      </div>
    </div>
  );
};

export default GroupTab;
