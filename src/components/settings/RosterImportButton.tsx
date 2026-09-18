import React, { useRef, useState } from "react";
import { Upload } from "lucide-react";
import ConfirmDialog from "../ui/ConfirmDialog";
import Input from "../ui/Input";
import { ROSTER_IMPORT_CONFIRM, useProjectIo } from "../../hooks/useProjectIo";
import type { RosterParseOk } from "../../utils/roster";

const RosterImportButton: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingRoster, setPendingRoster] = useState<RosterParseOk | null>(
    null,
  );
  const { handleRosterFile, importRoster } = useProjectIo();

  return (
    <>
      <Input
        type="file"
        accept=".csv,text/csv"
        ref={inputRef}
        style={{ display: "none" }}
        onChange={(e) => handleRosterFile(e, setPendingRoster)}
      />
      <button
        type="button"
        id="btn-import-roster"
        className="btn-secondary settings-io-btn"
        onClick={() => inputRef.current?.click()}
      >
        <Upload size={16} /> 名簿を取り込む
      </button>
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
    </>
  );
};

export default RosterImportButton;
