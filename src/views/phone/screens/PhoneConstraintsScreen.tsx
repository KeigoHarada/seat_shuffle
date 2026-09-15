import React from "react";
import ConstraintTab from "../../../components/settings/constraint/ConstraintTab";

const PhoneConstraintsScreen: React.FC = () => {
  return (
    <div className="phone-screen">
      <h2 className="phone-screen-title">条件</h2>
      <div className="phone-screen-body">
        <ConstraintTab />
      </div>
    </div>
  );
};

export default PhoneConstraintsScreen;
