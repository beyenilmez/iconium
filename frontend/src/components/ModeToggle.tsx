import { Log } from "wailsjs/go/main/App";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/theme-provider";

export default function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        const themeToSet = theme === "light" ? "dark" : "light";
        setTheme(themeToSet);
        Log("Setted theme to " + themeToSet, 1);
      }}
      className="bg-transparent hover:bg-transparent duration-0"
    >
      <Sun className="transition-all scale-100 dark:scale-0 duration-300 rotate-0 dark:rotate-90" />
      <Moon className="absolute transition-all scale-0 dark:scale-100 duration-300 -rotate-90 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
