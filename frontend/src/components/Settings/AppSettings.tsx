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
import { Slider } from "../ui/my-slider";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

export function AppSettings() {
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);

  const [useSystemTitleBar, setUseSystemTitleBar] = useState(false);
  const [useScale, setUseScale] = useState(-1);
  const [useOpacity, setUseOpacity] = useState(-1);
  const [useWindowEffect, setUseWindowEffect] = useState("");

  useEffect(() => {
    Promise.all([
      GetConfigField("UseSystemTitleBar"),
      GetConfigField("WindowScale"),
      GetConfigField("Opacity"),
      GetConfigField("WindowEffect"),
    ])
      .then(
        ([
          useSystemTitleBarValue,
          windowScaleValue,
          windowOpacityValue,
          windowEffectValue,
        ]) => {
          setUseSystemTitleBar(useSystemTitleBarValue === "true");
          setUseScale(parseInt(windowScaleValue));
          setUseOpacity(parseInt(windowOpacityValue));
          setUseWindowEffect(windowEffectValue);
          setIsLoading(false); // Mark loading as complete
        }
      )
      .catch((error) => {
        console.error("Error fetching configuration:", error);
        setIsLoading(false); // Handle loading error
      });
  }, []);

  useEffect(() => {
    if (!isLoading) {
      document.documentElement.style.setProperty(
        "--opacity",
        String(Number(useWindowEffect === "1" ? "100" : useOpacity) / 100)
      );
    }
  }, [useWindowEffect]);

  return (
    <SettingsGroup className="flex flex-col items-start px-4 py-2 w-full h-full">
      <SettingsItem loading={isLoading}>
        <div>
          <SettingLabel>
            {t("settings.application.window_effect.label")}
          </SettingLabel>
          <SettingDescription>
            {t("settings.application.window_effect.description") +
              " (" +
              t("settings.restart_the_app_for_changes_to_take_effect") +
              ")"}
          </SettingDescription>
        </div>
        <SettingContent>
          <ToggleGroup type="single" value={useWindowEffect}>
            <ToggleGroupItem
              value="1"
              aria-label="No window effect"
              onClick={() => {
                SetConfigField("WindowEffect", "1").then(() => {
                  setUseWindowEffect("1");
                });
              }}
            >
              {t("settings.application.window_effect.none")}
            </ToggleGroupItem>

            <ToggleGroupItem
              value="0"
              aria-label="Auto window effect"
              onClick={() => {
                SetConfigField("WindowEffect", "0").then(() => {
                  setUseWindowEffect("0");
                });
              }}
            >
              {t("settings.application.window_effect.auto")}
            </ToggleGroupItem>

            <ToggleGroupItem
              value="2"
              aria-label="Mica window effect"
              onClick={() => {
                SetConfigField("WindowEffect", "2").then(() => {
                  setUseWindowEffect("2");
                });
              }}
            >
              {t("settings.application.window_effect.mica")}
            </ToggleGroupItem>

            <ToggleGroupItem
              value="3"
              aria-label="Acrylic window effect"
              onClick={() => {
                SetConfigField("WindowEffect", "3").then(() => {
                  setUseWindowEffect("3");
                });
              }}
            >
              {t("settings.application.window_effect.acrylic")}
            </ToggleGroupItem>

            <ToggleGroupItem
              value="4"
              aria-label="Tabbed window effect"
              onClick={() => {
                SetConfigField("WindowEffect", "4").then(() => {
                  setUseWindowEffect("4");
                });
              }}
            >
              {t("settings.application.window_effect.tabbed")}
            </ToggleGroupItem>
          </ToggleGroup>
        </SettingContent>
      </SettingsItem>

      <SettingsItem
        loading={isLoading}
        vertical={false}
        disabled={useWindowEffect === "1"}
      >
        <div>
          <SettingLabel>
            {t("settings.application.window_opacity.label")}
          </SettingLabel>
          <SettingDescription>
            {t("settings.application.window_opacity.description")}
          </SettingDescription>
        </div>
        <SettingContent>
          <div className="flex gap-2">
            <div>50%</div>
            <Slider
              onValueChange={(value) => {
                setUseOpacity(value[0]);
                document.documentElement.style.setProperty(
                  "--opacity",
                  String(useOpacity / 100)
                );
              }}
              onPointerUp={() => {
                SetConfigField("Opacity", String(useOpacity));
              }}
              defaultValue={[useOpacity]}
              min={50}
              max={100}
              step={1}
              className={"w-64 cursor-pointer"}
            />
            <div>100%</div>
            <div className="w-16 font-bold text-center">({useOpacity}%)</div>
          </div>
        </SettingContent>
      </SettingsItem>

      <SettingsItem loading={isLoading} vertical={false}>
        <div>
          <SettingLabel>
            {t("settings.application.window_scale.label")}
          </SettingLabel>
          <SettingDescription>
            {t("settings.application.window_scale.description")}
          </SettingDescription>
        </div>
        <SettingContent>
          <div className="flex gap-2">
            <div>50%</div>
            <Slider
              onValueChange={(value) => {
                setUseScale(value[0]);
              }}
              onPointerUp={() => {
                document.documentElement.style.fontSize =
                  useScale * (16 / 100) + "px";

                SetConfigField("WindowScale", String(useScale));
              }}
              defaultValue={[useScale]}
              min={50}
              max={150}
              step={10}
              className={"w-64 cursor-pointer"}
            />
            <div>150%</div>
            <div className="w-16 font-bold text-center">({useScale}%)</div>
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
