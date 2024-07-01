import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import initializeI18n from "./i18n";

const startApp = async () => {
  await initializeI18n();
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    //<React.StrictMode>
    <App />
    //</React.StrictMode>
  );
};

startApp();
