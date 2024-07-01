import { useEffect, useState } from "react";
import { CheckForUpdate, Update, UpdateAsAdmin } from "wailsjs/go/main/App";
import { main } from "wailsjs/go/models";
import { Button } from "../ui/button";
import {
  SettingContent,
  SettingDescription,
  SettingLabel,
  SettingsItem,
} from "../ui/settings-group";
import { ArrowRight, RefreshCw } from "lucide-react";
import { GetConfigField, NeedsAdminPrivileges } from "wailsjs/go/main/App";
import { t } from "i18next";
import { useStorage } from "@/contexts/storage-provider";

export function UpdateSetting() {
  const { getValue } = useStorage();

  const [updateInfo, setUpdateInfo] = useState<main.UpdateInfo>(
    {} as main.UpdateInfo
  );

  const [lastUpdateCheck, setLastUpdateCheck] = useState(0);
  const [needsAdmin, setNeedsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCheckForUpdate = () => {
    if (!isUpdating) {
      setIsChecking(true);
      CheckForUpdate()
        .then((updateInfoJSON) => {
          setUpdateInfo(updateInfoJSON);
        })
        .finally(() => {
          setTimeout(() => {
            setIsChecking(false);
          }, 200);
        });
    }
  };

  const handleUpdate = () => {
    setIsUpdating(true);

    if (needsAdmin) {
      UpdateAsAdmin(updateInfo.downloadUrl).finally(() => {
        setIsUpdating(false);
      });
    } else {
      Update(updateInfo.downloadUrl).finally(() => {
        setIsUpdating(false);
      });
    }
  };

  useEffect(() => {
    GetConfigField("LastUpdateCheck").then((value) => {
      setLastUpdateCheck(parseInt(value));
    });
  }, [updateInfo]);

  useEffect(() => {
    NeedsAdminPrivileges().then((value) => {
      setNeedsAdmin(value);
    });

    handleCheckForUpdate();
  }, []);

  useEffect(() => {
    if (getValue("update") === undefined) return;

    while (isChecking) setTimeout(() => {}, 100);

    setIsUpdating(true);
    Update(getValue("update")).finally(() => {
      setIsUpdating(false);
    });
  }, [getValue("update")]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <SettingsItem disabled={isChecking || isUpdating} vertical>
      <div className="flex justify-between">
        <SettingContent>
          <div className="flex flex-row te">
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
