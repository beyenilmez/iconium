import React, { createContext, useContext, useEffect, useState } from "react";
import { useConfig } from "./config-provider";
import colorSchemes from "@/colorSchemes.json";

export type ColorScheme = "default" | "midnightAsh" | "dawnMist" | "forestDawn"; // Add other color schemes here

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
    for (let i = 0; i < colorSchemes.colorSchemes.length; i++) {
      root.classList.remove(colorSchemes.colorSchemes[i].code);
    }

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
