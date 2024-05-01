import { ThemeProvider } from "./contexts/theme-provider";
import { ProfileProvider } from "./contexts/profile-provider";
import TopBar from "./components/TopBar";
import { FileGrid } from "./components/FileGrid";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ProfileProvider>
        <TopBar />
        <FileGrid />
      </ProfileProvider>
    </ThemeProvider>
  );
}

export default App;
