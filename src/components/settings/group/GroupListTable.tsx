import React, { useState } from "react";
import { useStore } from "../../../stores";
import { Trash2 } from "lucide-react";
import ConfirmDialog from "../../ui/ConfirmDialog";
import Tooltip from "../../ui/Tooltip";
import ColorPicker from "../../ui/ColorPicker";
import Input from "../../ui/Input";

const GroupListTable: React.FC = () => {
  const groups = useStore((state) => state.groups);
  const updateGroup = useStore((state) => state.updateGroup);
  const removeGroup = useStore((state) => state.removeGroup);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Table Header */}
      <div style={{ flexShrink: 0 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "36px 1fr 32px",
            gap: "8px",
            padding: "0 8px 8px 8px",
            fontSize: "12px",
            fontWeight: 700,
            color: "var(--c-text-sub)",
            borderBottom: "2px solid var(--c-surface-disabled)",
            marginBottom: "8px",
          }}
        >
          <div style={{ textAlign: "center" }}>色</div>
          <div>グループ名 / 説明</div>
          <div></div>
        </div>
      </div>

      {/* Table Rows */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          flex: 1,
          overflowY: "auto",
          minHeight: 0,
          paddingRight: "4px",
        }}
      >
        {groups.map((group) => (
          <div
            key={group.id}
            style={{
              display: "grid",
              gridTemplateColumns: "36px 1fr 32px",
              gap: "8px",
              alignItems: "center",
              padding: "8px",
              borderBottom: "1px solid var(--c-surface-disabled)",
            }}
          >
            {/* 1. Color */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ width: "24px", height: "24px" }}>
                <ColorPicker
                  value={group.color || "#3b82f6"}
                  onChange={(val) => updateGroup(group.id, { color: val })}
                />
              </div>
            </div>

            {/* 2. Name & Description */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                minWidth: 0,
              }}
            >
              <Input
                type="text"
                value={group.name}
                onChange={(e) =>
                  updateGroup(group.id, { name: e.target.value })
                }
                placeholder="グループ名"
                style={{
                  border: "none",
                  background: "transparent",
                  fontWeight: 700,
                  color: "var(--c-text-main)",
                  padding: 0,
                  fontSize: "14px",
                  outline: "none",
                  width: "100%",
                  textOverflow: "ellipsis",
                }}
              />
              <Tooltip content={group.description}>
                <Input
                  type="text"
                  value={group.description || ""}
                  onChange={(e) =>
                    updateGroup(group.id, { description: e.target.value })
                  }
                  placeholder="説明文を追加..."
                  maxLength={30}
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: "11px",
                    color: "var(--c-text-sub)",
                    padding: 0,
                    outline: "none",
                    width: "100%",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                />
              </Tooltip>
            </div>

            {/* 3. Action */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                className="btn-icon-danger"
                title="削除"
                onClick={() => setDeleteTargetId(group.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {groups.length === 0 && (
          <div
            style={{
              padding: "var(--spacing-xl)",
              textAlign: "center",
              color: "var(--c-text-sub)",
              fontSize: "13px",
            }}
          >
            グループが登録されていません
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        title="グループの削除"
        message="本当にこのグループを削除しますか？この操作は取り消せません。"
        confirmText="削除する"
        onConfirm={() => {
          if (deleteTargetId) removeGroup(deleteTargetId);
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};

export default GroupListTable;
