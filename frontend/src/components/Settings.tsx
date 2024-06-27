import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { LocaleSetting } from "./SettingItems/LocaleSetting";
import { ThemeSetting } from "./SettingItems/ThemeSetting";
import { SettingsGroup } from "./ui/settings-group";
import { UseSystemTitleBarSetting } from "./SettingItems/UseSystemTitleBarSetting";
import { WindowEffectOpacitySetting } from "./SettingItems/WindowEffectOpacitySetting";
import { WindowScaleSetting } from "./SettingItems/WindowScaleSetting";
import { MaxLogFilesSetting } from "./SettingItems/MaxLogFilesSetting";
import { EnableLoggingSetting } from "./SettingItems/EnableLoggingSetting";
import { LogLevelSetting } from "./SettingItems/LogLevelSetting";

export default function Settings() {
  const { t } = useTranslation();

  return (
    <Tabs defaultValue="general" className="flex flex-row w-full h-full">
      <TabsList className="flex-col justify-start px-2 rounded-none w-fit h-full">
        <TabsTrigger value="general" className="px-12 py-2 w-full">
          {t("settings.categories.general")}
        </TabsTrigger>
        <TabsTrigger value="app" className="px-12 py-2 w-full">
          {t("settings.categories.application")}
        </TabsTrigger>
        <TabsTrigger value="system" className="px-12 py-2 w-full">
          {t("settings.categories.system")}
        </TabsTrigger>
        <TabsTrigger value="advanced" className="px-12 py-2 w-full">
          {t("settings.categories.advanced")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="w-full">
        <SettingsGroup className="flex flex-col items-start px-4 py-2 w-full h-full">
          <LocaleSetting />
          <ThemeSetting />
        </SettingsGroup>
      </TabsContent>
      <TabsContent value="app" className="w-full">
        <SettingsGroup className="flex flex-col items-start px-4 py-2 w-full h-full">
          <ThemeSetting />
          <WindowEffectOpacitySetting />
          <WindowScaleSetting />
          <UseSystemTitleBarSetting />
        </SettingsGroup>
      </TabsContent>
      <TabsContent value="system" className="w-full">
        Edit your system settings here.
      </TabsContent>
      <TabsContent value="advanced" className="w-full">
        <SettingsGroup className="flex flex-col items-start px-4 py-2 w-full h-full">
          <EnableLoggingSetting />
          <LogLevelSetting />
          <MaxLogFilesSetting />
        </SettingsGroup>
      </TabsContent>
    </Tabs>
  );
}
