import { useTranslation } from "react-i18next";
import { SwitchConfig } from "./Presets/SwitchConfig";

export function RenameMatchedFilesSetting() {
  const { t } = useTranslation();

  return (
    <SwitchConfig
      configKey="renameMatchedFiles"
      label={t("settings.setting.rename_matched_files.label")}
      description={t("settings.setting.rename_matched_files.description")}
    />
  );
}
