import { useStore } from "../stores";
import { exportSettingsToCSV, importSettingsFromCSV } from "../utils/csv";
import { showToast } from "../stores/toast";

export const useCsvSettings = () => {
  const handleSave = () => {
    const state = useStore.getState();
    const csvContent = exportSettingsToCSV(state);

    // add BOM for Excel UTF-8 compatibility
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const blob = new Blob([bom, csvContent], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seat_shuffle_settings_${new Date().toISOString().slice(0, 10)}.csv`;
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

    // reset input so the same file can be loaded again if needed
    e.target.value = "";
  };

  return { handleSave, handleLoad };
};
