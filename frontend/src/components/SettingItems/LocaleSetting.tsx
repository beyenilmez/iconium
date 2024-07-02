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
import { useConfig } from "@/contexts/config-provider";

export function LocaleSetting() {
  const { config, setConfigField } = useConfig();
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState("en-US");

  useEffect(() => {
    if (config && config.language !== undefined && isLoading) {
      setLanguage(config.language);
      setIsLoading(false);
    }
  }, [config?.language]);

  const handleLanguageChange = (value: string) => {
    setConfigField("language", value);
    i18n.changeLanguage(value);
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
