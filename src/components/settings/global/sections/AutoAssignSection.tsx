import React from "react";
import { useStore } from "../../../../stores/appStore";
import Select from "../../../ui/Select";

const AutoAssignSection: React.FC = () => {
  const autoAssignAlgorithm = useStore(
    (state) => state.appSettings.autoAssignAlgorithm || "right-top-down",
  );
  const updateAppSettings = useStore((state) => state.updateAppSettings);

  return (
    <div
      style={{
        padding: "var(--spacing-md)",
        backgroundColor: "var(--c-surface)",
        border: "1px solid var(--c-border)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      <h3 className="text-title3" style={{ marginBottom: "12px" }}>
        自動割り当ての並び順
      </h3>
      <Select
        options={[
          { label: "N字（右上から下、次列へ）", value: "right-top-down" },
          { label: "N字（左上から下、次列へ）", value: "left-top-down" },
          { label: "Z字（左上から右、次行へ）", value: "left-top-right" },
          { label: "ランダム配置", value: "random" },
        ]}
        value={autoAssignAlgorithm}
        onChange={(val) =>
          updateAppSettings({ autoAssignAlgorithm: val as any })
        }
      />
      <p
        style={{
          marginTop: "8px",
          fontSize: "12px",
          color: "var(--c-text-sub)",
        }}
      >
        ※ツールバーの「自動割り当て」実行時に、出席番号順で生徒をどの順番で空席に埋めていくかを指定します。
      </p>
    </div>
  );
};

export default AutoAssignSection;
