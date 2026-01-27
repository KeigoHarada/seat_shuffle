if (typeof Worker === "undefined") {
  (globalThis as any).Worker = class MockWorker {
    constructor() {}
    postMessage() {}
    terminate() {}
    addEventListener() {}
    removeEventListener() {}
    onmessage = null;
    onerror = null;
  };
}
