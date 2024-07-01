import { GetConfigField, InitConfigCache } from "@/lib/config";
import ModeToggle from "@/components/ModeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TitleBar from "./components/TitleBar";
import Settings from "./components/Settings";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useStorage } from "./contexts/storage-provider";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { OpenFileInExplorer } from "wailsjs/go/main/App";
import React from "react";

function App() {
  const { t } = useTranslation();
  const { setValue, getValue } = useStorage();
  const [tab, setTab] = useState("packs");

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
    const props = {
      description: t(description),
      action: path
        ? {
            label: path.startsWith("__") ? t("show") : t("show_in_explorer"),
            onClick: () => handleToastGotoPath(path),
          }
        : undefined,
    };
    switch (variant) {
      case "message":
        toast.message(t(title), props);
        break;
      case "success":
        toast.success(t(title), props);
        break;
      case "info":
        toast.info(t(title), props);
        break;
      case "warning":
        toast.warning(t(title), props);
        break;
      case "error":
        toast.error(t(title), props);
        break;
      default:
        toast(t(title), props);
        break;
    }
  };

  const handleToastGotoPath = (path: string) => {
    if (path.startsWith("__")) {
      window.goto(path.substring(2));
    } else {
      OpenFileInExplorer(path);
    }
  };

  window.goto = (path: string) => {
    const pathArray = path.split("__");

    setValue("tab", pathArray[0]);

    for (let i = 0; i < pathArray.length - 1; i++) {
      setValue(pathArray[i], pathArray[i + 1]);
    }
  };

  useEffect(() => {
    setTab(getValue("tab") || "packs");
  }, [getValue("tab")]);

  useEffect(() => {
    setValue("path1", tab);
  }, [tab]);

  return (
    <React.Fragment>
      <div className="flex flex-col h-dvh">
        <TitleBar />
        <Tabs value={tab} className="flex flex-col w-full h-full">
          <TabsList className="shadow-bottom-xs z-10 justify-between px-3 py-7 rounded-none w-full s">
            <div>
              <TabsTrigger value="packs" onClick={() => setTab("packs")}>
                {t("nav.my_packs")}
              </TabsTrigger>
              <TabsTrigger value="edit" onClick={() => setTab("edit")}>
                {t("nav.edit")}
              </TabsTrigger>
              <TabsTrigger value="settings" onClick={() => setTab("settings")}>
                {t("nav.settings")}
              </TabsTrigger>
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
      <Toaster expand />
    </React.Fragment>
  );
}

export default App;
