import React from 'react';
import { useSeatStore } from './stores/seatStore';
import { PublicView } from './views/PublicView';
import { SettingsView } from './views/SettingsView';

function App() {
  const { showSettings } = useSeatStore();

  return (
    <div className="App">
      {showSettings ? <SettingsView /> : <PublicView />}
    </div>
  );
}

export default App;
