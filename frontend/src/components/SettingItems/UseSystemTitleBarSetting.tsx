import { SwitchConfig } from "./Presets/SwitchConfig";
import { useTranslation } from "react-i18next";

export function UseSystemTitleBarSetting() {
  const { t } = useTranslation();

  return (
    <SwitchConfig
      configValue="UseSystemTitleBar"
      label={t("settings.setting.use_system_title_bar.label")}
      description={t("settings.setting.use_system_title_bar.description")}
      requiresRestart={true}
    />
  );
}
