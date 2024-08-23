import { useTranslation } from "react-i18next";
import { SwitchConfig } from "./Presets/SwitchConfig";

export function MatchLnkByDestinationSetting() {
  const { t } = useTranslation();

  return (
    <SwitchConfig
      configKey="matchLnkByDestination"
      label={t("settings.setting.match_by_destination.label")}
      description={t("settings.setting.match_by_destination.description")}
    />
  );
}
