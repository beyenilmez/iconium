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
import { useStorage } from "@/contexts/storage-provider";

export function UseSystemTitleBarSetting() {
  const { t } = useTranslation();
  const { getValue, setValueIfUndefined } = useStorage();

  const [isLoading, setIsLoading] = useState(true);
  const [useSystemTitleBar, setUseSystemTitleBar] = useState(false);

  useEffect(() => {
    GetConfigField("UseSystemTitleBar").then((value) => {
      setUseSystemTitleBar(value === "true");
      setValueIfUndefined("initialUseSystemTitleBar", value);
      setIsLoading(false);
    });
  }, []);

  return (
    <SettingsItem
      loading={isLoading}
      name="UseSystemTitleBar"
      initialValue={getValue("initialUseSystemTitleBar")}
      value={String(useSystemTitleBar)}
    >
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
