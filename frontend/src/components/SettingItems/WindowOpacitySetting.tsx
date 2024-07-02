import {
  SettingsItem,
  SettingContent,
  SettingDescription,
  SettingLabel,
} from "../ui/settings-group";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Slider } from "../ui/my-slider";
import { useConfig } from "@/contexts/config-provider";

export function WindowOpacitySetting() {
  const { config, initialConfig, setConfigField } = useConfig();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [useOpacity, setUseOpacity] = useState(-1);

  useEffect(() => {
    if (config && config.opacity !== undefined && isLoading) {
      setUseOpacity(config.opacity);

      setIsLoading(false);
    }
  }, [config?.opacity]);

  const handleOpacityChange = (value: number) => {
    document.documentElement.style.setProperty(
      "--opacity",
      String(value / 100)
    );
    setUseOpacity(value);
  };

  const saveOpacityChange = () => {
    setConfigField("opacity", useOpacity);
  };

  return (
    <SettingsItem
      loading={isLoading}
      vertical={false}
      disabled={initialConfig?.windowEffect === 1}
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
