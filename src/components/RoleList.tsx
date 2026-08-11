import React, { useState } from "react";
import { useStore } from "../stores";
import { Plus, Trash2, UserCircle, Star } from "lucide-react";
import { Role } from "../types";

const RoleList: React.FC = () => {
  const roles = useStore((state) => state.roles);
  const addRole = useStore((state) => state.addRole);
  const updateRole = useStore((state) => state.updateRole);
  const removeRole = useStore((state) => state.removeRole);

  const [newName, setNewName] = useState("");

  const handleAdd = () => {
    if (!newName.trim()) return;
    const newRole: Role = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      iconName: "Star",
    };
    addRole(newRole);
    setNewName("");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-lg)",
      }}
    >
      {/* Add New Role */}
      <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="役割名を入力して追加..."
          style={{ flex: 1 }}
        />
        <button
          className="btn-primary"
          onClick={handleAdd}
          style={{ padding: "0 var(--spacing-md)" }}
          title="役割を追加"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Role List */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-sm)",
        }}
      >
        {roles.map((role) => (
          <div
            key={role.id}
            className="card"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-sm)",
              padding: "var(--spacing-sm) var(--spacing-md)",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "var(--c-surface-disabled)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <Star size={16} color="var(--c-text-sub)" />
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <input
                type="text"
                value={role.name}
                onChange={(e) => updateRole(role.id, { name: e.target.value })}
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  fontWeight: 700,
                  color: "var(--c-text-main)",
                  padding: 0,
                  fontSize: "14px",
                }}
              />
            </div>

            <button
              className="btn-danger"
              style={{ padding: "6px" }}
              title="削除"
              onClick={() => {
                if (window.confirm(`「${role.name}」を削除しますか？`)) {
                  removeRole(role.id);
                }
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {roles.length === 0 && (
          <div
            className="card"
            style={{
              padding: "var(--spacing-xl)",
              textAlign: "center",
              color: "var(--c-text-sub)",
            }}
          >
            <UserCircle
              size={32}
              style={{ marginBottom: "var(--spacing-sm)", opacity: 0.5 }}
            />
            <p className="text-body">役割が登録されていません</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleList;
