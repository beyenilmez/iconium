import {
  SettingsItem,
  SettingContent,
  SettingDescription,
  SettingLabel,
} from "../ui/settings-group";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { useConfig } from "@/contexts/config-provider";

export function WindowEffectSetting() {
  const { config, initialConfig, setConfigField } = useConfig();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [useWindowEffect, setUseWindowEffect] = useState("");

  useEffect(() => {
    if (config && config.windowEffect !== undefined && isLoading) {
      setUseWindowEffect(config.windowEffect.toString());

      setIsLoading(false);
    }
  }, [config?.windowEffect]);

  const handleToggle = (number: number) => {
    setConfigField("windowEffect", number);
    setUseWindowEffect(number.toString());
  };

  const windowEffectOptions = [
    {
      value: "1",
      number: 1,
      label: t("settings.setting.window_effect.none"),
      aria: "No window effect",
    },
    {
      value: "0",
      number: 0,
      label: t("settings.setting.window_effect.auto"),
      aria: "Auto window effect",
    },
    {
      value: "2",
      number: 2,
      label: t("settings.setting.window_effect.mica"),
      aria: "Mica window effect",
    },
    {
      value: "3",
      number: 3,
      label: t("settings.setting.window_effect.acrylic"),
      aria: "Acrylic window effect",
    },
    {
      value: "4",
      number: 4,
      label: t("settings.setting.window_effect.tabbed"),
      aria: "Tabbed window effect",
    },
  ];

  return (
    <SettingsItem loading={isLoading} configKey="windowEffect" requiresRestart>
      <div>
        <SettingLabel>{t("settings.setting.window_effect.label")}</SettingLabel>
        <SettingDescription>
          {`${t("settings.setting.window_effect.description")} (${t(
            "settings.restart_the_app_for_changes_to_take_effect"
          )})`}
        </SettingDescription>
      </div>
      <SettingContent>
        <ToggleGroup type="single" value={useWindowEffect}>
          {windowEffectOptions.map(({ value, number, label, aria }) => (
            <ToggleGroupItem
              key={value}
              value={value}
              aria-label={aria}
              onClick={() => handleToggle(number)}
              className={
                number === initialConfig?.windowEffect
                  ? "font-bold text-shadow-xl shadow-foreground"
                  : ""
              }
            >
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </SettingContent>
    </SettingsItem>
  );
}
