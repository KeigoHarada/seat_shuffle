import React, { useState } from "react";
import { useStore } from "../../../stores/appStore";
import { Trash2, Users, Target } from "lucide-react";
import ConfirmDialog from "../../ui/ConfirmDialog";
import Checkbox from "../../ui/Checkbox";
import { evaluateConstraint } from "../../../services/constraintEvaluation";
import ConstraintDescription from "./ConstraintDescription";

const ConstraintListTable: React.FC = () => {
  const constraints = useStore((state) => state.constraints);
  const students = useStore((state) => state.students);
  const roles = useStore((state) => state.roles);
  const groups = useStore((state) => state.groups);
  const seats = useStore((state) => state.seats);
  const removeConstraint = useStore((state) => state.removeConstraint);
  const updateConstraint = useStore((state) => state.updateConstraint);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const getIcon = (type: string) => {
    switch (type) {
      case "student-student":
        return <Users size={16} color="var(--c-text-sub)" />;
      case "student-group":
      case "group-match":
        return <Target size={16} color="var(--c-text-sub)" />;
      default:
        return null;
    }
  };

  return (
    <div className="app-settings-list">
      <div style={{ flexShrink: 0 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "32px 1fr 40px 32px",
            gap: "8px",
            padding: "0 8px 8px 8px",
            fontSize: "12px",
            fontWeight: 700,
            color: "var(--c-text-sub)",
            borderBottom: "2px solid var(--c-surface-disabled)",
            marginBottom: "8px",
          }}
        >
          <div style={{ textAlign: "center" }}>種類</div>
          <div>ルール内容</div>
          <div style={{ textAlign: "center" }}>有効</div>
          <div></div>
        </div>
      </div>

      <div className="app-settings-list-body">
        {constraints.map((c) => {
          const isSatisfied = c.isEnabled
            ? evaluateConstraint(c, seats, students)
            : null;

          let borderColor = "var(--c-surface-disabled)";
          let bgColor = "transparent";

          if (c.isEnabled) {
            if (isSatisfied === true) {
              borderColor = "var(--c-success)";
              bgColor = "var(--c-success-pale)";
            } else if (isSatisfied === false) {
              borderColor = "var(--c-error)";
              bgColor = "var(--c-error-pale)";
            }
          }

          return (
            <div
              key={c.id}
              style={{
                display: "grid",
                gridTemplateColumns: "32px 1fr 40px 32px",
                gap: "8px",
                alignItems: "center",
                padding: "8px",
                border: `1px solid ${borderColor}`,
                borderRadius: "var(--radius-md)",
                backgroundColor: bgColor,
                opacity: c.isEnabled ? 1 : 0.5,
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifySelf: "center",
                  alignItems: "center",
                }}
                title={c.type}
              >
                {getIcon(c.type)}
              </div>

              <ConstraintDescription
                constraint={c}
                students={students}
                roles={roles}
                groups={groups}
              />

              <div style={{ display: "flex", justifyContent: "center" }}>
                <Checkbox
                  checked={c.isEnabled}
                  onChange={(e) =>
                    updateConstraint(c.id, { isEnabled: e.target.checked })
                  }
                  style={{ cursor: "pointer" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <button
                  className="btn-icon-danger"
                  title="削除"
                  onClick={() => setDeleteTargetId(c.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
        {constraints.length === 0 && (
          <div
            style={{
              padding: "var(--spacing-xl)",
              textAlign: "center",
              color: "var(--c-text-sub)",
              fontSize: "13px",
            }}
          >
            条件・ルールが設定されていません
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        title="ルールの削除"
        message="本当にこのルールを削除しますか？"
        confirmText="削除する"
        onConfirm={() => {
          if (deleteTargetId) removeConstraint(deleteTargetId);
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};

export default ConstraintListTable;
