export type PortfolioTheme = "light" | "dark";

export function getCurrentTheme(): PortfolioTheme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function applyTheme(theme: PortfolioTheme) {
  const root = document.documentElement;
  root.classList.remove("theme-light", "theme-dark");
  root.classList.add(theme === "dark" ? "theme-dark" : "theme-light");
  root.dataset.theme = theme;
  window.localStorage.setItem("portfolio-theme", theme);
  window.dispatchEvent(
    new CustomEvent<PortfolioTheme>("portfolio:theme-change", {
      detail: theme,
    }),
  );
}

export function toggleTheme() {
  applyTheme(getCurrentTheme() === "dark" ? "light" : "dark");
}
