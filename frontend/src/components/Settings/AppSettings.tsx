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
import { useTranslation } from "react-i18next";

export function AppSettings() {
  const { t } = useTranslation();

  const { theme, setTheme } = useTheme();
  const [useSystemTitleBar, setUseSystemTitleBar] = useState(false);

  useEffect(() => {
    GetUseSystemTitleBar().then((value) => {
      setUseSystemTitleBar(value);
    });
  }, []);

  return (
    <SettingsGroup className="flex flex-col items-start px-4 py-2 w-full h-full">
      <SettingsItem>
        <div>
          <SettingLabel>{t("settings.application.theme.label")}</SettingLabel>
          <SettingDescription>
            {t("settings.application.theme.description")}
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
          <SettingLabel>
            {t("settings.application.use_system_title_bar.label")}
          </SettingLabel>
          <SettingDescription>
            {t("settings.application.use_system_title_bar.description") +
              " (" +
              t("settings.restart_the_app_for_changes_to_take_effect") +
              ")"}
          </SettingDescription>
        </div>
        <SettingContent>
          <Switch
            checked={useSystemTitleBar}
            onCheckedChange={(value) => {
              SetUseSystemTitleBar(value).then(() => {
                setUseSystemTitleBar(value);
              });
            }}
          />
        </SettingContent>
      </SettingsItem>
    </SettingsGroup>
  );
}
