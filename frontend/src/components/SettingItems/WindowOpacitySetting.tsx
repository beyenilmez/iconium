import { useTranslation } from "react-i18next";
import { SliderConfig } from "./Presets/SliderConfig";

export function WindowOpacitySetting() {
  const { t } = useTranslation();
  return (
    <SliderConfig
      configKey="opacity"
      label={t("settings.setting.window_opacity.label")}
      description={t("settings.setting.window_opacity.description")}
      min={50}
      max={100}
      step={1}
      onChange={(value) => {
        document.documentElement.style.setProperty(
          "--opacity",
          String(value / 100)
        );
      }}
    />
  );
}
