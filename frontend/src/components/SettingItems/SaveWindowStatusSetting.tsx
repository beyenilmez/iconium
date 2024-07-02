import { SwitchConfig } from "./Presets/SwitchConfig";
import { useTranslation } from "react-i18next";

export function SaveWindowStatusSetting() {
  const { t } = useTranslation();

  return (
    <SwitchConfig
      configKey="saveWindowStatus"
      label={t("settings.setting.save_window_status.label")}
      description={t("settings.setting.save_window_status.description")}
    />
  );
}
