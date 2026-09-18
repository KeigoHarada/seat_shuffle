import React, { useRef, useState } from "react";
import { Upload } from "lucide-react";
import ConfirmDialog from "../../ui/ConfirmDialog";
import Input from "../../ui/Input";
import {
  ROSTER_CSV_EXPLAIN,
  ROSTER_IMPORT_CONFIRM,
  useProjectIo,
} from "../../../hooks/useProjectIo";
import type { RosterParseOk } from "../../../utils/roster";
import StudentAddForm from "./StudentAddForm";
import StudentListTable from "./StudentListTable";

type RosterIo =
  | { type: "idle" }
  | { type: "explain" }
  | { type: "confirm"; parsed: RosterParseOk };

const StudentTab: React.FC = () => {
  const rosterInputRef = useRef<HTMLInputElement>(null);
  const [io, setIo] = useState<RosterIo>({ type: "idle" });
  const { handleRosterFile, importRoster } = useProjectIo();

  return (
    <div className="app-settings-fill" style={{ gap: "var(--spacing-md)" }}>
      <div style={{ flexShrink: 0 }}>
        <button
          type="button"
          id="btn-prep-import-roster"
          className="btn-secondary"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            width: "100%",
            padding: "10px 16px",
            fontSize: "13px",
            marginBottom: "var(--spacing-md)",
          }}
          onClick={() => setIo({ type: "explain" })}
        >
          <Upload size={16} /> 名簿を読み込む
        </button>
        <StudentAddForm />
      </div>
      <div id="student-list-area" className="app-settings-fill">
        <StudentListTable />
      </div>

      <Input
        type="file"
        accept=".csv,text/csv"
        id="btn-prep-import-roster-file"
        ref={rosterInputRef}
        style={{ display: "none" }}
        onChange={(e) =>
          handleRosterFile(e, (parsed) => setIo({ type: "confirm", parsed }))
        }
      />
      <ConfirmDialog
        isOpen={io.type === "explain"}
        title="名簿を読み込む"
        message={ROSTER_CSV_EXPLAIN}
        confirmText="読み込む"
        cancelText="キャンセル"
        variant="primary"
        onConfirm={() => rosterInputRef.current?.click()}
        onCancel={() => setIo({ type: "idle" })}
      />
      <ConfirmDialog
        isOpen={io.type === "confirm"}
        title="名簿の取り込み"
        message={ROSTER_IMPORT_CONFIRM}
        confirmText="取り込む"
        cancelText="キャンセル"
        variant="warning"
        onConfirm={() => {
          if (io.type === "confirm") importRoster(io.parsed);
        }}
        onCancel={() => setIo({ type: "idle" })}
      />
    </div>
  );
};

export default StudentTab;
