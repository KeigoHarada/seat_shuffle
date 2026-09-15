import React from "react";
import ConstraintAddForm from "./ConstraintAddForm";
import ConstraintListTable from "./ConstraintListTable";

const ConstraintTab: React.FC = () => {
  return (
    <div className="app-settings-fill" style={{ gap: "var(--spacing-md)" }}>
      <div style={{ flexShrink: 0 }}>
        <ConstraintAddForm />
      </div>
      <div id="constraint-list-area" className="app-settings-fill">
        <ConstraintListTable />
      </div>
    </div>
  );
};

export default ConstraintTab;
