import { GetConfigField, SetConfigField } from "@/lib/config";
import {
  SettingsItem,
  SettingContent,
  SettingDescription,
  SettingLabel,
} from "../ui/settings-group";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export function UseSystemTitleBarSetting() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [useSystemTitleBar, setUseSystemTitleBar] = useState(false);

  useEffect(() => {
    GetConfigField("UseSystemTitleBar").then((value) => {
      setUseSystemTitleBar(value === "true");
      setIsLoading(false);
    });
  }, []);

  return (
    <SettingsItem loading={isLoading}>
      <div>
        <SettingLabel>
          {t("settings.setting.use_system_title_bar.label")}
        </SettingLabel>
        <SettingDescription>
          {t("settings.setting.use_system_title_bar.description") +
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
  );
}
