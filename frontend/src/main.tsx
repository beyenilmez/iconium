import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import initializeI18n from "./i18n";
import { RestartProvider } from "./contexts/restart-provider.tsx";
import { ThemeProvider } from "./contexts/theme-provider.tsx";
import { StorageProvider } from "./contexts/storage-provider.tsx";

const startApp = async () => {
  await initializeI18n();
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    //<React.StrictMode>
    <RestartProvider>
      <ThemeProvider defaultTheme="system">
        <StorageProvider>
          <App />
        </StorageProvider>
      </ThemeProvider>
    </RestartProvider>
    //</React.StrictMode>
  );
};

startApp();
