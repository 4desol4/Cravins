import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // load from localStorage or fallback to system preference
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) return savedTheme === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return true; // default if SSR
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = "#000000";
      document.body.style.color = "#ffffff";
    } else {
      document.documentElement.classList.remove("dark");
      document.body.style.backgroundColor = "#ffffff";
      document.body.style.color = "#000000";
    }
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const value = { isDark, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export default ThemeContext;
