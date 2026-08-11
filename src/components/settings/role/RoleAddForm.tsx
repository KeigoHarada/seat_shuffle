import React, { useState } from "react";
import { useStore } from "../../../stores";
import { Plus } from "lucide-react";
import { Role } from "../../../types";
import IconPicker, { IconName } from "../../ui/IconPicker";

const RoleAddForm: React.FC = () => {
  const addRole = useStore((state) => state.addRole);

  const [newName, setNewName] = useState("");
  const [newIconName, setNewIconName] = useState<IconName>("Star");
  const [newDescription, setNewDescription] = useState("");

  const handleAdd = () => {
    if (!newName.trim() || newDescription.length > 30) return;
    const newRole: Role = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      iconName: newIconName,
      description: newDescription.trim(),
    };
    addRole(newRole);
    // Reset form
    setNewName("");
    setNewIconName("Star");
    setNewDescription("");
  };

  return (
    <div
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-md)",
        padding: "var(--spacing-md)",
      }}
    >
      <h3 className="text-title3" style={{ fontSize: "14px", margin: 0 }}>
        新規役割の追加
      </h3>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-sm)",
        }}
      >
        {/* Icon & Name Row */}
        <div
          style={{
            display: "flex",
            gap: "var(--spacing-sm)",
            width: "100%",
            alignItems: "center",
          }}
        >
          <div style={{ width: "48px", flexShrink: 0 }}>
            <IconPicker value={newIconName} onChange={setNewIconName} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="役割名 (例: 班長)"
              style={{ width: "100%", fontSize: "13px", padding: "8px" }}
            />
          </div>
        </div>

        {/* Description Row */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <input
            type="text"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="説明文 (例: 班のまとめ役)"
            style={{
              width: "100%",
              fontSize: "12px",
              padding: "6px 8px",
              borderColor:
                newDescription.length > 30
                  ? "var(--c-error)"
                  : "var(--c-border)",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              fontSize: "10px",
              color:
                newDescription.length > 30
                  ? "var(--c-error)"
                  : "var(--c-text-sub)",
              fontWeight: newDescription.length > 30 ? 700 : 400,
            }}
          >
            {newDescription.length > 30
              ? "説明文は30文字以内にしてください"
              : `${newDescription.length}/30文字`}
          </div>
        </div>
      </div>

      <button
        className="btn-primary"
        onClick={handleAdd}
        disabled={!newName.trim() || newDescription.length > 30}
        style={{ alignSelf: "flex-end", marginTop: "4px" }}
      >
        <Plus size={16} style={{ marginRight: "4px" }} /> 追加
      </button>
    </div>
  );
};

export default RoleAddForm;
