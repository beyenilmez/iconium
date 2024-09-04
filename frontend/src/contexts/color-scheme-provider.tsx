import React, { createContext, useContext, useEffect, useState } from "react";
import { useConfig } from "./config-provider";

export type ColorScheme = "default" | "midnightAsh" | "dawnMist"; // Add other color schemes here

type ColorSchemeProviderProps = {
  children: React.ReactNode;
  defaultColorScheme?: ColorScheme;
};

type ColorSchemeProviderState = {
  colorScheme: ColorScheme;
  setColorScheme: (colorScheme: ColorScheme) => Promise<void>;
};

const initialState: ColorSchemeProviderState = {
  colorScheme: "default", // Default color scheme
  setColorScheme: async () => {},
};

const ColorSchemeContext =
  createContext<ColorSchemeProviderState>(initialState);

export function ColorSchemeProvider({
  children,
  defaultColorScheme = "default",
  ...props
}: ColorSchemeProviderProps) {
  const { config, setConfigField } = useConfig();
  const [colorScheme, setColorSchemeState] =
    useState<ColorScheme>(defaultColorScheme);

  useEffect(() => {
    if (config) {
      setColorSchemeState(config.colorScheme as ColorScheme);
    }
  }, [config?.colorScheme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("default", "midnightAsh", "dawnMist"); // Remove existing color scheme classes
    root.classList.add(colorScheme);
  }, [colorScheme]);

  const setColorScheme = async (newColorScheme: ColorScheme) => {
    try {
      await setConfigField("colorScheme", newColorScheme);
      setColorSchemeState(newColorScheme);
      console.log(`Set color scheme to ${newColorScheme}`);
    } catch (error) {
      console.error("Failed to set color scheme");
    }
  };

  const value = {
    colorScheme,
    setColorScheme,
  };

  return (
    <ColorSchemeContext.Provider {...props} value={value}>
      {children}
    </ColorSchemeContext.Provider>
  );
}

export const useColorScheme = () => {
  const context = useContext(ColorSchemeContext);

  if (context === undefined) {
    throw new Error("useColorScheme must be used within a ColorSchemeProvider");
  }

  return context;
};
