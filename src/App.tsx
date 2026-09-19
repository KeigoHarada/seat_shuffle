import React from "react";
import ShuffleAnimation from "./components/layout/ShuffleAnimation";
import OnboardingController from "./components/onboarding/OnboardingController";
import { PrintProvider } from "./components/print/PrintProvider";
import { ToastContainer } from "./components/ui/Toast";
import MainView from "./views/MainView";

const App: React.FC = () => {
  return (
    <PrintProvider>
      <div data-screen-root>
        <MainView />
        <ShuffleAnimation />
        <ToastContainer />
        <OnboardingController />
      </div>
    </PrintProvider>
  );
};

export default App;
