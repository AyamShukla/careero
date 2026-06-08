import { useState, useEffect } from "react";

const useTheme = () => {
  const [theme, setTheme] = useState(
    localStorage.getItem("careero-theme") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("careero-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return { theme, toggleTheme };
};

export default useTheme;