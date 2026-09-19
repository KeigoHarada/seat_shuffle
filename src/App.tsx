import React from "react";
import ShuffleAnimation from "./components/layout/ShuffleAnimation";
import OnboardingController from "./components/onboarding/OnboardingController";
import { PrintProvider } from "./components/print/PrintProvider";
import { ToastContainer } from "./components/ui/Toast";
import DesktopApp from "./views/desktop/DesktopApp";

const App: React.FC = () => {
  return (
    <PrintProvider>
      <DesktopApp />
      <ShuffleAnimation />
      <ToastContainer />
      <OnboardingController />
    </PrintProvider>
  );
};

export default App;
