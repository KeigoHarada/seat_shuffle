import React, { useState } from "react";
import { useStore } from "../../../stores";
import { Plus } from "lucide-react";
import { Group } from "../../../types";
import ColorPicker from "../../ui/ColorPicker";
import { PREDEFINED_COLORS } from "../../../constants";
import Input from "../../ui/Input";

const GroupAddForm: React.FC = () => {
  const addGroup = useStore((state) => state.addGroup);

  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<string>(PREDEFINED_COLORS[0]);
  const [newDescription, setNewDescription] = useState("");

  const handleAdd = () => {
    if (!newName.trim() || newDescription.length > 30) return;
    const newGroup: Group = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      color: newColor,
      description: newDescription.trim(),
    };
    addGroup(newGroup);
    // Reset form
    setNewName("");
    setNewColor(PREDEFINED_COLORS[0]);
    setNewDescription("");
  };

  return (
    <div
      id="group-add-form"
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-md)",
        padding: "var(--spacing-md)",
      }}
    >
      <h3 className="text-title3" style={{ fontSize: "14px", margin: 0 }}>
        新規グループの追加
      </h3>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-sm)",
        }}
      >
        {/* Color & Name Row */}
        <div
          style={{
            display: "flex",
            gap: "var(--spacing-sm)",
            width: "100%",
            alignItems: "center",
          }}
        >
          <div style={{ width: "36px", height: "36px", flexShrink: 0 }}>
            <ColorPicker value={newColor} onChange={setNewColor} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="グループ名 (例: A班)"
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
          <Input
            type="text"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="説明文 (例: 掃除当番の班)"
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

export default GroupAddForm;
