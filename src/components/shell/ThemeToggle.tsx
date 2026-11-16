"use client";

import { useEffect, useState } from "react";
import {
  getCurrentTheme,
  toggleTheme,
  type PortfolioTheme,
} from "@/lib/theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<PortfolioTheme>("light");

  useEffect(() => {
    setTheme(getCurrentTheme());

    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<PortfolioTheme>;
      setTheme(customEvent.detail);
    };

    window.addEventListener("portfolio:theme-change", handleThemeChange);
    return () =>
      window.removeEventListener("portfolio:theme-change", handleThemeChange);
  }, []);

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
