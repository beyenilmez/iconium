import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppSettings } from "./Settings/AppSettings";

export default function Settings() {
  return (
    <Tabs defaultValue="general" className="flex flex-row w-full h-full">
      <TabsList className="flex-col justify-start px-2 rounded-none w-fit h-full">
        <TabsTrigger value="general" className="px-12 py-2 w-full">
          General
        </TabsTrigger>
        <TabsTrigger value="app" className="px-12 py-2 w-full">
          Application
        </TabsTrigger>
        <TabsTrigger value="system" className="px-12 py-2 w-full">
          System
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="w-full">
        Edit your general settings here.
      </TabsContent>
      <TabsContent value="app" className="w-full">
        <AppSettings />
      </TabsContent>
      <TabsContent value="system" className="w-full">
        Edit your system settings here.
      </TabsContent>
    </Tabs>
  );
}
