import { GetLanguage, SetLanguage } from "wailsjs/go/main/App";
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

export function GeneralSettings() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const [language, setLanguage] = useState("en");

  useEffect(() => {
    GetLanguage().then((value) => {
      setLanguage(value);
    });
  }, []);

  useEffect(() => {
    SetLanguage(language);
    changeLanguage(language);
  }, [language]);

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
    </SettingsGroup>
  );
}
