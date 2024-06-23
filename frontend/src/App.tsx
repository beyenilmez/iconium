import { ThemeProvider } from "./contexts/theme-provider";
import ModeToggle from "@/components/ModeToggle";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <ModeToggle />
    </ThemeProvider>
  );
}

export default App;
