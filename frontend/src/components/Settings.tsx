import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppSettings } from "./Settings/AppSettings";
import { AdvancedSettings } from "./Settings/AdvancedSettings";
import { useTranslation } from "react-i18next";
import { GeneralSettings } from "./Settings/GeneralSettings";

export default function Settings() {
  const { t } = useTranslation();

  return (
    <Tabs defaultValue="general" className="flex flex-row w-full h-full">
      <TabsList className="flex-col justify-start px-2 rounded-none w-fit h-full">
        <TabsTrigger value="general" className="px-12 py-2 w-full">
          {t("settings.general.label")}
        </TabsTrigger>
        <TabsTrigger value="app" className="px-12 py-2 w-full">
          {t("settings.application.label")}
        </TabsTrigger>
        <TabsTrigger value="system" className="px-12 py-2 w-full">
          {t("settings.system.label")}
        </TabsTrigger>
        <TabsTrigger value="advanced" className="px-12 py-2 w-full">
          {t("settings.advanced.label")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="w-full">
        <GeneralSettings />
      </TabsContent>
      <TabsContent value="app" className="w-full">
        <AppSettings />
      </TabsContent>
      <TabsContent value="system" className="w-full">
        Edit your system settings here.
      </TabsContent>
      <TabsContent value="advanced" className="w-full">
        <AdvancedSettings />
      </TabsContent>
    </Tabs>
  );
}
