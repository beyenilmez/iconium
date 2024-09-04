import { useTranslation } from "react-i18next";
import { SwitchConfig } from "./Presets/SwitchConfig";

export function MatchURLByDestinationSetting() {
  const { t } = useTranslation();

  return (
    <SwitchConfig
      configKey="matchURLByDestination"
      label={t("settings.setting.match_url_by_destination.label")}
      description={t("settings.setting.match_url_by_destination.description")}
    />
  );
}
