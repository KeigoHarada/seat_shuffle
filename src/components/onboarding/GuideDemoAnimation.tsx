import React from "react";

interface GuideDemoAnimationProps {
  type?: string;
}

const GuideDemoAnimation: React.FC<GuideDemoAnimationProps> = () => {
  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "16 / 9",
        backgroundColor: "var(--c-bg-main)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--c-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
      }}
    >
      <span style={{ color: "var(--c-text-sub)", fontSize: "14px" }}>
        [ 動画プレビュー用エリア ]
      </span>
    </div>
  );
};

export default GuideDemoAnimation;
