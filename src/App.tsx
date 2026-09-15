import React from "react";
import ShuffleAnimation from "./components/layout/ShuffleAnimation";
import OnboardingController from "./components/onboarding/OnboardingController";
import { ToastContainer } from "./components/ui/Toast";
import DesktopApp from "./views/desktop/DesktopApp";

const App: React.FC = () => {
  return (
    <>
      <DesktopApp />
      <ShuffleAnimation />
      <ToastContainer />
      <OnboardingController />
    </>
  );
};

export default App;
