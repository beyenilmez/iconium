import { SetConfigField, GetConfigField } from "wailsjs/go/main/App";
import {
  SettingsGroup,
  SettingsItem,
  SettingContent,
  SettingDescription,
  SettingLabel,
} from "../ui/settings-group";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Combobox } from "../ui/combobox";
import locales from "@/locales.json";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/theme-provider";

export function GeneralSettings() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const [language, setLanguage] = useState("en");
  const [langIsSet, setLangIsSet] = useState(false);

  useEffect(() => {
    GetConfigField("language").then((value) => {
      setLanguage(value);
      setLangIsSet(true);
    });
  }, []);

  useEffect(() => {
    if (langIsSet) {
      SetConfigField("language", language);
      changeLanguage(language);
    }
  }, [language]);

  const { theme, setTheme } = useTheme();

  return (
    <SettingsGroup className="flex flex-col items-start px-4 py-2 w-full h-full">
      <SettingsItem>
        <div>
          <SettingLabel>{t("settings.general.language.label")}</SettingLabel>
          <SettingDescription>
            {t("settings.general.language.description")}
          </SettingDescription>
        </div>
        <SettingContent>
          <Combobox
            value={language}
            setValue={setLanguage}
            mandatory={true}
            elements={locales.locales.map((language) => ({
              value: language.code,
              label: language.name,
            }))}
            placeholder={t("settings.general.language.select_language")}
            searchPlaceholder={t("settings.general.language.search_language")}
            nothingFoundMessage={t(
              "settings.general.language.no_languages_found"
            )}
          />
        </SettingContent>
      </SettingsItem>

      <SettingsItem>
        <div>
          <SettingLabel>{t("settings.application.theme.label")}</SettingLabel>
          <SettingDescription>
            {t("settings.application.theme.description")}
          </SettingDescription>
        </div>
        <SettingContent>
          <ToggleGroup type="single" value={theme}>
            <ToggleGroupItem
              value="system"
              aria-label="Use system theme"
              onClick={() => setTheme("system")}
            >
              <Monitor className="w-4 h-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="light"
              aria-label="Use light theme"
              onClick={() => setTheme("light")}
            >
              <Sun className="w-4 h-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="dark"
              aria-label="Use dark theme"
              onClick={() => setTheme("dark")}
            >
              <Moon className="w-4 h-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </SettingContent>
      </SettingsItem>
    </SettingsGroup>
  );
}
