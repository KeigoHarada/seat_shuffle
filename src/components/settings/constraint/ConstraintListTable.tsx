import React, { useState } from "react";
import { useStore } from "../../../stores";
import { Trash2, Users, Target } from "lucide-react";
import ConfirmDialog from "../../ui/ConfirmDialog";
import { Constraint } from "../../../types";
import { GENDER_OPTIONS } from "../../../constants";
import Checkbox from "../../ui/Checkbox";
import { evaluateConstraint } from "../../../utils/algorithm";

const ConstraintListTable: React.FC = () => {
  const constraints = useStore((state) => state.constraints);
  const students = useStore((state) => state.students);
  const roles = useStore((state) => state.roles);
  const groups = useStore((state) => state.groups);
  const seats = useStore((state) => state.seats);
  const removeConstraint = useStore((state) => state.removeConstraint);
  const updateConstraint = useStore((state) => state.updateConstraint);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const getStudentName = (id: string) =>
    students.find((s) => s.id === id)?.name || "不明な生徒";
  const getRoleName = (id: string) =>
    roles.find((r) => r.id === id)?.name || "不明な役割";
  const getGenderLabel = (id: string) =>
    GENDER_OPTIONS.find((g) => g.value === id)?.label || "不明な性別";
  const getGroupName = (id: string) =>
    groups.find((g) => g.id === id)?.name || "不明なグループ";

  const renderContent = (c: Constraint) => {
    if (c.type === "student-student") {
      const isClose = c.matchType === "close";
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: "13px",
              color: "var(--c-text-main)",
            }}
          >
            {getStudentName(c.studentId1)} と {getStudentName(c.studentId2)}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "var(--c-text-sub)",
            }}
          >
            {isClose ? "同じ班にする" : "別の班にする"}
          </div>
        </div>
      );
    }

    if (c.type === "student-group") {
      const isInclude = c.matchType === "include";
      const groupNames = c.groupIds
        .map((id: string) => getGroupName(id))
        .join(" または ");
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: "13px",
              color: "var(--c-text-main)",
            }}
          >
            {getStudentName(c.studentId)}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "var(--c-text-sub)",
            }}
          >
            {groupNames} に {isInclude ? "入れる" : "入れない"}
          </div>
        </div>
      );
    }

    if (c.type === "group-match") {
      const targetName =
        c.targetType === "role"
          ? getRoleName(c.targetId)
          : getGenderLabel(c.targetId);

      const groupNames = c.groupIds
        .map((id: string) => getGroupName(id))
        .join(", ");

      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: "13px",
              color: "var(--c-text-main)",
            }}
          >
            {c.targetType === "role" ? "役割:" : "性別:"} {targetName}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "var(--c-text-sub)",
            }}
          >
            {groupNames} にそれぞれ {c.minCount} 人以上
          </div>
        </div>
      );
    }

    return null;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "student-student":
        return <Users size={16} color="var(--c-text-sub)" />;
      case "student-group":
        return <Target size={16} color="var(--c-text-sub)" />;
      case "group-match":
        return <Target size={16} color="var(--c-text-sub)" />;
      default:
        return null;
    }
  };

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
              {/* 1. Type Icon */}
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

              {/* 2. Content */}
              {renderContent(c)}

              {/* 3. Enable Toggle */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Checkbox
                  checked={c.isEnabled}
                  onChange={(e) =>
                    updateConstraint(c.id, { isEnabled: e.target.checked })
                  }
                  style={{ cursor: "pointer" }}
                />
              </div>

              {/* 4. Action */}
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

      {/* Delete Confirmation Dialog */}
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
