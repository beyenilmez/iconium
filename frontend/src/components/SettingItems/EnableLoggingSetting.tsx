import { SwitchConfig } from "./Presets/SwitchConfig";
import { useTranslation } from "react-i18next";

export function EnableLoggingSetting() {
  const { t } = useTranslation();

  return (
    <SwitchConfig
      configValue="EnableLogging"
      label={t("settings.setting.logging.label")}
      description={t("settings.setting.logging.description")}
      requiresRestart={true}
    />
  );
}
