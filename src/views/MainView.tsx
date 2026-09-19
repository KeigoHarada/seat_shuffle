import React, { useEffect } from "react";
import Canvas from "../components/canvas/Canvas";
import SettingsPanel from "../components/settings/SettingsPanel";
import { useCompactLayout } from "../hooks/useCompactLayout";
import { useStore } from "../stores/appStore";
import Header from "./Header";
import Footer from "./Footer";

const MainView: React.FC = () => {
  const isCompact = useCompactLayout();
  const isSettingsOpen = useStore((state) => state.isSettingsOpen);
  const setIsSettingsOpen = useStore((state) => state.setIsSettingsOpen);
  const seats = useStore((state) => state.seats);
  const isViewMode = useStore((state) => state.isViewMode);

  useEffect(() => {
    if (isCompact) {
      setIsSettingsOpen(false);
    }
  }, [isCompact, setIsSettingsOpen]);

  const effectiveSettingsOpen = isSettingsOpen && !isViewMode;

  return (
    <div className="app-shell" data-compact={isCompact ? "true" : "false"}>
      <Header
        showSettings={effectiveSettingsOpen}
        onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)}
      />

      <div className="app-main">
        <main className="app-canvas">
          <Canvas />

          {seats.length === 0 && (
            <div className="app-canvas-empty">
              <p className="text-title3">
                長押しまたはツールバーから座席を追加
              </p>
            </div>
          )}
        </main>

        {isCompact && effectiveSettingsOpen && (
          <button
            type="button"
            className="app-settings-scrim"
            aria-label="設定を閉じる"
            onClick={() => setIsSettingsOpen(false)}
          />
        )}

        <aside
          className="app-settings"
          data-open={effectiveSettingsOpen ? "true" : "false"}
        >
          <div className="app-settings-inner">
            <SettingsPanel />
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
};

export default MainView;
