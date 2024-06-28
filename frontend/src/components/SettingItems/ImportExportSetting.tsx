import {
  GetLoadConfigPath,
  ReadConfig,
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
import { LogDebug, WindowReload } from "wailsjs/runtime/runtime";
import { InitConfigCache } from "@/lib/config";

export function ImportExportSetting() {
  const dialogRef = useRef<AreYouSureDialogRef>(null);
  const [usePath, setUsePath] = useState("");

  return (
    <SettingsItem vertical={false}>
      <div>
        <SettingLabel>Import/Export Settings</SettingLabel>
        <SettingDescription>
          Import or export your settings from/to a JSON file
        </SettingDescription>
      </div>
      <SettingContent>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              GetLoadConfigPath().then((path) => {
                if (path !== "") {
                  setUsePath(path);
                  dialogRef.current?.openDialog();
                }
              });
            }}
          >
            Import
          </Button>
          <AreYouSureDialog
            ref={dialogRef}
            title="Are you sure?"
            description="Are you really sure?"
            cancelText="Cancel"
            acceptText="Yes"
            onAccept={() => {
              LogDebug("Attempting to read config from " + usePath);
              ReadConfig(usePath).then(() => {
                InitConfigCache().then(() => {
                  WindowReload();
                });
              });
            }}
          >
            gdfgdfgdfg
          </AreYouSureDialog>
          <Button onClick={() => SaveConfigDialog()}>Export</Button>
        </div>
      </SettingContent>
    </SettingsItem>
  );
}
