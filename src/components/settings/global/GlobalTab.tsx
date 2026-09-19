import React from "react";
import AlgorithmSection from "./sections/AlgorithmSection";
import AnimationSection from "./sections/AnimationSection";
import AutoAssignSection from "./sections/AutoAssignSection";
import DataManagementSection from "./sections/DataManagementSection";
import SupportSection from "./sections/SupportSection";

const GlobalTab: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        paddingRight: "4px",
      }}
    >
      <AlgorithmSection />
      <AnimationSection />
      <AutoAssignSection />
      <DataManagementSection />
      <SupportSection />
    </div>
  );
};

export default GlobalTab;
