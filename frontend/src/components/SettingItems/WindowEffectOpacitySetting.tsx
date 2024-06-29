import { GetConfigField, SetConfigField } from "@/lib/config";
import {
  SettingsItem,
  SettingContent,
  SettingDescription,
  SettingLabel,
} from "../ui/settings-group";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Slider } from "../ui/my-slider";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { useStorage } from "@/contexts/storage-provider";
import React from "react";

export function WindowEffectOpacitySetting() {
  const { t } = useTranslation();
  const { getValue, setValueIfUndefined } = useStorage();

  const [isLoading, setIsLoading] = useState(true);

  const [useOpacity, setUseOpacity] = useState(-1);
  const [useWindowEffect, setUseWindowEffect] = useState("");

  useEffect(() => {
    Promise.all([GetConfigField("Opacity"), GetConfigField("WindowEffect")])
      .then(([windowOpacityValue, windowEffectValue]) => {
        setUseOpacity(parseInt(windowOpacityValue));
        setUseWindowEffect(windowEffectValue);
        setValueIfUndefined("initialWindowEffect", windowEffectValue);
        setIsLoading(false); // Mark loading as complete
      })
      .catch((error) => {
        console.error("Error fetching configuration:", error);
        setIsLoading(false); // Handle loading error
      });
  }, []);

  useEffect(() => {
    if (!isLoading) {
      document.documentElement.style.setProperty(
        "--opacity",
        String(
          Number(
            useWindowEffect === "1" || getValue("initialWindowEffect") === "1"
              ? "100"
              : useOpacity
          ) / 100
        )
      );
    }
  }, [useWindowEffect]);

  return (
    <React.Fragment>
      <SettingsItem
        loading={isLoading}
        name="WindowEffect"
        initialValue={getValue("initialWindowEffect")}
        value={useWindowEffect}
      >
        <div>
          <SettingLabel>
            {t("settings.setting.window_effect.label")}
          </SettingLabel>
          <SettingDescription>
            {t("settings.setting.window_effect.description") +
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
              {t("settings.setting.window_effect.none")}
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
              {t("settings.setting.window_effect.auto")}
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
              {t("settings.setting.window_effect.mica")}
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
              {t("settings.setting.window_effect.acrylic")}
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
              {t("settings.setting.window_effect.tabbed")}
            </ToggleGroupItem>
          </ToggleGroup>
        </SettingContent>
      </SettingsItem>

      <SettingsItem
        loading={isLoading}
        vertical={false}
        disabled={
          useWindowEffect === "1" || getValue("initialWindowEffect") === "1"
        }
      >
        <div>
          <SettingLabel>
            {t("settings.setting.window_opacity.label")}
          </SettingLabel>
          <SettingDescription>
            {t("settings.setting.window_opacity.description")}
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
                  String(
                    (useWindowEffect === "1" ||
                    getValue("initialWindowEffect") === "1"
                      ? 100
                      : useOpacity) / 100
                  )
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
    </React.Fragment>
  );
}
