import { GetConfigField, InitConfigCache } from "@/lib/config";
import { ThemeProvider } from "./contexts/theme-provider";
import ModeToggle from "@/components/ModeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TitleBar from "./components/TitleBar";
import Settings from "./components/Settings";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { StorageProvider } from "./contexts/storage-provider";
import { Toaster } from "./components/ui/toaster";
import { useToast } from "./components/ui/use-toast";
import { ToastAction } from "@radix-ui/react-toast";
import { Button } from "./components/ui/button";
import { OpenFileInExplorer } from "wailsjs/go/main/App";

function App() {
  const { t } = useTranslation();
  const { toast } = useToast();

  useEffect(() => {
    InitConfigCache();

    Promise.all([
      GetConfigField("WindowScale"),
      GetConfigField("Opacity"),
      GetConfigField("WindowEffect"),
    ])
      .then(([windowScaleValue, opacityValue, windowEffectValue]) => {
        document.documentElement.style.fontSize =
          Number(windowScaleValue) * (16 / 100) + "px";
        document.documentElement.style.setProperty(
          "--opacity",
          String(Number(windowEffectValue === "1" ? "100" : opacityValue) / 100)
        );
      })
      .catch((error) => {
        console.error("Error fetching configuration:", error);
      });
  }, []);

  window.toast = ({ title, description, path, variant }: any) => {
    toast({
      title: t(title),
      description: t(description),
      action: path ? (
        <ToastAction altText={t("show_in_explorer")} asChild>
          <Button onClick={() => OpenFileInExplorer(path)}>
            {t("show_in_explorer")}
          </Button>
        </ToastAction>
      ) : undefined,
      variant: variant,
    });
  };

  return (
    <ThemeProvider defaultTheme="system">
      <StorageProvider>
        <div className="flex flex-col h-dvh">
          <TitleBar />
          <Tabs defaultValue="packs" className="flex flex-col w-full h-full">
            <TabsList className="shadow-bottom-xs z-10 justify-between px-3 py-7 rounded-none w-full s">
              <div>
                <TabsTrigger value="packs">{t("nav.my_packs")}</TabsTrigger>
                <TabsTrigger value="edit">{t("nav.edit")}</TabsTrigger>
                <TabsTrigger value="settings">{t("nav.settings")}</TabsTrigger>
              </div>
              <ModeToggle />
            </TabsList>

            <TabsContent value="packs" className="w-ful h-full">
              View your packs here.
            </TabsContent>
            <TabsContent value="edit" className="w-ful h-full">
              Edit your packs here.
            </TabsContent>
            <TabsContent value="settings" className="w-ful h-full">
              <Settings />
            </TabsContent>
          </Tabs>
        </div>
        <Toaster />
      </StorageProvider>
    </ThemeProvider>
  );
}

export default App;
