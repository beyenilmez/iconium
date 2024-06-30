import { SetConfigField, GetConfigField } from "@/lib/config";
import {
  SettingsItem,
  SettingContent,
  SettingDescription,
  SettingLabel,
} from "../ui/settings-group";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Combobox } from "../ui/combobox";
import locales from "@/locales.json";

export function LocaleSetting() {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState("en-US");

  useEffect(() => {
    GetConfigField("Language").then((value) => {
      setLanguage(value);
      setIsLoading(false);
    });
  }, []);

  const handleLanguageChange = (value: string) => {
    SetConfigField("Language", value).then(() => {
      setLanguage(value);
      i18n.changeLanguage(value);
    });
  };

  return (
    <SettingsItem loading={isLoading}>
      <div>
        <SettingLabel>{t("settings.setting.language.label")}</SettingLabel>
        <SettingDescription>
          {t("settings.setting.language.description")}
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
          placeholder={t("settings.setting.language.select_language")}
          searchPlaceholder={t("settings.setting.language.search_language")}
          nothingFoundMessage={t(
            "settings.setting.language.no_languages_found"
          )}
          onChange={(value) => handleLanguageChange(value)}
        />
      </SettingContent>
    </SettingsItem>
  );
}
