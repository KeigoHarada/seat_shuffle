import React from "react";
import Canvas from "./components/canvas/Canvas";
import SettingsPanel from "./components/SettingsPanel";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ShuffleAnimation from "./components/layout/ShuffleAnimation";
import { ToastContainer } from "./components/ui/Toast";
import OnboardingController from "./components/onboarding/OnboardingController";
import { useStore } from "./stores";

const App: React.FC = () => {
  const isSettingsOpen = useStore((state) => state.isSettingsOpen);
  const setIsSettingsOpen = useStore((state) => state.setIsSettingsOpen);
  const seats = useStore((state) => state.seats);
  const isViewMode = useStore((state) => state.isViewMode);

  const effectiveSettingsOpen = isSettingsOpen && !isViewMode;

  return (
    <div className="app-shell">
      <Header
        showSettings={effectiveSettingsOpen}
        onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)}
      />

      <div className="app-main">
        <main className="app-canvas">
          <Canvas />

          {seats.length === 0 && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                color: "var(--c-text-sub)",
                pointerEvents: "none",
              }}
            >
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

      <Footer />
      <ShuffleAnimation />
      <ToastContainer />
      <OnboardingController />
    </div>
  );
};

export default App;
