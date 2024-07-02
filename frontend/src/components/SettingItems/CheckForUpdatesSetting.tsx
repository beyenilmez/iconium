import { SwitchConfig } from "./Presets/SwitchConfig";
import { useTranslation } from "react-i18next";

export function CheckForUpdatesSetting() {
  const { t } = useTranslation();

  return (
    <SwitchConfig
      configKey="checkForUpdates"
      label={t("settings.setting.check_for_updates.label")}
      description={t("settings.setting.check_for_updates.description")}
    />
  );
}
