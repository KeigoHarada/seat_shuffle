import React, { useState } from "react";
import { useStore } from "../stores";
import { Plus, Trash2, UsersRound } from "lucide-react";
import { Group } from "../types";

const GroupList: React.FC = () => {
  const groups = useStore((state) => state.groups);
  const addGroup = useStore((state) => state.addGroup);
  const updateGroup = useStore((state) => state.updateGroup);
  const removeGroup = useStore((state) => state.removeGroup);

  const [newName, setNewName] = useState("");

  const colors = [
    "var(--c-group-pink)",
    "var(--c-group-blue)",
    "var(--c-group-green)",
    "var(--c-group-yellow)",
    "var(--c-group-purple)",
    "var(--c-group-orange)",
  ];

  const handleAdd = () => {
    if (!newName.trim()) return;
    const newGroup: Group = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      color: colors[groups.length % colors.length],
    };
    addGroup(newGroup);
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
      {/* Add New Group */}
      <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="グループ名を入力して追加..."
          style={{ flex: 1 }}
        />
        <button
          className="btn-primary"
          onClick={handleAdd}
          style={{ padding: "0 var(--spacing-md)" }}
          title="グループを追加"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Group List */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-sm)",
        }}
      >
        {groups.map((group) => (
          <div
            key={group.id}
            className="card"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-sm)",
              padding: "var(--spacing-sm) var(--spacing-md)",
            }}
          >
            <div
              style={{ position: "relative", width: "32px", height: "32px" }}
            >
              {/* Fake color picker display */}
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: group.color.startsWith("var")
                    ? `var(${group.color.slice(4, -1)})`
                    : group.color,
                  borderRadius: "var(--radius-md)",
                  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.1)",
                }}
              />
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <input
                type="text"
                value={group.name}
                onChange={(e) =>
                  updateGroup(group.id, { name: e.target.value })
                }
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
                if (window.confirm(`「${group.name}」を削除しますか？`)) {
                  removeGroup(group.id);
                }
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {groups.length === 0 && (
          <div
            className="card"
            style={{
              padding: "var(--spacing-xl)",
              textAlign: "center",
              color: "var(--c-text-sub)",
            }}
          >
            <UsersRound
              size={32}
              style={{ marginBottom: "var(--spacing-sm)", opacity: 0.5 }}
            />
            <p className="text-body">グループが登録されていません</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupList;
