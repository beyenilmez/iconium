import { GetConfigField } from "wailsjs/go/main/App";
import {
  WindowMinimise,
  WindowToggleMaximise,
  Quit,
} from "wailsjs/runtime/runtime";
import { Minus, Copy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import icon from "../assets/appicon.png";
import { useEffect, useState } from "react";

export default function TitleBar() {
  const [useSystemTitleBar, setUseSystemTitleBar] = useState(false);

  useEffect(() => {
    GetConfigField("UseSystemTitleBar").then((value) => {
      setUseSystemTitleBar(value === "true");
    });
  }, []);

  return (
    !useSystemTitleBar && (
      <header
        className="flex justify-between items-center bg-muted pl-3 w-full h-8 wails-drag"
        onDoubleClick={() => WindowToggleMaximise()}
      >
        <h1 className="flex gap-1 mt-2.5 font-semibold select-none">
          <img src={icon} className="w-6 h-6" />
          {document.title}
        </h1>
        <div className="wails-nodrag">
          <Button
            size={"icon"}
            onClick={() => WindowMinimise()}
            variant={"ghost"}
            className="hover:dark:brightness-150 hover:brightness-75 rounded-none h-8 cursor-default"
          >
            <Minus size={"1rem"} />
          </Button>
          <Button
            size={"icon"}
            onClick={() => WindowToggleMaximise()}
            variant={"ghost"}
            className="hover:dark:brightness-150 hover:brightness-75 rounded-none h-8 cursor-default"
          >
            <Copy size={"1rem"} className="rotate-90" />
          </Button>
          <Button
            size={"icon"}
            onClick={() => Quit()}
            variant={"ghost"}
            className="hover:bg-destructive rounded-none h-8 cursor-default"
          >
            <X size={"1rem"} />
          </Button>
        </div>
      </header>
    )
  );
}
