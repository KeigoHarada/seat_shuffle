import React, { useState } from "react";
import { useStore } from "../../../../stores";
import { Plus } from "lucide-react";
import { GroupMatchConstraint } from "../../../../types";
import { GENDER_OPTIONS } from "../../../../constants";
import Select from "../../../ui/Select";
import MultiSelect from "../../../ui/MultiSelect";

const GroupMatchForm: React.FC = () => {
  const addConstraint = useStore((state) => state.addConstraint);
  const roles = useStore((state) => state.roles);
  const groups = useStore((state) => state.groups);

  const [gmTargetType, setGmTargetType] = useState<"role" | "gender">("role");
  const [gmTargetId, setGmTargetId] = useState("");
  const [gmGroupIds, setGmGroupIds] = useState<string[]>([]);
  const [gmMinCount, setGmMinCount] = useState<number>(1);

  const roleOptions = roles.map((r) => ({ value: r.id, label: r.name }));
  const groupOptions = groups.map((g) => ({ value: g.id, label: g.name }));

  const handleAdd = () => {
    if (!gmTargetId || gmGroupIds.length === 0 || gmMinCount < 1) return;
    const newConstraint: GroupMatchConstraint = {
      id: crypto.randomUUID(),
      isEnabled: true,
      type: "group-match",
      targetType: gmTargetType,
      targetId: gmTargetId,
      groupIds: gmGroupIds,
      minCount: gmMinCount,
    };
    addConstraint(newConstraint);
    setGmTargetId("");
    setGmGroupIds([]);
    setGmMinCount(1);
  };

  const isAddDisabled =
    !gmTargetId || gmGroupIds.length === 0 || gmMinCount < 1;

  return (
    <>
      <div
        style={{
          fontSize: "11px",
          color: "var(--c-text-sub)",
          marginBottom: "8px",
          lineHeight: 1.4,
        }}
      >
        指定した役割や性別を持つ生徒が、選択した各グループに「N人以上」入るように設定します。
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ width: "80px" }}>
            <Select
              value={gmTargetType}
              onChange={(val) => {
                setGmTargetType(val as any);
                setGmTargetId("");
              }}
              options={[
                { value: "role", label: "役割" },
                { value: "gender", label: "性別" },
              ]}
              small
            />
          </div>
          <div style={{ flex: 1 }}>
            <Select
              value={gmTargetId}
              onChange={setGmTargetId}
              options={gmTargetType === "role" ? roleOptions : GENDER_OPTIONS}
              placeholder={
                gmTargetType === "role" ? "役割を選択" : "性別を選択"
              }
              small
            />
          </div>
          <span style={{ fontSize: "12px", color: "var(--c-text-sub)" }}>
            が
          </span>
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            zIndex: 10,
          }}
        >
          <div style={{ flex: 1 }}>
            <MultiSelect
              options={groupOptions}
              selectedValues={gmGroupIds}
              onChange={setGmGroupIds}
              placeholder="グループを選択（複数可）"
              small
            />
          </div>
          <span style={{ fontSize: "12px", color: "var(--c-text-sub)" }}>
            に
          </span>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            type="number"
            min={1}
            value={gmMinCount}
            onChange={(e) =>
              setGmMinCount(Math.max(1, parseInt(e.target.value) || 1))
            }
            style={{
              width: "60px",
              padding: "6px",
              fontSize: "13px",
              textAlign: "center",
            }}
          />
          <span style={{ fontSize: "12px", color: "var(--c-text-sub)" }}>
            人以上入る
          </span>
        </div>
      </div>
      <button
        className="btn-primary"
        onClick={handleAdd}
        disabled={isAddDisabled}
        style={{ alignSelf: "flex-end", marginTop: "12px" }}
      >
        <Plus size={16} style={{ marginRight: "4px" }} /> ルールを追加
      </button>
    </>
  );
};

export default GroupMatchForm;
