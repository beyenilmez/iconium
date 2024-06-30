import { GetConfigField, SetConfigField } from "@/lib/config";
import {
  SettingsItem,
  SettingContent,
  SettingDescription,
  SettingLabel,
} from "../ui/settings-group";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { useStorage } from "@/contexts/storage-provider";

export function WindowEffectSetting() {
  const { t } = useTranslation();
  const { getValue, setValueIfUndefined } = useStorage();
  const [isLoading, setIsLoading] = useState(true);
  const [useWindowEffect, setUseWindowEffect] = useState("");

  useEffect(() => {
    GetConfigField("WindowEffect").then((windowEffectValue) => {
      setUseWindowEffect(windowEffectValue);
      setValueIfUndefined("initialWindowEffect", windowEffectValue);
      
      setIsLoading(false);
    });
  }, []);

  const handleToggle = (value: string) => {
    SetConfigField("WindowEffect", value).then(() => {
      setUseWindowEffect(value);
    });
  };

  const windowEffectOptions = [
    { value: "1", label: t("settings.setting.window_effect.none"), aria: "No window effect" },
    { value: "0", label: t("settings.setting.window_effect.auto"), aria: "Auto window effect" },
    { value: "2", label: t("settings.setting.window_effect.mica"), aria: "Mica window effect" },
    { value: "3", label: t("settings.setting.window_effect.acrylic"), aria: "Acrylic window effect" },
    { value: "4", label: t("settings.setting.window_effect.tabbed"), aria: "Tabbed window effect" }
  ];

  return (
    <SettingsItem
      loading={isLoading}
      name="WindowEffect"
      initialValue={getValue("initialWindowEffect")}
      value={useWindowEffect}
    >
      <div>
        <SettingLabel>{t("settings.setting.window_effect.label")}</SettingLabel>
        <SettingDescription>
          {`${t("settings.setting.window_effect.description")} (${t("settings.restart_the_app_for_changes_to_take_effect")})`}
        </SettingDescription>
      </div>
      <SettingContent>
        <ToggleGroup type="single" value={useWindowEffect}>
          {windowEffectOptions.map(({ value, label, aria }) => (
            <ToggleGroupItem
              key={value}
              value={value}
              aria-label={aria}
              onClick={() => handleToggle(value)}
              className={value === getValue("initialWindowEffect") ? "font-bold text-shadow-xl shadow-foreground" : ""}
            >
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </SettingContent>
    </SettingsItem>
  );
}
