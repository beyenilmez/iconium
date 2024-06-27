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
import {ThemeSetting} from "../SettingItems/ThemeSetting";

export function GeneralSettings() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const [isLoading, setIsLoading] = useState(true);

  const [language, setLanguage] = useState("en-US");

  useEffect(() => {
    Promise.all([GetConfigField("Language")])
      .then(([value]) => {
        setLanguage(value);

        setIsLoading(false); // Mark loading as complete
      })
      .catch((error) => {
        console.error("Error fetching configuration:", error);
        setIsLoading(false); // Handle loading error
      });
  }, []);

  return (
    <SettingsGroup className="flex flex-col items-start px-4 py-2 w-full h-full">
      <SettingsItem loading={isLoading}>
        <div>
          <SettingLabel>{t("settings.general.language.label")}</SettingLabel>
          <SettingDescription>
            {t("settings.general.language.description")}
          </SettingDescription>
        </div>
        <SettingContent>
          <Combobox
            initialValue={language}
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
            onChange={(value) => {
              SetConfigField("Language", value);
              changeLanguage(value);
            }}
          />
        </SettingContent>
      </SettingsItem>

      <ThemeSetting />
    </SettingsGroup>
  );
}
