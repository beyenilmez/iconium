import { GetConfigField, SetConfigField } from "wailsjs/go/main/App";
import {
  SettingsGroup,
  SettingsItem,
  SettingContent,
  SettingDescription,
  SettingLabel,
} from "../ui/settings-group";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export function AppSettings() {
  const { t } = useTranslation();

  const [useSystemTitleBar, setUseSystemTitleBar] = useState(false);

  useEffect(() => {
    GetConfigField("UseSystemTitleBar").then((value) => {
      setUseSystemTitleBar(value === "true");
    });
  }, []);

  return (
    <SettingsGroup className="flex flex-col items-start px-4 py-2 w-full h-full">
      <SettingsItem>
        <div>
          <SettingLabel>
            {t("settings.application.use_system_title_bar.label")}
          </SettingLabel>
          <SettingDescription>
            {t("settings.application.use_system_title_bar.description") +
              " (" +
              t("settings.restart_the_app_for_changes_to_take_effect") +
              ")"}
          </SettingDescription>
        </div>
        <SettingContent>
          <Switch
            checked={useSystemTitleBar}
            onCheckedChange={(value) => {
              SetConfigField("UseSystemTitleBar", String(value)).then(() => {
                setUseSystemTitleBar(value);
              });
            }}
          />
        </SettingContent>
      </SettingsItem>
    </SettingsGroup>
  );
}
