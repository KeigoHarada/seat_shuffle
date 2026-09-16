import React from "react";
import ShuffleAnimation from "./components/layout/ShuffleAnimation";
import OnboardingController from "./components/onboarding/OnboardingController";
import { ToastContainer } from "./components/ui/Toast";
import AppShell from "./views/AppShell";

const App: React.FC = () => {
  return (
    <>
      <AppShell />
      <ShuffleAnimation />
      <ToastContainer />
      <OnboardingController />
    </>
  );
};

export default App;
