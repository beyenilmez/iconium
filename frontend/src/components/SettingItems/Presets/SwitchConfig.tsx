import {
  SettingsItem,
  SettingContent,
  SettingDescription,
  SettingLabel,
} from "@/components/ui/settings-group";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { GetConfigField, SetConfigField } from "@/lib/config";
import { useStorage } from "@/contexts/storage-provider";
import { useTranslation } from "react-i18next";

interface SwitchConfigProps {
  configValue: string;
  label: string;
  description?: string;
  requiresRestart?: boolean;
}

export function SwitchConfig({
  configValue,
  label,
  description,
  requiresRestart,
}: SwitchConfigProps) {
  const { t } = useTranslation();
  const { getValue, setValueIfUndefined } = useStorage();
  const [isLoading, setIsLoading] = useState(true);
  const [switchValue, setSwitchValue] = useState(false);

  useEffect(() => {
    GetConfigField(configValue).then((value) => {
      setSwitchValue(value === "true");
      if (requiresRestart) setValueIfUndefined(`initial${configValue}`, value);

      setIsLoading(false);
    });
  }, []);

  const handleSwitch = (value: boolean) => {
    SetConfigField(configValue, String(value)).then(() => {
      setSwitchValue(value);
    });
  };

  return (
    <SettingsItem
      loading={isLoading}
      name={configValue}
      initialValue={getValue(`initial${configValue}`)}
      value={String(switchValue)}
    >
      <div>
        <SettingLabel>{label}</SettingLabel>
        {description && <SettingDescription>{description + (requiresRestart ? " (" + t("settings.restart_the_app_for_changes_to_take_effect") + ")" : "")}</SettingDescription>}
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
