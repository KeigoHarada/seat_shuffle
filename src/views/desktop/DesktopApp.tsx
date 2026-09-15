import React from "react";
import Canvas from "../../components/canvas/Canvas";
import SettingsPanel from "../../components/SettingsPanel";
import { useStore } from "../../stores";
import DesktopHeader from "./DesktopHeader";
import DesktopFooter from "./DesktopFooter";

const DesktopApp: React.FC = () => {
  const isSettingsOpen = useStore((state) => state.isSettingsOpen);
  const setIsSettingsOpen = useStore((state) => state.setIsSettingsOpen);
  const seats = useStore((state) => state.seats);
  const isViewMode = useStore((state) => state.isViewMode);

  const effectiveSettingsOpen = isSettingsOpen && !isViewMode;

  return (
    <div className="app-shell" data-kind="desktop">
      <DesktopHeader
        showSettings={effectiveSettingsOpen}
        onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)}
      />

      <div className="app-main">
        <main className="app-canvas">
          <Canvas />

          {seats.length === 0 && (
            <div className="app-canvas-empty">
              <p className="text-title3">
                右クリックまたはツールバーから座席を追加
              </p>
            </div>
          )}
        </main>

        <aside
          className="app-settings"
          data-open={effectiveSettingsOpen ? "true" : "false"}
        >
          <div className="app-settings-inner">
            <SettingsPanel />
          </div>
        </aside>
      </div>

      <DesktopFooter />
    </div>
  );
};

export default DesktopApp;
