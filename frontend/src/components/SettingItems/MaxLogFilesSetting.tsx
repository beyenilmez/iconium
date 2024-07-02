import {
  SettingsItem,
  SettingContent,
  SettingDescription,
  SettingLabel,
} from "../ui/settings-group";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "../ui/input";
import { useConfig } from "@/contexts/config-provider";

export function MaxLogFilesSetting() {
  const { config, setConfigField } = useConfig();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [maxLogFiles, setMaxLogFiles] = useState("");

  useEffect(() => {
    if (config && config.maxLogFiles !== undefined && isLoading) {
      setMaxLogFiles(config.maxLogFiles.toString());

      setIsLoading(false);
    }
  }, [config?.maxLogFiles]);

  const handleMaxLogFilesChange = (textValue: string) => {
    const value = Math.max(1, Math.min(10000, parseInt(textValue)));
    const targetValue = isNaN(parseInt(textValue)) ? 20 : value;

    setConfigField("maxLogFiles", targetValue);
    if (textValue === "") setMaxLogFiles("");
    else setMaxLogFiles(value.toString());
  };

  return (
    <SettingsItem loading={isLoading} configKey="maxLogFiles">
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
          onChange={(e) => handleMaxLogFilesChange(e.target.value)}
          min={1}
          max={10000}
        />
      </SettingContent>
    </SettingsItem>
  );
}
