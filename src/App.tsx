import React from "react";
import ShuffleAnimation from "./components/animation/ShuffleAnimation";
import OnboardingController from "./components/onboarding/OnboardingController";
import PrintArea from "./components/print/PrintArea";
import { ToastContainer } from "./components/ui/Toast";
import MainView from "./views/MainView";

const App: React.FC = () => {
  return (
    <>
      <div data-screen-root>
        <MainView />
        <ShuffleAnimation />
        <ToastContainer />
        <OnboardingController />
      </div>
      <PrintArea />
    </>
  );
};

export default App;
