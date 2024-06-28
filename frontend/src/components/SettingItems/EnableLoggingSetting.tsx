import {
  SettingsItem,
  SettingContent,
  SettingDescription,
  SettingLabel,
} from "../ui/settings-group";
import { Switch } from "../ui/switch";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { GetConfigField, SetConfigField } from "@/lib/config";
import { useStorage } from "@/contexts/storage-provider";
import { useRestart } from "@/contexts/restart-provider";

export function EnableLoggingSetting() {
  const { t } = useTranslation();
  const { getValue, setValue } = useStorage();
  const { addRestartRequired, removeRestartRequired } = useRestart();

  const [isLoading, setIsLoading] = useState(true);
  const [enableLogging, setEnableLogging] = useState(false);

  useEffect(() => {
    GetConfigField("EnableLogging").then((value) => {
      setEnableLogging(value === "true");
      if (getValue("initialEnableLogging") === undefined) {
        setValue("initialEnableLogging", value);
      }
      setIsLoading(false);
    });
  }, []);

  return (
    <SettingsItem loading={isLoading}>
      <div>
        <SettingLabel>{t("settings.setting.logging.label")}</SettingLabel>
        <SettingDescription>
          {t("settings.setting.logging.description") +
            " (" +
            t("settings.restart_the_app_for_changes_to_take_effect") +
            ")"}
        </SettingDescription>
      </div>
      <SettingContent>
        <Switch
          checked={enableLogging}
          onCheckedChange={() => {
            SetConfigField("EnableLogging", String(!enableLogging)).then(() => {
              setEnableLogging(!enableLogging);
              if (String(enableLogging) === getValue("initialEnableLogging")) {
                addRestartRequired("EnableLogging");
              } else {
                removeRestartRequired("EnableLogging");
              }
            });
          }}
        />
      </SettingContent>
    </SettingsItem>
  );
}
