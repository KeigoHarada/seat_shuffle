import React, { useState } from "react";
import { Play } from "lucide-react";
import { useStore } from "../../../stores";
import Select from "../../ui/Select";

const GlobalTab: React.FC = () => {
  const appSettings = useStore((state) => state.appSettings);
  const updateAppSettings = useStore((state) => state.updateAppSettings);
  const isShuffling = useStore((state) => state.isShuffling);
  const setIsShuffling = useStore((state) => state.setIsShuffling);
  const [isTesting, setIsTesting] = useState(false);

  const handleTestPlay = () => {
    if (isShuffling || isTesting) return;
    setIsTesting(true);
    setIsShuffling(true);

    const duration = appSettings.shuffleAnimation === "none" ? 5000 : 3000;
    setTimeout(() => {
      setIsShuffling(false);
      setIsTesting(false);
    }, duration);
  };

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
          options={[
            { label: "ランダム (単純配置)", value: "random" },
            { label: "最適化 (制約条件を考慮)", value: "optimize" },
          ]}
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
          ※「ランダム」は条件を無視します。「最適化」は条件をなるべく満たすように約300ms計算を行います。
        </p>
      </div>

      <div
        style={{
          padding: "var(--spacing-lg)",
          backgroundColor: "var(--c-surface)",
          border: "1px solid var(--c-border)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <h3 className="text-title3" style={{ marginBottom: "16px" }}>
          シャッフル演出（閲覧モードのみ）
        </h3>
        <Select
          options={[
            { label: "なし（シャッフル時間 5秒）", value: "none" },
            { label: "紙吹雪", value: "confetti" },
            { label: "スライド", value: "slide" },
            { label: "フラッシュ", value: "flash" },
          ]}
          value={appSettings.shuffleAnimation || "none"}
          onChange={(val) =>
            updateAppSettings({ shuffleAnimation: val as any })
          }
        />

        <div
          style={{
            marginTop: "16px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            className="btn-secondary"
            onClick={handleTestPlay}
            disabled={isShuffling}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              opacity: isShuffling ? 0.5 : 1,
              cursor: isShuffling ? "not-allowed" : "pointer",
            }}
          >
            <Play size={16} />
            {isTesting ? "テスト再生中..." : "テスト実行"}
          </button>
        </div>
      </div>

      <div
        style={{
          padding: "var(--spacing-lg)",
          backgroundColor: "var(--c-surface)",
          border: "1px solid var(--c-border)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <h3 className="text-title3" style={{ marginBottom: "16px" }}>
          自動割り当ての並び順
        </h3>
        <Select
          options={[
            { label: "N字（右上から下、次列へ）", value: "right-top-down" },
            { label: "Z字（左上から右、次行へ）", value: "left-top-right" },
            { label: "ランダム配置", value: "random" },
          ]}
          value={appSettings.autoAssignAlgorithm || "right-top-down"}
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
    </div>
  );
};

export default GlobalTab;
