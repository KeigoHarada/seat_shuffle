import { useStore } from "../stores";
import { exportSettingsToCSV, importSettingsFromCSV } from "../utils/csv";
import { showToast } from "../stores/toast";

const EXCEL_UTF8_CSV_BOM = new Uint8Array([0xef, 0xbb, 0xbf]);

function clearFileInputForReselect(input: HTMLInputElement) {
  input.value = "";
}

export const useCsvSettings = () => {
  const handleSave = () => {
    const state = useStore.getState();
    const csvContent = exportSettingsToCSV(state);

    const blob = new Blob([EXCEL_UTF8_CSV_BOM, csvContent], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rakugae_settings_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvString = event.target?.result as string;
        const loadedState = importSettingsFromCSV(csvString);
        if (
          loadedState.students?.length ||
          loadedState.roles?.length ||
          loadedState.groups?.length ||
          loadedState.constraints?.length
        ) {
          useStore.getState().loadState(loadedState);
          showToast.success("設定を読み込みました！");
        } else {
          showToast.error("データが見つからないか、無効なファイル形式です。");
        }
      } catch (err) {
        showToast.error("ファイルの読み込みに失敗しました。");
      }
    };
    reader.readAsText(file);

    clearFileInputForReselect(e.target);
  };

  return { handleSave, handleLoad };
};
