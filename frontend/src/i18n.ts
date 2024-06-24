import { GetLanguage } from "wailsjs/go/main/App";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpApi from "i18next-http-backend";

const initializeI18n = async () => {
  const language = (await GetLanguage()) || "en";

  i18n
    .use(HttpApi)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      lng: language,
      supportedLngs: ["en", "tr"], // Add supported languages here
      fallbackLng: "en",
      debug: true,
      interpolation: {
        escapeValue: false, // React already safes from XSS
      },
      backend: {
        loadPath: "/locales/{{lng}}.json", // Path to translation files
      },
    });

  return i18n;
};

export default initializeI18n;
