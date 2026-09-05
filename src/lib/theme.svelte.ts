export type Theme = "system" | "light" | "dark";

const THEME_CYCLE: Theme[] = ["system", "light", "dark"];

let theme = $state<Theme>((localStorage.getItem("theme") as Theme) || "system");

export function getTheme(): Theme {
  return theme;
}

export function getIsDark(): boolean {
  return (
    theme === "dark" ||
    (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
}

export function cycleTheme() {
  const idx = THEME_CYCLE.indexOf(theme);
  theme = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
}
