import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Student } from "../../../types";
import { useStore } from "../../../stores";
import Select from "../../ui/Select";
import MultiSelect from "../../ui/MultiSelect";
import { GENDER_OPTIONS, GenderType } from "../../../constants";
import Input from "../../ui/Input";
import { AVAILABLE_ICONS, IconName } from "../../ui/IconPicker";

interface Props {
  student: Student;
  onDelete: (id: string) => void;
}

const StudentSortableRow: React.FC<Props> = ({ student, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: student.id });

  const roles = useStore((state) => state.roles);
  const updateStudent = useStore((state) => state.updateStudent);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    display: "grid",
    gridTemplateColumns: "16px 24px 1fr 76px 32px",
    gap: "8px",
    alignItems: "center",
    padding: "8px",
    borderBottom: "1px solid var(--c-surface-disabled)",
    backgroundColor: "var(--c-surface)",
    opacity: isDragging ? 0.5 : 1,
    boxShadow: isDragging ? "var(--shadow-2)" : "none",
    position: "relative",
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        style={{
          color: "var(--c-text-placeholder)",
          display: "flex",
          alignItems: "center",
          cursor: "grab",
        }}
      >
        <GripVertical size={16} />
      </div>

      {/* 1. No */}
      <div
        style={{
          fontSize: "11px",
          fontWeight: 700,
          color: "var(--c-text-sub)",
          textAlign: "center",
        }}
      >
        {student.attendanceNumber}
      </div>

      {/* 2. Name & Furigana */}
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
          value={student.furigana || ""}
          onChange={(e) =>
            updateStudent(student.id, { furigana: e.target.value })
          }
          placeholder="ふりがな"
          style={{
            border: "none",
            background: "transparent",
            fontSize: "10px",
            color: "var(--c-text-sub)",
            padding: 0,
            outline: "none",
            width: "100%",
            textOverflow: "ellipsis",
          }}
        />
        <Input
          type="text"
          value={student.name}
          onChange={(e) => updateStudent(student.id, { name: e.target.value })}
          placeholder="名前"
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
        <div style={{ marginTop: "4px" }}>
          <MultiSelect
            options={roles.map((r) => {
              const IconComp =
                AVAILABLE_ICONS[r.iconName as IconName] || AVAILABLE_ICONS.Star;
              return {
                label: r.name,
                value: r.id,
                icon: <IconComp size={12} />,
              };
            })}
            selectedValues={student.roleIds}
            onChange={(values) =>
              updateStudent(student.id, { roleIds: values })
            }
            placeholder="ロール追加..."
            small
          />
        </div>
      </div>

      {/* 3. Gender */}
      <div style={{ display: "flex", justifyContent: "center", minWidth: 0 }}>
        <Select
          options={GENDER_OPTIONS}
          value={student.gender}
          onChange={(val) =>
            updateStudent(student.id, { gender: val as GenderType })
          }
          small
        />
      </div>

      {/* 4. Action */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          className="btn-danger"
          style={{ padding: "6px" }}
          title="削除"
          onClick={() => onDelete(student.id)}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default StudentSortableRow;
