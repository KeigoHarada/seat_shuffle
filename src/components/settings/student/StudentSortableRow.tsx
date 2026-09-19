import React, { useEffect, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import type { Student, GenderType } from "../../../types/student";
import { useStore } from "../../../stores/appStore";
import Select from "../../ui/Select";
import MultiSelect from "../../ui/MultiSelect";
import { GENDER_OPTIONS } from "../../../constants/gender";
import Input from "../../ui/Input";
import { AVAILABLE_ICONS, type IconName } from "../../../constants/icons";

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
  const highlightedStudentId = useStore((state) => state.highlightedStudentId);
  const setHighlightedStudentId = useStore(
    (state) => state.setHighlightedStudentId,
  );
  const setEditingStudentId = useStore((state) => state.setEditingStudentId);

  const isHighlighted = highlightedStudentId === student.id;
  const innerRef = useRef<HTMLDivElement | null>(null);

  const combinedRef = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    innerRef.current = node;
  };

  useEffect(() => {
    if (isHighlighted) {
      if (innerRef.current) {
        innerRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      const timer = setTimeout(() => {
        setHighlightedStudentId(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isHighlighted, setHighlightedStudentId]);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition
      ? `${transition}, background-color 0.5s ease-out`
      : "background-color 0.5s ease-out",
    display: "grid",
    gridTemplateColumns: "16px 24px 1fr 76px 32px",
    gap: "8px",
    alignItems: "center",
    padding: "8px",
    borderBottom: "1px solid var(--c-surface-disabled)",
    backgroundColor: isHighlighted
      ? "var(--c-primary-pale)"
      : "var(--c-surface)",
    opacity: isDragging ? 0.5 : 1,
    boxShadow: isDragging ? "var(--shadow-2)" : "none",
    position: "relative",
    zIndex: isDragging ? 10 : 1,
  };

  const handleFocus = () => setEditingStudentId(student.id);
  const handleBlur = (e: React.FocusEvent) => {
    if (!innerRef.current?.contains(e.relatedTarget as Node)) {
      setEditingStudentId(null);
    }
  };
  const handleMouseEnter = () => setEditingStudentId(student.id);
  const handleMouseLeave = () => setEditingStudentId(null);

  return (
    <div
      ref={combinedRef}
      style={style}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
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

      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          className="btn-icon-danger"
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
