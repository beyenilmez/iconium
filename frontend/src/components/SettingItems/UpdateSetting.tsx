import { useEffect, useState } from "react";
import { CheckForUpdate, Update, UpdateAsAdmin } from "@/wailsjs/go/main/App";
import { main } from "@/wailsjs/go/models";
import { Button } from "@/components/ui/button";
import {
  SettingContent,
  SettingDescription,
  SettingLabel,
  SettingsItem,
} from "@/components/ui/settings-group";
import { ArrowRight, RefreshCw } from "lucide-react";
import { GetConfigField, NeedsAdminPrivileges } from "@/wailsjs/go/main/App";
import { useTranslation } from "react-i18next";
import { useStorage } from "@/contexts/storage-provider";

export function UpdateSetting() {
  const { t } = useTranslation();
  const { getValue } = useStorage();

  const [updateInfo, setUpdateInfo] = useState<main.UpdateInfo>(
    main.UpdateInfo.createFrom({})
  );

  const [lastUpdateCheck, setLastUpdateCheck] = useState(0);
  const [needsAdmin, setNeedsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Initial check for admin privileges and update availability
    NeedsAdminPrivileges().then(setNeedsAdmin);
    handleCheckForUpdate();
  }, []);

  useEffect(() => {
    // Update last update check timestamp from config
    GetConfigField("LastUpdateCheck").then((value) =>
      setLastUpdateCheck(value as number)
    );
  }, [updateInfo]);

  useEffect(() => {
    // Automatic update trigger from argument
    const storedUpdate = getValue("update");
    if (storedUpdate && !isChecking && !isUpdating) {
      setIsUpdating(true);
      Update(storedUpdate).finally(() => setIsUpdating(false));
    }
  }, [getValue]);

  const handleCheckForUpdate = () => {
    // Check for updates and update state accordingly
    if (!isUpdating) {
      setIsChecking(true);
      CheckForUpdate()
        .then(setUpdateInfo)
        .finally(() => setTimeout(() => setIsChecking(false), 200));
    }
  };

  const handleUpdate = () => {
    // Perform update based on admin privileges
    setIsUpdating(true);
    const updater = needsAdmin ? UpdateAsAdmin : Update;
    updater(updateInfo.downloadUrl).finally(() => setIsUpdating(false));
  };

  const formatDate = (timestamp: number) => {
    // Format timestamp into readable date string
    const date = new Date(timestamp * 1000);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <SettingsItem disabled={isChecking || isUpdating} vertical>
      <div className="flex justify-between">
        <SettingContent>
          <div className="flex items-center gap-2">
            <RefreshCw
              className={`p-3 -ml-1.5 w-14 h-14 ${
                isChecking || isUpdating ? "animate-spin" : ""
              }`}
            />
            <div className="flex flex-col justify-center">
              <SettingLabel className="flex items-center gap-2">
                {updateInfo.updateAvailable
                  ? t("settings.setting.update.update_available")
                  : t("settings.setting.update.no_updates_available")}
                {lastUpdateCheck && lastUpdateCheck !== 0 && (
                  <SettingDescription>
                    {" (" +
                      t("settings.setting.update.last_checked") +
                      ": " +
                      formatDate(lastUpdateCheck) +
                      ")"}
                  </SettingDescription>
                )}
              </SettingLabel>
              <SettingDescription>
                {updateInfo.updateAvailable && (
                  <div className="flex items-center gap-1">
                    <span className="font-bold">
                      v{updateInfo.currentVersion}
                    </span>
                    <ArrowRight className="-mb-1 w-4 h-4" />
                    {updateInfo.latestVersion}
                  </div>
                )}
                {!updateInfo.updateAvailable && (
                  <span className="font-bold">
                    v{updateInfo.currentVersion}
                  </span>
                )}
                {!updateInfo.updateAvailable && <span>&#8203;</span>}
              </SettingDescription>
            </div>
          </div>
        </SettingContent>
        <div className="flex items-center gap-2">
          {updateInfo.updateAvailable && (
            <Button onClick={handleUpdate}>
              {isUpdating
                ? t("settings.setting.update.updating")
                : t("settings.setting.update.update")}
            </Button>
          )}
          <Button onClick={handleCheckForUpdate}>
            {t("settings.setting.update.check_for_updates")}
          </Button>
        </div>
      </div>
      <div className="p-1.5">
        <SettingLabel>{updateInfo.name}</SettingLabel>
        <SettingDescription className="ml-2">
          {updateInfo.releaseNotes}
        </SettingDescription>
      </div>
    </SettingsItem>
  );
}
