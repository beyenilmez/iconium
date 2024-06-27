import { SetTheme } from "wailsjs/go/main/App";
import { LogError, LogInfo, LogWarning } from "wailsjs/runtime/runtime";
import { createContext, useContext, useEffect, useState } from "react";
import { GetConfigField, SetConfigField } from "@/lib/config";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const storedTheme = await GetConfigField("Theme");
        if (storedTheme) {
          setThemeState(storedTheme as Theme);
        }
      } catch (error) {
        LogWarning("Failed to fetch theme");
      }
    };

    fetchTheme();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: async (theme: Theme) => {
      try {
        await SetConfigField("Theme", theme);
        setThemeState(theme);
        SetTheme(theme);
        LogInfo(`Setted theme to ${theme}`);
      } catch (error) {
        LogError("Failed to set theme");
      }
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
