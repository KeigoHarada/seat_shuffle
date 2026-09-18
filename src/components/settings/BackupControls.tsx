import React, { useRef } from "react";
import { Download, Upload } from "lucide-react";
import Input from "../ui/Input";
import { useProjectIo } from "../../hooks/useProjectIo";

const BackupControls: React.FC<{ idPrefix: string }> = ({ idPrefix }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { handleSaveBackup, handleLoadBackup } = useProjectIo();

  return (
    <>
      <Input
        type="file"
        id={`${idPrefix}-backup-file`}
        ref={inputRef}
        style={{ display: "none" }}
        onChange={handleLoadBackup}
      />
      <button
        type="button"
        id={`${idPrefix}-backup-save`}
        className="btn-secondary settings-io-btn"
        onClick={handleSaveBackup}
      >
        <Download size={16} /> バックアップを保存
      </button>
      <button
        type="button"
        id={`${idPrefix}-backup-load`}
        className="btn-secondary settings-io-btn"
        onClick={() => inputRef.current?.click()}
      >
        <Upload size={16} /> バックアップを読み込む
      </button>
    </>
  );
};

export default BackupControls;
