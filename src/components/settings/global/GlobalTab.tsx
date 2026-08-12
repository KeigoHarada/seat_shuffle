import React from "react";
import { useStore } from "../../../stores";
import Select from "../../ui/Select";

const GlobalTab: React.FC = () => {
  const appSettings = useStore((state) => state.appSettings);
  const updateAppSettings = useStore((state) => state.updateAppSettings);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div
        style={{
          padding: "var(--spacing-lg)",
          backgroundColor: "var(--c-surface)",
          border: "1px solid var(--c-border)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <h3 className="text-title3" style={{ marginBottom: "16px" }}>
          シャッフルアルゴリズム
        </h3>
        <Select
          options={[{ label: "ランダム (単純配置)", value: "random" }]}
          value={appSettings.algorithm || "random"}
          onChange={(val) => updateAppSettings({ algorithm: val as any })}
        />
        <p
          style={{
            marginTop: "8px",
            fontSize: "12px",
            color: "var(--c-text-sub)",
          }}
        >
          ※「ランダム」は条件設定を無視して完全にランダムで座席を決定します。
        </p>
      </div>
    </div>
  );
};

export default GlobalTab;
