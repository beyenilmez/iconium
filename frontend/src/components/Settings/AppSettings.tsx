import { GetConfigField, SetConfigField } from "wailsjs/go/main/App";
import {
  SettingsGroup,
  SettingsItem,
  SettingContent,
  SettingDescription,
  SettingLabel,
} from "../ui/settings-group";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Slider } from "../ui/slider";

export function AppSettings() {
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);

  const [useSystemTitleBar, setUseSystemTitleBar] = useState(false);
  const [useScale, setUseScale] = useState(-1);

  useEffect(() => {
    Promise.all([
      GetConfigField("UseSystemTitleBar"),
      GetConfigField("WindowScale"),
    ])
      .then(([useSystemTitleBarValue, windowScaleValue]) => {
        setUseSystemTitleBar(useSystemTitleBarValue === "true");
        setUseScale(parseInt(windowScaleValue));
        setIsLoading(false); // Mark loading as complete
      })
      .catch((error) => {
        console.error("Error fetching configuration:", error);
        setIsLoading(false); // Handle loading error
      });
  }, []);

  return (
    <SettingsGroup className="flex flex-col items-start px-4 py-2 w-full h-full">
      <SettingsItem loading={isLoading} vertical={false}>
        <div>
          <SettingLabel>
            {t("settings.application.window_scale.label")}
          </SettingLabel>
          <SettingDescription>
            {t("settings.application.window_scale.description") +
              " (" +
              t("settings.restart_the_app_for_changes_to_take_effect") +
              ")"}
          </SettingDescription>
        </div>
        <SettingContent>
          <div className="flex gap-2">
            50%
            <Slider
              onValueChange={(value) => {
                SetConfigField("WindowScale", String(value)).then(() => {
                  console.log(value[0]);
                  setUseScale(value[0]);
                });
              }}
              defaultValue={[useScale]}
              min={50}
              max={250}
              step={10}
              className={"w-64 cursor-pointer"}
            />
            250% <div className="font-bold">({useScale}%)</div>
          </div>
        </SettingContent>
      </SettingsItem>

      <SettingsItem loading={isLoading}>
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
              SetConfigField("UseSystemTitleBar", String(value)).then(() => {
                setUseSystemTitleBar(value);
              });
            }}
          />
        </SettingContent>
      </SettingsItem>
    </SettingsGroup>
  );
}
