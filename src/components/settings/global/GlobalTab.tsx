import React, { useState, useRef, useEffect, useCallback } from "react";
import { Play, RotateCcw, Trash2, ExternalLink, Copy } from "lucide-react";
import { useStore } from "../../../stores";
import Select from "../../ui/Select";
import ShuffleAnimation from "../../layout/ShuffleAnimation";
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

  const clearTestPlay = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsTesting(false);
  }, []);

  // 設定が変更された瞬間、またはアンマウント時にテストをキャンセル
  useEffect(() => {
    if (isTesting) {
      clearTestPlay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appSettings]);

  useEffect(() => {
    if (!isTesting) return;

    // 他の操作が入ったらテスト実行を中止する
    // キャプチャフェーズでクリックやキー入力を検知してテスト状態をクリア
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

  useEffect(() => {
    const scriptId = "ofuse-widget-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://ofuse.me/assets/platform/widget.js";
      script.async = true;
      script.charset = "utf-8";
      document.body.appendChild(script);
    }
  }, []);

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

      {/* その他 */}
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
        <h3 className="text-title3">その他</h3>

        {/* 開発者を応援・寄付（OFUSE） */}
        <div
          style={{
            padding: "16px",
            backgroundColor: "var(--c-primary-pale)",
            border: "1px solid var(--c-primary)",
            borderRadius: "var(--radius-lg)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "22px" }}>💌</span>
            <div>
              <h4
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  margin: 0,
                  color: "var(--c-text-main)",
                }}
              >
                開発者を応援・寄付（OFUSE）
              </h4>
              <p
                style={{
                  fontSize: "11px",
                  color: "var(--c-text-sub)",
                  margin: "2px 0 0 0",
                }}
              >
                ファンレターや応援メッセージを添えて100円から支援できます
              </p>
            </div>
          </div>

          <p
            style={{
              fontSize: "12px",
              color: "var(--c-text-main)",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            ラクガエは教育現場の先生方を応援するため、完全無料・広告なしで開発・運営されています。
            もし役立ちましたら、OFUSEを通じて温かい応援メッセージやご支援をいただけると、今後の継続開発の大きな励みになります！
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
              marginTop: "2px",
            }}
          >
            {/* ラクガエのブランドデザインに合わせたOFUSE埋め込みリンク */}
            <a
              id="btn-ofuse-donate"
              data-ofuse-widget-button
              data-ofuse-id="218335"
              data-ofuse-size="large"
              data-ofuse-color="dark-invert"
              data-ofuse-text=""
              href="https://ofuse.me/o?uid=218335"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                fontSize: "13px",
                fontWeight: 700,
                borderRadius: "var(--radius-full)",
                textDecoration: "none",
                backgroundColor: "var(--c-primary)",
                borderColor: "var(--c-primary-hover)",
                color: "#ffffff",
                boxShadow: "var(--shadow-1)",
              }}
            >
              <span>💌</span>
              <span>OFUSEで応援メッセージを送る</span>
              <ExternalLink size={14} />
            </a>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                navigator.clipboard.writeText("https://ofuse.me/o?uid=218335");
                showToast.success("OFUSEのリンクをコピーしました！");
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
                padding: "8px 12px",
                borderRadius: "var(--radius-full)",
              }}
              title="リンクをコピー"
            >
              <Copy size={13} />
              URLコピー
            </button>
          </div>

          <p
            style={{
              fontSize: "11px",
              color: "var(--c-text-sub)",
              margin: 0,
            }}
          >
            ※ PayPay・クレジットカード対応、会員登録不要で直接送れます（外部サイトが開きます）。
          </p>
        </div>
      </div>

      {/* Confirm Dialogs */}
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
