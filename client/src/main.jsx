import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

async function enableMocking() {
  if (import.meta.env.VITE_ENABLE_MSW !== "true") {
    return;
  }

  const { worker } = await import("./mocks/browser");

  await worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: {
      url: "/mockServiceWorker.js",
    },
  });
}

/** Always mount the app; MSW failures must not block the UI (blank screen). */
enableMocking()
  .catch((err) => {
    console.error(
      "[MSW] Failed to start — loading without mocks. If you use VITE_ENABLE_MSW=true, try DevTools → Application → Service Workers → Unregister, then hard-refresh.",
      err,
    );
  })
  .finally(() => {
    ReactDOM.createRoot(document.getElementById("root")).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  });
