import React from "react";
import ConstraintAddForm from "./ConstraintAddForm";
import ConstraintListTable from "./ConstraintListTable";

const ConstraintTab: React.FC = () => {
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
        <ConstraintAddForm />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
        }}
      >
        <ConstraintListTable />
      </div>
    </div>
  );
};

export default ConstraintTab;
