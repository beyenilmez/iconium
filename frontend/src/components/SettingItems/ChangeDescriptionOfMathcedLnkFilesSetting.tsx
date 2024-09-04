import { useTranslation } from "react-i18next";
import { SwitchConfig } from "./Presets/SwitchConfig";

export function ChangeDescriptionOfMathcedLnkFilesSetting() {
  const { t } = useTranslation();

  return (
    <SwitchConfig
      configKey="changeDescriptionOfMathcedLnkFiles"
      label={t(
        "settings.setting.change_description_of_matched_lnk_files.label"
      )}
      description={t(
        "settings.setting.change_description_of_matched_lnk_files.description"
      )}
    />
  );
}
