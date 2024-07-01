import {
  GetLoadConfigPath,
  ReadConfig,
  RestartApplication,
  SaveConfigDialog,
} from "wailsjs/go/main/App";
import {
  SettingsItem,
  SettingContent,
  SettingDescription,
  SettingLabel,
} from "../ui/settings-group";
import { Button } from "../ui/button";
import { AreYouSureDialog, AreYouSureDialogRef } from "../ui/are-you-sure";
import { useRef, useState } from "react";
import { LogDebug } from "wailsjs/runtime/runtime";
import { useTranslation } from "react-i18next";

export function ImportExportSetting() {
  const { t } = useTranslation();
  const dialogRef = useRef<AreYouSureDialogRef>(null);
  const [usePath, setUsePath] = useState("");

  const handleImportButtonClick = () => {
    GetLoadConfigPath().then((path) => {
      if (path !== "") {
        setUsePath(path);
        dialogRef.current?.openDialog();
      }
    });
  };

  const handleAcceptImport = () => {
    LogDebug("Attempting to read config from " + usePath);
    ReadConfig(usePath).then(() => {
      RestartApplication(false, []);
    });
  };

  return (
    <SettingsItem>
      <div>
        <SettingLabel>{t("settings.setting.import_export.label")}</SettingLabel>
        <SettingDescription>
          {t("settings.setting.import_export.description")}
        </SettingDescription>
      </div>
      <SettingContent>
        <div className="flex gap-0.5">
          <Button onClick={handleImportButtonClick}>{t("import")}</Button>
          <AreYouSureDialog
            ref={dialogRef}
            onAccept={handleAcceptImport}
            title={t("settings.are_you_sure_you_want_to_import_this_config")}
            description={t(
              "settings.the_app_will_restart_to_load_the_new_config"
            )}
            cancelText={t("cancel")}
            acceptText={t("yes")}
          />

          <Button onClick={SaveConfigDialog}>{t("export")}</Button>
        </div>
      </SettingContent>
    </SettingsItem>
  );
}
