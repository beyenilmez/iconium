import {
  SettingsItem,
  SettingContent,
  SettingDescription,
  SettingLabel,
} from "@/components/ui/settings-group";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useConfig } from "@/contexts/config-provider";
import { main } from "wailsjs/go/models";

interface SwitchConfigProps {
  configKey: keyof main.Config;
  label: string;
  description?: string;
  requiresRestart?: boolean;
}

export function SwitchConfig({
  configKey,
  label,
  description,
  requiresRestart,
}: SwitchConfigProps) {
  const { config, setConfigField } = useConfig();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [switchValue, setSwitchValue] = useState(false);

  useEffect(() => {
    if (config && config[configKey] !== undefined && isLoading) {
      const value = config[configKey] as boolean;
      setSwitchValue(value);

      setIsLoading(false);
    }
  }, [config]);

  const handleSwitch = (value: boolean) => {
    setConfigField(configKey, value);
    setSwitchValue(value);
  };

  return (
    <SettingsItem
      loading={isLoading}
      configKey={requiresRestart ? configKey : undefined}
    >
      <div>
        <SettingLabel>{label}</SettingLabel>
        {description && (
          <SettingDescription>
            {description +
              (requiresRestart
                ? " (" +
                  t("settings.restart_the_app_for_changes_to_take_effect") +
                  ")"
                : "")}
          </SettingDescription>
        )}
      </div>
      <SettingContent>
        <Switch
          checked={switchValue}
          onCheckedChange={() => handleSwitch(!switchValue)}
        />
      </SettingContent>
    </SettingsItem>
  );
}
