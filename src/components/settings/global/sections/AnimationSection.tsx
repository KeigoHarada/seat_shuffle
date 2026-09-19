import React, { useState, useRef, useEffect, useCallback } from "react";
import { Play } from "lucide-react";
import { useStore } from "../../../../stores/appStore";
import Select from "../../../ui/Select";
import ShuffleAnimation from "../../../animation/ShuffleAnimation";

export const AnimationSection: React.FC = () => {
  const appSettings = useStore((state) => state.appSettings);
  const updateAppSettings = useStore((state) => state.updateAppSettings);
  const isShuffling = useStore((state) => state.isShuffling);
  const [isTesting, setIsTesting] = useState(false);

  const timerRef = useRef<number | null>(null);
  const settingsWhenTestStarted = useRef(appSettings);

  const clearTestPlay = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsTesting(false);
  }, []);

  useEffect(() => {
    const settingsChanged = settingsWhenTestStarted.current !== appSettings;
    settingsWhenTestStarted.current = appSettings;
    if (settingsChanged && isTesting) {
      clearTestPlay();
    }
  }, [appSettings, isTesting, clearTestPlay]);

  useEffect(() => {
    if (!isTesting) return;

    const abortTest = () => {
      clearTestPlay();
    };

    window.addEventListener("pointerdown", abortTest, { capture: true });
    window.addEventListener("keydown", abortTest, { capture: true });

    return () => {
      window.removeEventListener("pointerdown", abortTest, { capture: true });
      window.removeEventListener("keydown", abortTest, { capture: true });
      clearTestPlay();
    };
  }, [isTesting, clearTestPlay]);

  const handleTestPlay = () => {
    if (isShuffling || isTesting) return;
    setIsTesting(true);

    const duration = appSettings.shuffleAnimation === "none" ? 5000 : 3000;
    timerRef.current = window.setTimeout(() => {
      setIsTesting(false);
    }, duration);
  };

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
        onChange={(val) => updateAppSettings({ shuffleAnimation: val as any })}
      />

      <div
        style={{
          marginTop: "12px",
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

      <ShuffleAnimation forceShow={isTesting} />
    </div>
  );
};

export default AnimationSection;
