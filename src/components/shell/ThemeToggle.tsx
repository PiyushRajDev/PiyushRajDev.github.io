"use client";

import { useSyncExternalStore } from "react";
import {
  getCurrentTheme,
  toggleTheme,
  type PortfolioTheme,
} from "@/lib/theme";

const subscribeToTheme = (onStoreChange: () => void) => {
  window.addEventListener("portfolio:theme-change", onStoreChange);

  return () => {
    window.removeEventListener("portfolio:theme-change", onStoreChange);
  };
};

const getThemeSnapshot = (): PortfolioTheme => getCurrentTheme();

const getThemeServerSnapshot = (): PortfolioTheme => "light";

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getThemeServerSnapshot
  );

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      aria-pressed={theme === "dark"}
    >
      <span className="theme-toggle__indicator" aria-hidden="true" />
      <span>LIGHT / DARK</span>
    </button>
  );
}