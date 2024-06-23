import { ThemeProvider } from "./contexts/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <h1>Vite + React + TS + Tailwind + shadcn/ui</h1>
    </ThemeProvider>
  );
}

export default App;
