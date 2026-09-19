import React, { useState, useRef, useEffect, useCallback } from "react";
import { Play, RotateCcw, Trash2, ExternalLink, Heart } from "lucide-react";
import { useStore } from "../../../stores/appStore";
import Select from "../../ui/Select";
import ShuffleAnimation from "../../canvas/ShuffleAnimation";
import ConfirmDialog from "../../ui/ConfirmDialog";
import { showToast } from "../../../stores/toast";

const GlobalTab: React.FC = () => {
  const appSettings = useStore((state) => state.appSettings);
  const updateAppSettings = useStore((state) => state.updateAppSettings);
  const isShuffling = useStore((state) => state.isShuffling);
  const clearState = useStore((state) => state.clearState);
  const loadDefaultTemplate = useStore((state) => state.loadDefaultTemplate);
  const [isTesting, setIsTesting] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "restore" | "clear" | null
  >(null);

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
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        paddingRight: "4px",
      }}
    >
      <div
        style={{
          padding: "var(--spacing-md)",
          backgroundColor: "var(--c-surface)",
          border: "1px solid var(--c-border)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <h3 className="text-title3" style={{ marginBottom: "12px" }}>
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
          onChange={(val) =>
            updateAppSettings({ shuffleAnimation: val as any })
          }
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
      </div>

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

      <div
        style={{
          padding: "var(--spacing-md)",
          backgroundColor: "var(--c-surface)",
          border: "1px solid var(--c-border)",
          borderRadius: "var(--radius-lg)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <h3 className="text-title3">データ管理・初期化</h3>
        <p
          style={{
            fontSize: "12px",
            color: "var(--c-text-sub)",
          }}
        >
          座席表や生徒データをリセットまたは初期状態に戻します。
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setConfirmAction("restore")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "10px 16px",
              fontSize: "13px",
              width: "100%",
            }}
          >
            <RotateCcw size={16} /> 初期サンプルを復元
          </button>
          <button
            type="button"
            className="btn-danger-outline"
            onClick={() => setConfirmAction("clear")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "10px 16px",
              fontSize: "13px",
              width: "100%",
            }}
          >
            <Trash2 size={16} /> データを全消去（空にする）
          </button>
        </div>
      </div>

      <div
        style={{
          padding: "var(--spacing-md)",
          backgroundColor: "var(--c-surface)",
          border: "1px solid var(--c-border)",
          borderRadius: "var(--radius-lg)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <h3
          className="text-title3"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            margin: 0,
          }}
        >
          <Heart size={18} style={{ color: "var(--c-primary)" }} />
          <span>開発者を応援・寄付する</span>
        </h3>

        <p
          style={{
            fontSize: "12px",
            color: "var(--c-text-sub)",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          ラクガエは教育現場を応援するため、完全無料・広告なしで個人開発・運営されています。
          もし役立ちましたら、温かい応援メッセージやご支援をいただけると励みになります！
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: "4px",
          }}
        >
          <a
            id="btn-support-donate"
            href="https://ofuse.me/o?uid=218335"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "10px 24px",
              fontSize: "13px",
              textDecoration: "none",
            }}
          >
            <Heart size={16} />
            <span>応援メッセージ・寄付を送る</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmAction === "restore"}
        title="初期サンプルの復元"
        message="現在の座席表や生徒データをすべて破棄し、初期サンプルデータ（30人学級・ペア座席）を読み込みますか？"
        confirmText="復元する"
        cancelText="キャンセル"
        variant="primary"
        onConfirm={() => {
          loadDefaultTemplate();
          showToast.success("初期サンプルデータを読み込みました");
        }}
        onCancel={() => setConfirmAction(null)}
      />

      <ConfirmDialog
        isOpen={confirmAction === "clear"}
        title="データの全消去"
        message="すべての座席、生徒、役割、グループ、制約データを完全に消去して空にしますか？この操作は取り消せません。"
        confirmText="全消去する"
        cancelText="キャンセル"
        variant="danger"
        onConfirm={() => {
          clearState();
          showToast.info("データを初期化しました（空になりました）");
        }}
        onCancel={() => setConfirmAction(null)}
      />

      <ShuffleAnimation forceShow={isTesting} />
    </div>
  );
};

export default GlobalTab;
