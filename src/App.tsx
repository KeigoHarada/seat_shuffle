import React from "react";
import Canvas from "./components/canvas/Canvas";
import SettingsPanel from "./components/SettingsPanel";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ShuffleAnimation from "./components/layout/ShuffleAnimation";
import { ToastContainer } from "./components/ui/Toast";
import { useStore } from "./stores";

const App: React.FC = () => {
  const isSettingsOpen = useStore((state) => state.isSettingsOpen);
  const setIsSettingsOpen = useStore((state) => state.setIsSettingsOpen);
  const seats = useStore((state) => state.seats);
  const isViewMode = useStore((state) => state.isViewMode);

  const effectiveSettingsOpen = isSettingsOpen && !isViewMode;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      <Header
        showSettings={effectiveSettingsOpen}
        onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)}
      />

      {/* Main Content Area */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Editor (Canvas) Area */}
        <main style={{ flex: 1, position: "relative" }}>
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

        {/* Settings Panel (Sidebar) */}
        <aside
          style={{
            width: effectiveSettingsOpen ? "clamp(320px, 30vw, 400px)" : "0px",
            transition: "width 0.3s cubic-bezier(0.2, 0, 0, 1)",
            overflow: "hidden",
            borderLeft: effectiveSettingsOpen
              ? "1px solid var(--c-border)"
              : "none",
            flexShrink: 0,
          }}
        >
          <div style={{ width: "clamp(320px, 30vw, 400px)", height: "100%" }}>
            <SettingsPanel />
          </div>
        </aside>
      </div>

      <Footer />
      <ShuffleAnimation />
      <ToastContainer />
    </div>
  );
};

export default App;
