import type { ChangeEvent } from "react";
import { useStore } from "../stores/appStore";
import {
  readRosterFile,
  type RosterParseErr,
  type RosterParseOk,
} from "../services/roster";
import {
  downloadBackupFile,
  readBackupFile,
} from "../services/backup";
import { showToast } from "../stores/toast";

export const ROSTER_IMPORT_CONFIRM =
  "名簿だけ取り込みます。席の割り当てと条件はクリアされます（座席の配置・グループ設定はそのまま）。";

export const ROSTER_CSV_EXPLAIN =
  "1行目に「名前」列があるCSVを読み込みます。空の名前はスキップします。";

export const BACKUP_IMPORT_EXPLAIN =
  "バックアップファイルを読み込むと、いまの教室を置き換えます。壊れたファイルは読み込みません。";

export const BACKUP_EXPORT_EXPLAIN =
  "いまの教室の状態をバックアップファイルとして保存します。";

function clearFileInputForReselect(input: HTMLInputElement) {
  input.value = "";
}

function rosterErrorMessage(reason: RosterParseErr["reason"]): string {
  switch (reason) {
    case "missing-name-column":
      return "名前の列が見つかりません。";
    case "zero-valid-rows":
      return "取り込める名前がありません。いまの教室はそのままです";
    default: {
      const unhandled: never = reason;
      return unhandled;
    }
  }
}

export function useProjectIo() {
  const importRoster = (parsed: RosterParseOk) => {
    useStore.getState().importRoster(parsed);
    const n = parsed.skipped;
    const m = parsed.rows.length;
    showToast.success(
      n > 0
        ? `名前のない行を${n}件スキップして、${m}人取り込みました`
        : `名簿を取り込みました（${m}人）`,
    );
  };

  const handleRosterFile = async (
    e: ChangeEvent<HTMLInputElement>,
    onParsed: (parsed: RosterParseOk) => void,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const parsed = await readRosterFile(file);
      if (!parsed.ok) {
        showToast.error(rosterErrorMessage(parsed.reason));
      } else {
        onParsed(parsed);
      }
    }
    clearFileInputForReselect(e.target);
  };

  const handleSaveBackup = () => {
    const state = useStore.getState();
    const day = new Date().toISOString().slice(0, 10);
    downloadBackupFile(state, `rakugae_backup_${day}.json`);
  };

  const handleLoadBackup = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const parsed = await readBackupFile(file);
    if (!parsed.ok) {
      showToast.error(
        "バックアップを読み込めませんでした。現在の状態は変えていません。",
      );
    } else {
      useStore.getState().replaceProject(parsed.snapshot);
      showToast.success("バックアップを読み込みました。");
    }
    clearFileInputForReselect(e.target);
  };

  return {
    handleRosterFile,
    handleSaveBackup,
    handleLoadBackup,
    importRoster,
  };
}
