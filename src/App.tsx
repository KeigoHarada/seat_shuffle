import React, { useState } from "react";
import Canvas from "./components/Canvas";
import SettingsPanel from "./components/SettingsPanel";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { useStore } from "./stores";

const App: React.FC = () => {
  const [showSettings, setShowSettings] = useState(true);
  const seats = useStore((state) => state.seats);

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
        showSettings={showSettings}
        onToggleSettings={() => setShowSettings(!showSettings)}
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
              <p className="text-title3">ダブルクリックで座席を追加</p>
            </div>
          )}
        </main>

        {/* Settings Panel (Sidebar) */}
        <aside
          style={{
            width: showSettings ? "360px" : "0px",
            transition: "width 0.3s cubic-bezier(0.2, 0, 0, 1)",
            overflow: "hidden",
            borderLeft: showSettings ? "1px solid var(--c-border)" : "none",
            flexShrink: 0,
          }}
        >
          <div style={{ width: "360px", height: "100%" }}>
            <SettingsPanel />
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
};

export default App;
