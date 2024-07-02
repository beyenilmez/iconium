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

export function WindowScaleSetting() {
  const { config, setConfigField } = useConfig();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [useScale, setUseScale] = useState(-1);

  useEffect(() => {
    if (config && config.windowScale !== undefined && isLoading) {
      setUseScale(config.windowScale);

      setIsLoading(false);
    }
  }, [config?.windowScale]);

  const handleScaleSave = () => {
    setConfigField("windowScale", useScale);
    document.documentElement.style.fontSize = useScale * (16 / 100) + "px";
  };

  return (
    <SettingsItem loading={isLoading}>
      <div>
        <SettingLabel>{t("settings.setting.window_scale.label")}</SettingLabel>
        <SettingDescription>
          {t("settings.setting.window_scale.description")}
        </SettingDescription>
      </div>
      <SettingContent>
        <div className="flex gap-2">
          <div>50%</div>
          <Slider
            onValueChange={(value) => setUseScale(value[0])}
            onPointerUp={handleScaleSave}
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
  );
}
