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
import { useStorage } from "@/contexts/storage-provider";

export function WindowOpacitySetting() {
  const { t } = useTranslation();
  const { getValue } = useStorage();

  const [isLoading, setIsLoading] = useState(true);

  const [useOpacity, setUseOpacity] = useState(-1);

  useEffect(() => {
    GetConfigField("Opacity").then((value) => {
      setUseOpacity(parseInt(value));

      setIsLoading(false);
    });
  }, []);

  const handleOpacityChange = (value: number) => {
    document.documentElement.style.setProperty(
      "--opacity",
      String(value / 100)
    );
    setUseOpacity(value);
  };

  const saveOpacityChange = () => {
    SetConfigField("Opacity", useOpacity.toString());
  };

  return (
    <SettingsItem
      loading={isLoading}
      vertical={false}
      disabled={getValue("initialWindowEffect") === "1"}
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
              handleOpacityChange(value[0]);
            }}
            onPointerUp={saveOpacityChange}
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
  );
}
