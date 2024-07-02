import {
  SettingsItem,
  SettingContent,
  SettingDescription,
  SettingLabel,
} from "../ui/settings-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useConfig } from "@/contexts/config-provider";

type LogLevels = {
  enableTrace: boolean;
  enableDebug: boolean;
  enableInfo: boolean;
  enableWarn: boolean;
  enableError: boolean;
  enableFatal: boolean;
};

export function LogLevelSetting() {
  const { config, setConfigField } = useConfig();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [logLevels, setLogLevels] = useState<LogLevels>({
    enableTrace: false,
    enableDebug: false,
    enableInfo: false,
    enableWarn: false,
    enableError: false,
    enableFatal: false,
  });

  useEffect(() => {
    if (
      config &&
      config.enableTrace !== undefined &&
      config.enableDebug !== undefined &&
      config.enableInfo !== undefined &&
      config.enableWarn !== undefined &&
      config.enableError !== undefined &&
      config.enableFatal !== undefined &&
      isLoading
    ) {
      setLogLevels({
        enableTrace: config.enableTrace,
        enableDebug: config.enableDebug,
        enableInfo: config.enableInfo,
        enableWarn: config.enableWarn,
        enableError: config.enableError,
        enableFatal: config.enableFatal,
      });

      setIsLoading(false);
    }
  }, [
    config?.enableTrace,
    config?.enableDebug,
    config?.enableInfo,
    config?.enableWarn,
    config?.enableError,
    config?.enableFatal,
  ]);

  const handleToggle = (level: keyof LogLevels) => {
    setConfigField(level, !logLevels[level]);

    setLogLevels({
      ...logLevels,
      [level]: !logLevels[level],
    });
  };

  return (
    <SettingsItem
      loading={isLoading}
      configKey={[
        "enableTrace",
        "enableDebug",
        "enableInfo",
        "enableWarn",
        "enableError",
        "enableFatal",
      ]}
    >
      <div>
        <SettingLabel>{t("settings.setting.log_levels.label")}</SettingLabel>
        <SettingDescription>
          {t("settings.setting.log_levels.description")}
        </SettingDescription>
      </div>
      <SettingContent>
        <ToggleGroup
          type="multiple"
          value={Object.entries(logLevels)
            .filter(([, value]) => value)
            .map(([key]) => key)}
        >
          {Object.entries(logLevels).map(([level, _]) => (
            <ToggleGroupItem
              key={level}
              value={level}
              aria-label={level}
              onClick={() => handleToggle(level as keyof LogLevels)}
            >
              {level.replace("enable", "")}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </SettingContent>
    </SettingsItem>
  );
}
