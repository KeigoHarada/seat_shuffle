import React, { useState } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { useStore } from "../../../../stores/appStore";
import ConfirmDialog from "../../../ui/ConfirmDialog";
import { showToast } from "../../../../stores/toast";

const DataManagementSection: React.FC = () => {
  const clearState = useStore((state) => state.clearState);
  const loadDefaultTemplate = useStore((state) => state.loadDefaultTemplate);
  const [confirmAction, setConfirmAction] = useState<
    "restore" | "clear" | null
  >(null);

  return (
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
    </div>
  );
};

export default DataManagementSection;
