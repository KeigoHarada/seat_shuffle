import React, { useState } from "react";
import { useStore } from "../../../stores";
import { Trash2, GripVertical } from "lucide-react";
import ConfirmDialog from "../../ui/ConfirmDialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import StudentSortableRow from "./StudentSortableRow";

const StudentListTable: React.FC = () => {
  const students = useStore((state) => state.students);
  const removeStudent = useStore((state) => state.removeStudent);
  const reorderStudents = useStore((state) => state.reorderStudents);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = students.findIndex((s) => s.id === active.id);
      const newIndex = students.findIndex((s) => s.id === over.id);
      reorderStudents(oldIndex, newIndex);
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
            gridTemplateColumns: "16px 24px 1fr 76px 32px",
            gap: "8px",
            padding: "0 8px 8px 8px",
            fontSize: "12px",
            fontWeight: 700,
            color: "var(--c-text-sub)",
            borderBottom: "2px solid var(--c-surface-disabled)",
            marginBottom: "8px",
          }}
        >
          <div></div>
          <div style={{ textAlign: "center" }}>No.</div>
          <div>ふりがな / 名前</div>
          <div style={{ textAlign: "center" }}>性別</div>
          <div></div>
        </div>
      </div>

      {/* Table Rows */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
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
          <SortableContext
            items={students.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {students.map((student) => (
              <StudentSortableRow
                key={student.id}
                student={student}
                onDelete={setDeleteTargetId}
              />
            ))}
          </SortableContext>
          {students.length === 0 && (
            <div
              style={{
                padding: "var(--spacing-xl)",
                textAlign: "center",
                color: "var(--c-text-sub)",
                fontSize: "13px",
              }}
            >
              生徒が登録されていません
            </div>
          )}
        </div>
      </DndContext>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        title="生徒の削除"
        message="本当にこの生徒を削除しますか？この操作は取り消せません。"
        confirmText="削除する"
        onConfirm={() => {
          if (deleteTargetId) removeStudent(deleteTargetId);
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};

export default StudentListTable;
