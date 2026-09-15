import React from "react";
import ShuffleAnimation from "./components/layout/ShuffleAnimation";
import OnboardingController from "./components/onboarding/OnboardingController";
import { ToastContainer } from "./components/ui/Toast";
import { useShellKind } from "./hooks/useShellKind";
import { assertUnhandledShell } from "./layout/shell";
import DesktopApp from "./views/desktop/DesktopApp";
import PhoneApp from "./views/phone/PhoneApp";

const App: React.FC = () => {
  const kind = useShellKind();

  let shell: React.ReactNode;
  switch (kind) {
    case "phone":
      shell = <PhoneApp />;
      break;
    case "desktop":
      shell = <DesktopApp />;
      break;
    default:
      return assertUnhandledShell(kind);
  }

  return (
    <>
      {shell}
      <ShuffleAnimation />
      <ToastContainer />
      <OnboardingController />
    </>
  );
};

export default App;
