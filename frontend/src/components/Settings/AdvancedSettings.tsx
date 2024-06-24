import { GetEnableLogging, SetEnableLogging } from "wailsjs/go/main/App";
import {
  SettingsGroup,
  SettingsItem,
  SettingContent,
  SettingDescription,
  SettingLabel,
} from "../ui/settings-group";
import { Switch } from "../ui/switch";
import { useEffect, useState } from "react";

export function AdvancedSettings() {
  const [enableLogging, setEnableLogging] = useState(false);

  useEffect(() => {
    GetEnableLogging().then((value) => {
      setEnableLogging(value);
    });
  }, []);

  return (
    <SettingsGroup className="flex items-start px-4 py-2 w-full h-full">
      <SettingsItem>
        <div>
          <SettingLabel>Logging</SettingLabel>
          <SettingDescription>Enable logging to files.</SettingDescription>
        </div>
        <SettingContent>
          <Switch
            checked={enableLogging}
            onCheckedChange={() => {
              SetEnableLogging(!enableLogging).then(() => {
                setEnableLogging(!enableLogging);
              });
            }}
          />
        </SettingContent>
      </SettingsItem>
    </SettingsGroup>
  );
}
