import {
  SettingsItem,
  SettingContent,
  SettingDescription,
  SettingLabel,
} from "../ui/settings-group";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "../ui/input";
import { GetConfigField, SetConfigField } from "@/lib/config";
import { useStorage } from "@/contexts/storage-provider";

export function MaxLogFilesSetting() {
  const { t } = useTranslation();
  const { getValue, setValue } = useStorage();

  const [isLoading, setIsLoading] = useState(true);
  const [maxLogFiles, setMaxLogFiles] = useState(-1);

  useEffect(() => {
    GetConfigField("MaxLogFiles").then((value) => {
      setMaxLogFiles(parseInt(value));
      if (getValue("initialMaxLogFiles") === undefined) {
        setValue("initialMaxLogFiles", value);
      }
      setIsLoading(false);
    });
  }, []);

  return (
    <SettingsItem
      loading={isLoading}
      name="MaxLogFiles"
      initialValue={getValue("initialMaxLogFiles")}
      value={isNaN(maxLogFiles) ? "20" : String(maxLogFiles)}
    >
      <div>
        <SettingLabel>{t("settings.setting.max_log_files.label")}</SettingLabel>
        <SettingDescription>
          {t("settings.setting.max_log_files.description") +
            " (" +
            t("settings.restart_the_app_for_changes_to_take_effect") +
            ")"}
        </SettingDescription>
      </div>
      <SettingContent>
        <Input
          type="number"
          placeholder="20"
          value={maxLogFiles}
          onChange={(e) => {
            const value = Math.max(
              1,
              Math.min(10000, parseInt(e.target.value))
            );
            const targetValue = isNaN(parseInt(e.target.value)) ? 20 : value;
            SetConfigField("MaxLogFiles", String(targetValue)).then(() => {
              setMaxLogFiles(value);
            });
          }}
          min={1}
          max={10000}
        />
      </SettingContent>
    </SettingsItem>
  );
}
