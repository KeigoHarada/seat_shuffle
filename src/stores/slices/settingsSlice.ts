type SetState = (partial: unknown) => void;

export function createSettingsSlice(set: SetState) {
  return {
    toggleSettings: () =>
      set((state: { showSettings: boolean }) => ({
        showSettings: !state.showSettings,
      })),

    setSettingsPanelWidth: (width: number) =>
      set({ settingsPanelWidth: width }),
  };
}
