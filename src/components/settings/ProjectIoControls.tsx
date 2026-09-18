import React, { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import ConfirmDialog from "../ui/ConfirmDialog";
import Input from "../ui/Input";
import {
  ROSTER_IMPORT_CONFIRM,
  useProjectIo,
} from "../../hooks/useProjectIo";
import type { RosterParseOk } from "../../utils/roster";

type ProjectIoMode = "prep" | "backup";

const ioButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  padding: "10px 16px",
  fontSize: "13px",
  width: "100%",
};

const ProjectIoControls: React.FC<{
  mode: ProjectIoMode;
  idPrefix: string;
}> = ({ mode, idPrefix }) => {
  const rosterInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);
  const [pendingRoster, setPendingRoster] = useState<RosterParseOk | null>(
    null,
  );
  const { handleRosterFile, handleSaveBackup, handleLoadBackup, importRoster } =
    useProjectIo();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {mode === "prep" && (
        <Input
          type="file"
          accept=".csv,text/csv"
          ref={rosterInputRef}
          style={{ display: "none" }}
          onChange={(e) => handleRosterFile(e, setPendingRoster)}
        />
      )}
      <Input
        type="file"
        accept="application/octet-stream"
        ref={backupInputRef}
        style={{ display: "none" }}
        onChange={handleLoadBackup}
      />

      {mode === "prep" && (
        <button
          type="button"
          id={`${idPrefix}-import-roster`}
          className="btn-secondary"
          style={ioButtonStyle}
          onClick={() => rosterInputRef.current?.click()}
        >
          <Upload size={16} /> 名簿を取り込む
        </button>
      )}
      <button
        type="button"
        id={`${idPrefix}-backup-save`}
        className="btn-secondary"
        style={ioButtonStyle}
        onClick={handleSaveBackup}
      >
        <Download size={16} /> バックアップを保存
      </button>
      <button
        type="button"
        id={`${idPrefix}-backup-load`}
        className="btn-secondary"
        style={ioButtonStyle}
        onClick={() => backupInputRef.current?.click()}
      >
        <Upload size={16} /> バックアップを読み込む
      </button>

      {mode === "prep" && (
        <ConfirmDialog
          isOpen={pendingRoster !== null}
          title="名簿の取り込み"
          message={ROSTER_IMPORT_CONFIRM}
          confirmText="取り込む"
          cancelText="キャンセル"
          variant="warning"
          onConfirm={() => {
            if (pendingRoster) importRoster(pendingRoster);
          }}
          onCancel={() => setPendingRoster(null)}
        />
      )}
    </div>
  );
};

export default ProjectIoControls;
