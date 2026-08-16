import React, { useState } from "react";
import { useStore } from "../../../stores";
import { Trash2 } from "lucide-react";
import ConfirmDialog from "../../ui/ConfirmDialog";
import IconPicker, { IconName } from "../../ui/IconPicker";
import Tooltip from "../../ui/Tooltip";
import Input from "../../ui/Input";

const RoleListTable: React.FC = () => {
  const roles = useStore((state) => state.roles);
  const updateRole = useStore((state) => state.updateRole);
  const removeRole = useStore((state) => state.removeRole);

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
            gridTemplateColumns: "56px 1fr 32px",
            gap: "8px",
            padding: "0 8px 8px 8px",
            fontSize: "12px",
            fontWeight: 700,
            color: "var(--c-text-sub)",
            borderBottom: "2px solid var(--c-surface-disabled)",
            marginBottom: "8px",
          }}
        >
          <div style={{ textAlign: "center" }}>アイコン</div>
          <div>役割名 / 説明</div>
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
        {roles.map((role) => (
          <div
            key={role.id}
            style={{
              display: "grid",
              gridTemplateColumns: "56px 1fr 32px",
              gap: "8px",
              alignItems: "center",
              padding: "8px",
              borderBottom: "1px solid var(--c-surface-disabled)",
            }}
          >
            {/* 1. Icon */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <IconPicker
                value={role.iconName as IconName}
                onChange={(val) => updateRole(role.id, { iconName: val })}
              />
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
                value={role.name}
                onChange={(e) => updateRole(role.id, { name: e.target.value })}
                placeholder="役割名"
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
              <Tooltip content={role.description}>
                <Input
                  type="text"
                  value={role.description || ""}
                  onChange={(e) =>
                    updateRole(role.id, { description: e.target.value })
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
                onClick={() => setDeleteTargetId(role.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {roles.length === 0 && (
          <div
            style={{
              padding: "var(--spacing-xl)",
              textAlign: "center",
              color: "var(--c-text-sub)",
              fontSize: "13px",
            }}
          >
            役割が登録されていません
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        title="役割の削除"
        message="本当にこの役割を削除しますか？この操作は取り消せません。"
        confirmText="削除する"
        onConfirm={() => {
          if (deleteTargetId) removeRole(deleteTargetId);
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};

export default RoleListTable;
