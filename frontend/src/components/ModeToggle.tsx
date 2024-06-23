import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/theme-provider";

export default function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="w-5 h-5 transition-all scale-100 dark:scale-0" />
      <Moon className="absolute w-5 h-5 transition-all scale-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
