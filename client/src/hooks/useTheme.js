import { useEffect } from "react";
import { useApp } from "../context/AppContext";

export const useTheme = () => {
  const { theme, toggleTheme } = useApp();

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return {
    theme,
    toggleTheme,
    isDark: theme === "dark",
  };
};
