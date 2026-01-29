type SetState = (partial: unknown) => void;

const BGM_ENABLED_KEY = "seat_shuffle_bgm_enabled";

export function loadBgmEnabled(): boolean {
  try {
    const stored = localStorage.getItem(BGM_ENABLED_KEY);
    return stored !== null ? stored === "true" : true;
  } catch {
    return true;
  }
}

export function createSettingsSlice(set: SetState) {
  return {
    bgmEnabled: loadBgmEnabled(),

    toggleSettings: () =>
      set((state: { showSettings: boolean }) => ({
        showSettings: !state.showSettings,
      })),

    setSettingsPanelWidth: (width: number) =>
      set({ settingsPanelWidth: width }),

    setBgmEnabled: (enabled: boolean) => {
      try {
        localStorage.setItem(BGM_ENABLED_KEY, enabled ? "true" : "false");
      } catch {}
      set({ bgmEnabled: enabled });
    },
  };
}
