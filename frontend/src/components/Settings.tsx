import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { LocaleSetting } from "./SettingItems/LocaleSetting";
import { ThemeSetting } from "./SettingItems/ThemeSetting";
import { SettingsGroup } from "./ui/settings-group";
import { UseSystemTitleBarSetting } from "./SettingItems/UseSystemTitleBarSetting";
import { WindowScaleSetting } from "./SettingItems/WindowScaleSetting";
import { MaxLogFilesSetting } from "./SettingItems/MaxLogFilesSetting";
import { EnableLoggingSetting } from "./SettingItems/EnableLoggingSetting";
import { LogLevelSetting } from "./SettingItems/LogLevelSetting";
import { ImportExportSetting } from "./SettingItems/ImportExportSetting";
import { WindowEffectSetting } from "./SettingItems/WindowEffectSetting";
import { WindowOpacitySetting } from "./SettingItems/WindowOpacitySetting";
import { SaveWindowStatusSetting } from "./SettingItems/SaveWindowStatusSetting";
import { CheckForUpdatesSetting } from "./SettingItems/CheckForUpdatesSetting";
import { UpdateSetting } from "./SettingItems/UpdateSetting";

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
        <TabsTrigger value="update" className="px-12 py-2 w-full">
          {t("settings.categories.update")}
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
          <WindowEffectSetting />
          <WindowOpacitySetting />
          <WindowScaleSetting />
          <UseSystemTitleBarSetting />
          <SaveWindowStatusSetting />
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
          <ImportExportSetting />
        </SettingsGroup>
      </TabsContent>
      <TabsContent value="update" className="w-full">
        <SettingsGroup className="flex flex-col items-start px-4 py-2 w-full h-full">
          <CheckForUpdatesSetting />
          <UpdateSetting />
        </SettingsGroup>
      </TabsContent>
    </Tabs>
  );
}
