import type { ChangeEvent } from "react";
import { useStore } from "../stores";
import {
  parseRosterCsv,
  type RosterParseErr,
  type RosterParseOk,
} from "../utils/roster";
import { parseProjectBackup, serializeProjectBackup } from "../utils/backup";
import { showToast } from "../stores/toast";

export const ROSTER_IMPORT_CONFIRM =
  "名簿だけ取り込みます。席の割り当てと条件はクリアされます（座席の配置・グループ設定はそのまま）。";

function clearFileInputForReselect(input: HTMLInputElement) {
  input.value = "";
}

function rosterErrorMessage(reason: RosterParseErr["reason"]): string {
  switch (reason) {
    case "missing-name-column":
      return "名前の列が見つかりません。";
    case "zero-valid-rows":
      return "有効な名簿行がありません。現在の状態は変えていません。";
    default: {
      const unhandled: never = reason;
      return unhandled;
    }
  }
}

function downloadText(filename: string, contents: string, type: string) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function useProjectIo() {
  const importRoster = (parsed: RosterParseOk) => {
    useStore.getState().importRoster(parsed);
    const skippedNote =
      parsed.skipped > 0 ? `、${parsed.skipped}行スキップ` : "";
    showToast.success(
      `名簿を取り込みました（${parsed.rows.length}人${skippedNote}）`,
    );
  };

  const handleRosterFile = (
    e: ChangeEvent<HTMLInputElement>,
    onParsed: (parsed: RosterParseOk) => void,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = String(event.target?.result ?? "");
        const parsed = parseRosterCsv(text);
        if (!parsed.ok) {
          showToast.error(rosterErrorMessage(parsed.reason));
          return;
        }
        onParsed(parsed);
      };
      reader.onerror = () => {
        showToast.error("ファイルの読み込みに失敗しました。");
      };
      reader.readAsText(file);
    }
    clearFileInputForReselect(e.target);
  };

  const handleSaveBackup = () => {
    const state = useStore.getState();
    const body = serializeProjectBackup(state);
    const day = new Date().toISOString().slice(0, 10);
    downloadText(
      `rakugae_backup_${day}.json`,
      body,
      "application/octet-stream",
    );
  };

  const handleLoadBackup = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = String(event.target?.result ?? "");
      const parsed = parseProjectBackup(text);
      if (!parsed.ok) {
        showToast.error(
          "バックアップを読み込めませんでした。現在の状態は変えていません。",
        );
        return;
      }
      useStore.getState().replaceProject(parsed.snapshot);
      showToast.success("バックアップを読み込みました。");
    };
    reader.onerror = () => {
      showToast.error(
        "バックアップを読み込めませんでした。現在の状態は変えていません。",
      );
    };
    reader.readAsText(file);
    clearFileInputForReselect(e.target);
  };

  return {
    handleRosterFile,
    handleSaveBackup,
    handleLoadBackup,
    importRoster,
  };
}
