import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/color-scheme.css";
import { getCurrentColorScheme, applyColorScheme } from "./lib/colorScheme";
import App from "./App.tsx";

// Initialize color scheme
const scheme = getCurrentColorScheme();
applyColorScheme(scheme);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
