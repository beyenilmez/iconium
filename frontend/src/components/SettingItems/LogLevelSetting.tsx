import {
  SettingsItem,
  SettingContent,
  SettingDescription,
  SettingLabel,
} from "../ui/settings-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { GetConfigField, SetConfigField } from "@/lib/config";
import { useStorage } from "@/contexts/storage-provider";

type LogLevels = {
  trace: boolean;
  debug: boolean;
  info: boolean;
  warn: boolean;
  error: boolean;
  fatal: boolean;
};

export function LogLevelSetting() {
  const { t } = useTranslation();
  const { getValue, setValueIfUndefined } = useStorage();
  const [isLoading, setIsLoading] = useState(true);
  const [logLevels, setLogLevels] = useState<LogLevels>({
    trace: false,
    debug: false,
    info: false,
    warn: false,
    error: false,
    fatal: false,
  });

  useEffect(() => {
    const fields = [
      "EnableTrace",
      "EnableDebug",
      "EnableInfo",
      "EnableWarn",
      "EnableError",
      "EnableFatal",
    ];
    Promise.all(fields.map(GetConfigField)).then((values) => {
      const newLogLevels: LogLevels = {
        trace: values[0] === "true",
        debug: values[1] === "true",
        info: values[2] === "true",
        warn: values[3] === "true",
        error: values[4] === "true",
        fatal: values[5] === "true",
      };
      setLogLevels(newLogLevels);
      setValueIfUndefined(
        "initialLogLevels",
        Object.values(newLogLevels).join("")
      );

      setIsLoading(false);
    });
  }, []);

  const handleToggle = (level: keyof LogLevels) => {
    SetConfigField(
      `Enable${level.charAt(0).toUpperCase() + level.slice(1)}`,
      String(!logLevels[level])
    ).then(() => {
      setLogLevels({ ...logLevels, [level]: !logLevels[level] });
    });
  };

  return (
    <SettingsItem
      loading={isLoading}
      name="LogLevels"
      initialValue={getValue("initialLogLevels")}
      value={Object.values(logLevels).join("")}
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
              aria-label={`Enable ${level} logging`}
              onClick={() => handleToggle(level as keyof LogLevels)}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </SettingContent>
    </SettingsItem>
  );
}
