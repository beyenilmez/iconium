import { GetLanguage } from "wailsjs/go/main/App";
import {
  SettingsGroup,
  SettingsItem,
  SettingContent,
  SettingDescription,
  SettingLabel,
} from "../ui/settings-group";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export function GeneralSettings() {
  const { t } = useTranslation();


  const [_, setLanguage] = useState("en");

  useEffect(() => {
    GetLanguage().then((value) => {
      setLanguage(value);
    });
  }, []);

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
          TODO
        </SettingContent>
      </SettingsItem>
    </SettingsGroup>
  );
}
