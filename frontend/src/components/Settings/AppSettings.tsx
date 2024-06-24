import {
  GetUseSystemTitleBar,
  SetUseSystemTitleBar,
} from "wailsjs/go/main/App";
import { Moon, Sun, Monitor } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  SettingsGroup,
  SettingsItem,
  SettingContent,
  SettingDescription,
  SettingLabel,
} from "../ui/settings-group";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/contexts/theme-provider";
import { useEffect, useState } from "react";

export function AppSettings() {
  const { theme, setTheme } = useTheme();
  const [useSystemTitleBar, setUseSystemTitleBar] = useState(false);

  useEffect(() => {
    GetUseSystemTitleBar().then((value) => {
      setUseSystemTitleBar(value);
    });
  }, []);

  return (
    <div className="flex items-start px-4 py-2 w-full h-full">
      <SettingsGroup>
        <SettingsItem>
          <div>
            <SettingLabel>Theme</SettingLabel>
            <SettingDescription>
              Choose a color scheme for the interface.
            </SettingDescription>
          </div>
          <SettingContent>
            <ToggleGroup type="single" value={theme}>
              <ToggleGroupItem
                value="system"
                aria-label="Use system theme"
                onClick={() => setTheme("system")}
              >
                <Monitor className="w-4 h-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="light"
                aria-label="Use light theme"
                onClick={() => setTheme("light")}
              >
                <Sun className="w-4 h-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="dark"
                aria-label="Use dark theme"
                onClick={() => setTheme("dark")}
              >
                <Moon className="w-4 h-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </SettingContent>
        </SettingsItem>

        <SettingsItem>
          <div>
            <SettingLabel>System Title Bar</SettingLabel>
            <SettingDescription>
              Switch to the default system title bar instead of the custom one.
              (Restart the app for the change to take effect.)
            </SettingDescription>
          </div>
          <SettingContent>
            <Switch
              checked={useSystemTitleBar}
              onCheckedChange={(value) => {
                SetUseSystemTitleBar(value);
                setUseSystemTitleBar(value);
              }}
            />
          </SettingContent>
        </SettingsItem>
      </SettingsGroup>
    </div>
  );
}
